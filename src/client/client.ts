/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { nanoid } from 'nanoid/non-secure';
import type { Dispatch, StoreEnhancer } from 'redux';
import { createStore, compose, applyMiddleware } from 'redux';
import * as Actions from '../core/action-types';
import * as ActionCreators from '../core/action-creators';
import { ProcessGameConfig } from '../core/game';
import type { Component } from 'svelte';
import {
  CreateGameReducer,
  TransientHandlingMiddleware,
} from '../core/reducer';
import { InitializeGame } from '../core/initialize';
import { PlayerView } from '../plugins/main';
import type { Transport, TransportOpts } from './transport/transport';
import { DummyTransport } from './transport/dummy';
import { ClientManager } from './manager';
import type { TransportData } from '../master/master';
import type {
  ActionError,
  ActivePlayersArg,
  ActionShape,
  CredentialedActionShape,
  FilteredMetadata,
  Game,
  LogEntry,
  PlayerID,
  Reducer,
  State,
  Store,
  TransientState,
  ChatMessage,
} from '../types';

type ClientAction =
  ActionShape.Reset | ActionShape.Sync | ActionShape.Update | ActionShape.Patch;
type Action =
  CredentialedActionShape.Any | ActionShape.StripTransients | ClientAction;

export interface DebugOpt {
  target?: HTMLElement;
  impl?: Component;
  collapseOnLoad?: boolean;
  hideToggleButton?: boolean;
}

/**
 * Global client manager instance that all clients register with.
 */
const GlobalClientManager = new ClientManager();

/**
 * Standardise the passed playerID, using currentPlayer if appropriate.
 */
function assumedPlayerID(
  playerID: PlayerID | null | undefined,
  store: Store,
  multiplayer?: unknown,
): PlayerID {
  // In singleplayer mode, if the client does not have a playerID
  // associated with it, we attach the currentPlayer as playerID.
  if (!multiplayer && (playerID === null || playerID === undefined)) {
    const state = store.getState();
    playerID = state.ctx.currentPlayer;
  }

  return playerID;
}

/**
 * createDispatchers
 *
 * Create action dispatcher wrappers with bound playerID and credentials
 */
function createDispatchers(
  storeActionType: 'makeMove' | 'gameEvent' | 'plugin',
  innerActionNames: string[],
  store: Store,
  playerID: PlayerID,
  credentials: string,
  multiplayer?: unknown,
) {
  const dispatchers: Record<string, (...args: any[]) => void> = {};
  for (const name of innerActionNames) {
    dispatchers[name] = (...args) => {
      const action = ActionCreators[storeActionType](
        name,
        args,
        assumedPlayerID(playerID, store, multiplayer),
        credentials,
      );
      store.dispatch(action);
    };
  }
  return dispatchers;
}

// Creates a set of dispatchers to make moves.
export const createMoveDispatchers = createDispatchers.bind(null, 'makeMove');
// Creates a set of dispatchers to dispatch game flow events.
export const createEventDispatchers = createDispatchers.bind(null, 'gameEvent');
// Creates a set of dispatchers to dispatch actions to plugins.
export const createPluginDispatchers = createDispatchers.bind(null, 'plugin');

export interface ClientOpts<
  G extends any = any,
  PluginAPIs extends Record<string, unknown> = Record<string, unknown>,
> {
  game: Game<G, PluginAPIs>;
  debug?: DebugOpt | boolean;
  numPlayers?: number;
  multiplayer?: (opts: TransportOpts) => Transport;
  matchID?: string;
  playerID?: PlayerID;
  credentials?: string;
  enhancer?: StoreEnhancer;
}

export type ClientState<G extends any = any> =
  | null
  | (State<G> & {
      isActive: boolean;
      isConnected: boolean;
      log: LogEntry[];
    });

/**
 * Implementation of Client (see below).
 */
export class _ClientImpl<
  G extends any = any,
  PluginAPIs extends Record<string, unknown> = Record<string, unknown>,
