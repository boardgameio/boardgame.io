/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import 'svelte';
import {
  Dispatch,
  StoreEnhancer,
  createStore,
  compose,
  applyMiddleware,
} from 'redux';
import * as Actions from '../core/action-types';
import * as ActionCreators from '../core/action-creators';
import { ProcessGameConfig } from '../core/game';
import Debug from './debug/Debug.svelte';
import { CreateGameReducer } from '../core/reducer';
import { InitializeGame } from '../core/initialize';
import { Transport, TransportOpts } from './transport/transport';
import { ClientManager } from './manager';
import {
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
  Ctx,
} from '../types';

type ClientAction = ActionShape.Reset | ActionShape.Sync | ActionShape.Update;
type Action = CredentialedActionShape.Any | ClientAction;

export interface DebugOpt {
  target?: HTMLElement;
  impl?: typeof Debug;
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
  multiplayer?: unknown
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
  multiplayer?: unknown
) {
  return innerActionNames.reduce((dispatchers, name) => {
    dispatchers[name] = function(...args: any[]) {
      store.dispatch(
        ActionCreators[storeActionType](
          name,
          args,
          assumedPlayerID(playerID, store, multiplayer),
          credentials
        )
      );
    };

    return dispatchers;
  }, {} as Record<string, (...args: any[]) => void>);
}

// Creates a set of dispatchers to make moves.
export const createMoveDispatchers = createDispatchers.bind(null, 'makeMove');
// Creates a set of dispatchers to dispatch game flow events.
export const createEventDispatchers = createDispatchers.bind(null, 'gameEvent');
// Creates a set of dispatchers to dispatch actions to plugins.
export const createPluginDispatchers = createDispatchers.bind(null, 'plugin');

export interface ClientOpts<
  G extends any = any,
  CtxWithPlugins extends Ctx = Ctx
> {
  game: Game<G, CtxWithPlugins>;
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
export class _ClientImpl<G extends any = any> {
  private gameStateOverride?: any;
  private initialState: State<G>;
  readonly multiplayer: (opts: TransportOpts) => Transport;
  private reducer: Reducer;
  private _running: boolean;
  private subscribers: Record<string, (state: State<G> | null) => void>;
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

  constructor({
    game,
    debug,
    numPlayers,
    multiplayer,
    matchID: matchID,
    playerID,
    credentials,
    enhancer,
  }: ClientOpts) {
    this.game = ProcessGameConfig(game);
    this.playerID = playerID;
    this.matchID = matchID;
    this.credentials = credentials;
    this.multiplayer = multiplayer;
    this.debugOpt = debug;
    this.manager = GlobalClientManager;
    this.gameStateOverride = null;
    this.subscribers = {};
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
        this.credentials
      );
      this.store.dispatch(undo);
    };
    this.redo = () => {
      const redo = ActionCreators.redo(
        assumedPlayerID(this.playerID, this.store, this.multiplayer),
        this.credentials
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
    const LogMiddleware = (store: Store) => (next: Dispatch<Action>) => (
      action: Action
    ) => {
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

        case Actions.UPDATE: {
          let id = -1;
          if (this.log.length > 0) {
            id = this.log[this.log.length - 1]._stateID;
          }

          let deltalog = action.deltalog || [];

          // Filter out actions that are already present
          // in the current log. This may occur when the
          // client adds an entry to the log followed by
          // the update from the master here.
          deltalog = deltalog.filter(l => l._stateID > id);

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
    const TransportMiddleware = (store: Store) => (next: Dispatch<Action>) => (
      action: Action
    ) => {
      const baseState = store.getState();
      const result = next(action);

      if (!('clientOnly' in action)) {
        this.transport.onAction(baseState, action);
      }

      return result;
    };

    /**
     * Middleware that intercepts actions and invokes the subscription callback.
     */
    const SubscriptionMiddleware = () => (next: Dispatch<Action>) => (
      action: Action
    ) => {
      const result = next(action);
      this.notifySubscribers();
      return result;
    };

    if (enhancer !== undefined) {
      enhancer = compose(
        applyMiddleware(
          SubscriptionMiddleware,
          TransportMiddleware,
          LogMiddleware
        ),
        enhancer
      );
    } else {
      enhancer = applyMiddleware(
        SubscriptionMiddleware,
        TransportMiddleware,
        LogMiddleware
      );
    }

    this.store = createStore(this.reducer, this.initialState, enhancer);

    this.transport = ({
      isConnected: true,
      onAction: () => {},
      subscribe: () => {},
      subscribeMatchData: () => {},
      connect: () => {},
      disconnect: () => {},
      updateMatchID: () => {},
      updatePlayerID: () => {},
    } as unknown) as Transport;

    if (multiplayer) {
      // typeof multiplayer is 'function'
      this.transport = multiplayer({
        gameKey: game,
        game: this.game,
        store: this.store,
        matchID,
        playerID,
        gameName: this.game.name,
        numPlayers,
      });
    }

    this.createDispatchers();

    this.transport.subscribeMatchData(metadata => {
      this.matchData = metadata;
    });
  }

  private notifySubscribers() {
    Object.values(this.subscribers).forEach(fn => fn(this.getState()));
  }

  overrideGameState(state: any) {
    this.gameStateOverride = state;
    this.notifySubscribers();
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

  subscribe(fn: (state: ClientState<G>) => void) {
    const id = Object.keys(this.subscribers).length;
    this.subscribers[id] = fn;
    this.transport.subscribe(() => this.notifySubscribers());

    if (this._running || !this.multiplayer) {
      fn(this.getState());
    }

    // Return a handle that allows the caller to unsubscribe.
    return () => {
      delete this.subscribers[id];
    };
  }

  getInitialState() {
    return this.initialState;
  }

  getState(): ClientState<G> {
    let state = this.store.getState();

    if (this.gameStateOverride !== null) {
      state = this.gameStateOverride;
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
      this.playerID
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
    const G = this.multiplayer
      ? state.G
      : this.game.playerView(state.G, state.ctx, this.playerID);

    // Combine into return value.
    return {
      ...state,
      G,
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
      this.multiplayer
    );

    this.events = createEventDispatchers(
      this.game.flow.enabledEventNames,
      this.store,
      this.playerID,
      this.credentials,
      this.multiplayer
    );

    this.plugins = createPluginDispatchers(
      this.game.pluginNames,
      this.store,
      this.playerID,
      this.credentials,
      this.multiplayer
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
export function Client<G extends any = any>(opts: ClientOpts<G>) {
  return new _ClientImpl<G>(opts);
}