> {
  private previewStateData?: any;
  private initialState: State<G>;
  readonly multiplayer: (opts: TransportOpts) => Transport;
  private reducer: Reducer;
  private _running: boolean;
  private subscribers: Map<
    symbol,
    (state: State<G> | null, error?: ActionError) => void
  >;
  private transport: Transport;
  private manager: ClientManager;
  readonly debugOpt?: DebugOpt | boolean;
  readonly game: ReturnType<typeof ProcessGameConfig>;
  readonly store: Store;
  log: State['deltalog'];
  matchID: string;
  playerID: PlayerID | null;
  credentials: string;
  matchData?: FilteredMetadata;
  moves: Record<string, (...args: any[]) => void>;
  events: {
    endGame?: (gameover?: any) => void;
    endPhase?: () => void;
    endTurn?: (arg?: { next: PlayerID }) => void;
    setPhase?: (newPhase: string) => void;
    endStage?: () => void;
    setStage?: (newStage: string) => void;
    setActivePlayers?: (arg: ActivePlayersArg) => void;
  };
  plugins: Record<string, (...args: any[]) => void>;
  reset: () => void;
  undo: () => void;
  redo: () => void;
  sendChatMessage: (message: any) => void;
  chatMessages: ChatMessage[];
  /**
   * Why this client’s most recent action was rejected, or undefined.
   * Cleared when a subsequent action succeeds.
   */
  lastActionError?: ActionError;
  /**
   * Count of action errors delivered via receiveActionError. Lets
   * SubscriptionMiddleware detect a rejection that a synchronous transport
   * delivered during `next(action)` and avoid clearing it on the same pass.
   */
  private actionErrorDeliveries = 0;

  constructor({
    game,
    debug,
    numPlayers,
    multiplayer,
    matchID: matchID,
    playerID,
    credentials,
    enhancer,
  }: ClientOpts<G, PluginAPIs>) {
    this.game = ProcessGameConfig(game);
    this.playerID = playerID;
    this.matchID = matchID || 'default';
    this.credentials = credentials;
    this.multiplayer = multiplayer;
    this.debugOpt = debug;
    this.manager = GlobalClientManager;
    this.previewStateData = null;
    this.subscribers = new Map();
    this._running = false;

    this.reducer = CreateGameReducer({
      game: this.game,
      isClient: multiplayer !== undefined,
    });

    this.initialState = null;
    if (!multiplayer) {
      this.initialState = InitializeGame({ game: this.game, numPlayers });
    }

    this.reset = () => {
      this.store.dispatch(ActionCreators.reset(this.initialState));
    };
    this.undo = () => {
      const undo = ActionCreators.undo(
        assumedPlayerID(this.playerID, this.store, this.multiplayer),
        this.credentials,
      );
      this.store.dispatch(undo);
    };
    this.redo = () => {
      const redo = ActionCreators.redo(
        assumedPlayerID(this.playerID, this.store, this.multiplayer),
        this.credentials,
      );
      this.store.dispatch(redo);
    };

    this.log = [];

    /**
     * Middleware that manages the log object.
     * Reducers generate deltalogs, which are log events
     * that are the result of application of a single action.
     * The master may also send back a deltalog or the entire
     * log depending on the type of request.
     * The middleware below takes care of all these cases while
     * managing the log object.
     */
    const LogMiddleware =
      (store: Store) => (next: Dispatch<Action>) => (action: Action) => {
        const result = next(action);
        const state = store.getState();

        switch (action.type) {
          case Actions.MAKE_MOVE:
          case Actions.GAME_EVENT:
          case Actions.UNDO:
          case Actions.REDO: {
            const deltalog = state.deltalog;
            this.log = [...this.log, ...deltalog];
            break;
          }

          case Actions.RESET: {
            this.log = [];
            break;
          }
          case Actions.PATCH:
          case Actions.UPDATE: {
            let id = -1;
            if (this.log.length > 0) {
              id = this.log.at(-1)._stateID;
            }

            let deltalog = action.deltalog || [];

            // Filter out actions that are already present
            // in the current log. This may occur when the
            // client adds an entry to the log followed by
            // the update from the master here.
            deltalog = deltalog.filter((l) => l._stateID > id);

            this.log = [...this.log, ...deltalog];
            break;
          }

          case Actions.SYNC: {
            this.initialState = action.initialState;
            this.log = action.log || [];
            break;
          }
        }

        return result;
      };

    /**
     * Middleware that intercepts actions and sends them to the master,
     * which keeps the authoritative version of the state.
     */
    const TransportMiddleware =
      (store: Store) => (next: Dispatch<Action>) => (action: Action) => {
        const baseState = store.getState();
        const result = next(action);

        if (
          !('clientOnly' in action) &&
          action.type !== Actions.STRIP_TRANSIENTS
        ) {
          this.transport.sendAction(baseState, action);
        }

        return result;
      };

    /**
     * Middleware that intercepts actions and invokes the subscription callback.
     * Also tracks action errors: the store still holds this action's transients
     * here (TransientHandlingMiddleware strips them after we run), and the
     * deliveries counter keeps the clear-on-success branch from wiping an
     * error that a synchronous transport delivered during `next(action)`.
     */
    const SubscriptionMiddleware =
      (store: Store) => (next: Dispatch<Action>) => (action: Action) => {
        const deliveriesBefore = this.actionErrorDeliveries;
        const result = next(action);
        if (action.type !== Actions.STRIP_TRANSIENTS) {
          const transientError = (store.getState() as TransientState<G> | null)
            ?.transients?.error;
          if (transientError) {
            this.lastActionError = transientError;
          } else if (
            (action.type === Actions.MAKE_MOVE ||
              action.type === Actions.GAME_EVENT ||
              action.type === Actions.UNDO ||
              action.type === Actions.REDO) &&
            this.actionErrorDeliveries === deliveriesBefore
          ) {
            this.lastActionError = undefined;
          }
        }
        this.notifySubscribers();
        return result;
      };

    const middleware = applyMiddleware(
      TransientHandlingMiddleware,
      SubscriptionMiddleware,
      TransportMiddleware,
      LogMiddleware,
    );

    enhancer = (
      enhancer === undefined ? middleware : compose(middleware, enhancer)
    ) as StoreEnhancer;

    this.store = createStore(this.reducer, this.initialState, enhancer);

    if (!multiplayer) multiplayer = DummyTransport;
    this.transport = multiplayer({
      transportDataCallback: (data) => this.receiveTransportData(data),
      gameKey: game,
      game: this.game,
      matchID,
      playerID,
      credentials,
      gameName: this.game.name,
      numPlayers,
    });

    this.createDispatchers();

    this.chatMessages = [];
    this.sendChatMessage = (payload) => {
      this.transport.sendChatMessage(this.matchID, {
        id: nanoid(7),
        sender: this.playerID,
        payload: payload,
      });
    };
  }

  /** Handle incoming match data from a multiplayer transport. */
  private receiveMatchData(matchData: FilteredMetadata): void {
    this.matchData = matchData;
    this.notifySubscribers();
  }

  /** Handle an incoming chat message from a multiplayer transport. */
  private receiveChatMessage(message: ChatMessage): void {
    this.chatMessages = [...this.chatMessages, message];
    this.notifySubscribers();
  }

  /** Handle an action error sent to this client by a multiplayer master. */
  private receiveActionError(error: ActionError): void {
    this.actionErrorDeliveries++;
    this.lastActionError = error;
    this.notifySubscribers();
  }

  /** Handle all incoming updates from a multiplayer transport. */
  private receiveTransportData(data: TransportData): void {
    const [matchID] = data.args;
    if (matchID !== this.matchID) return;
    switch (data.type) {
      case 'sync': {
        const [, syncInfo] = data.args;
        const action = ActionCreators.sync(syncInfo);
        this.receiveMatchData(syncInfo.filteredMetadata);
        this.store.dispatch(action);
        break;
      }
      case 'update': {
        const [, state, deltalog] = data.args;
        const currentState = this.store.getState();
        if (state._stateID >= currentState._stateID) {
          const action = ActionCreators.update(state, deltalog);
          this.store.dispatch(action);
        }
        break;
      }
      case 'patch': {
        const [, prevStateID, stateID, patch, deltalog] = data.args;
        const currentStateID = this.store.getState()._stateID;
        if (prevStateID !== currentStateID) break;
        const action = ActionCreators.patch(
          prevStateID,
          stateID,
          patch,
          deltalog,
        );
        this.store.dispatch(action);
        // Emit sync if patch apply failed.
        if (this.store.getState()._stateID === currentStateID) {
          this.transport.requestSync();
        }
        break;
      }
      case 'matchData': {
        const [, matchData] = data.args;
        this.receiveMatchData(matchData);
        break;
      }
      case 'chat': {
        const [, chatMessage] = data.args;
        this.receiveChatMessage(chatMessage);
        break;
      }
      case 'actionError': {
        const [, error] = data.args;
        this.receiveActionError(error);
        break;
      }
    }
  }

  private notifySubscribers() {
    this.subscribers.forEach((fn) => fn(this.getState(), this.lastActionError));
  }

  previewState(state: any) {
    this.previewStateData = state;
    this.notifySubscribers();
  }

  /**
   * Replace the current game state with a saved state and continue playing.
   * Unlike previewState, this updates the Redux store so that moves,
   * events, and undo/redo work against the loaded state.
   * Clears the log since we're starting from a new point in time.
   */
  loadState(state: State<G>) {
    // Clear any active preview
    this.previewStateData = null;

    // Replace the store state via UPDATE action
    this.store.dispatch(ActionCreators.update(state, []));

    // Reset the log to prevent stale history
    this.log = [];
  }

  start() {
    this.transport.connect();
    this._running = true;
    this.manager.register(this);
  }

  stop() {
    this.transport.disconnect();
    this._running = false;
    this.manager.unregister(this);
  }

  subscribe(fn: (state: ClientState<G>, error?: ActionError) => void) {
    const id = Symbol();
    this.subscribers.set(id, fn);
    this.transport.subscribeToConnectionStatus(() => this.notifySubscribers());

    if (this._running || !this.multiplayer) {
      fn(this.getState(), this.lastActionError);
    }

    // Return a handle that allows the caller to unsubscribe.
    return () => {
      this.subscribers.delete(id);
    };
  }

  getInitialState() {
    return this.initialState;
  }

  getState(): ClientState<G> {
    let state = this.store.getState();

    if (this.previewStateData !== null && this.previewStateData !== undefined) {
      state = this.previewStateData;
    }

    // This is the state before a sync with the game master.
    if (state === null) {
      return state as null;
    }

    // isActive.

    let isActive = true;

    const isPlayerActive = this.game.flow.isPlayerActive(
      state.G,
      state.ctx,
      this.playerID,
    );

    if (this.multiplayer && !isPlayerActive) {
      isActive = false;
    }

    if (
      !this.multiplayer &&
      this.playerID !== null &&
      this.playerID !== undefined &&
      !isPlayerActive
    ) {
      isActive = false;
    }

    if (state.ctx.gameover !== undefined) {
      isActive = false;
    }

    // Secrets are normally stripped on the server,
    // but we also strip them here so that game developers
    // can see their effects while prototyping.
    // Do not strip again if this is a multiplayer game
    // since the server has already stripped secret info. (issue #818)
    if (!this.multiplayer) {
      state = {
        ...state,
        G: this.game.playerView({
          G: state.G,
          ctx: state.ctx,
          playerID: this.playerID,
        }),
        plugins: PlayerView(state, this),
      };
    }

    // Combine into return value.
    return {
      ...state,
      log: this.log,
      isActive,
      isConnected: this.transport.isConnected,
    };
  }

  private createDispatchers() {
    this.moves = createMoveDispatchers(
      this.game.moveNames,
      this.store,
      this.playerID,
      this.credentials,
      this.multiplayer,
    );

    this.events = createEventDispatchers(
      this.game.flow.enabledEventNames,
      this.store,
      this.playerID,
      this.credentials,
      this.multiplayer,
    );

    this.plugins = createPluginDispatchers(
      this.game.pluginNames,
      this.store,
      this.playerID,
      this.credentials,
      this.multiplayer,
    );
  }

  updatePlayerID(playerID: PlayerID | null) {
    this.playerID = playerID;
    this.createDispatchers();
    this.transport.updatePlayerID(playerID);
    this.notifySubscribers();
  }

  updateMatchID(matchID: string) {
    this.matchID = matchID;
    this.createDispatchers();
    this.transport.updateMatchID(matchID);
    this.notifySubscribers();
  }

  updateCredentials(credentials: string) {
    this.credentials = credentials;
    this.createDispatchers();
    this.transport.updateCredentials(credentials);
    this.notifySubscribers();
  }
}

/**
 * Client
 *
 * boardgame.io JS client.
 *
 * @param {...object} game - The return value of `Game`.
 * @param {...object} numPlayers - The number of players.
 * @param {...object} multiplayer - Set to a falsy value or a transportFactory, e.g., SocketIO()
 * @param {...object} matchID - The matchID that you want to connect to.
 * @param {...object} playerID - The playerID associated with this client.
 * @param {...string} credentials - The authentication credentials associated with this client.
 *
 * Returns:
 *   A JS object that provides an API to interact with the
 *   game by dispatching moves and events.
 */
export function Client<
  G extends any = any,
  PluginAPIs extends Record<string, unknown> = Record<string, unknown>,
>(opts: ClientOpts<G, PluginAPIs>) {
  return new _ClientImpl<G, PluginAPIs>(opts);
}
