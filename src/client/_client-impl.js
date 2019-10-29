import * as ActionCreators from '../core/action-creators';
import { Game } from '../core/game';
import { CreateGameReducer } from '../core/reducer';
import { InitializeGame } from '../core/initialize';
import * as Actions from '../core/action-types';
import { applyMiddleware, compose, createStore } from 'redux';
import { error } from '../core/logger';
import Debug from './debug/Debug.svelte';

/**
 * createDispatchers
 *
 * Create action dispatcher wrappers with bound playerID and credentials
 */
function createDispatchers(
  storeActionType,
  innerActionNames,
  store,
  playerID,
  credentials,
  multiplayer
) {
  return innerActionNames.reduce((dispatchers, name) => {
    dispatchers[name] = function(...args) {
      let assumedPlayerID = playerID;

      // In singleplayer mode, if the client does not have a playerID
      // associated with it, we attach the currentPlayer as playerID.
      if (!multiplayer && (playerID === null || playerID === undefined)) {
        const state = store.getState();
        assumedPlayerID = state.ctx.currentPlayer;
      }

      store.dispatch(
        ActionCreators[storeActionType](
          name,
          args,
          assumedPlayerID,
          credentials
        )
      );
    };

    return dispatchers;
  }, {});
}

/**
 * createEventDispatchers
 *
 * Creates a set of dispatchers to dispatch game flow events.
 * @param {Array} eventNames - A list of event names.
 * @param {object} store - The Redux store to create dispatchers for.
 * @param {string} playerID - The ID of the player dispatching these events.
 * @param {string} credentials - A key indicating that the player is authorized to play.
 */
export const createEventDispatchers = createDispatchers.bind(null, 'gameEvent');

/**
 * createMoveDispatchers
 *
 * Creates a set of dispatchers to make moves.
 * @param {Array} moveNames - A list of move names.
 * @param {object} store - The Redux store to create dispatchers for.
 * @param {string} playerID - The ID of the player dispatching these events.
 * @param {string} credentials - A key indicating that the player is authorized to play.
 */
export const createMoveDispatchers = createDispatchers.bind(null, 'makeMove');

/**
 * Implementation of Client (see below).
 */
export class _ClientImpl {
  constructor({
    game,
    ai,
    debug,
    numPlayers,
    multiplayer,
    gameID,
    playerID,
    credentials,
    enhancer,
  }) {
    this.game = Game(game);
    this.ai = ai;
    this.playerID = playerID;
    this.gameID = gameID;
    this.credentials = credentials;
    this.multiplayer = multiplayer;
    this.debug = debug;
    this.gameStateOverride = null;
    this.subscribers = {};
    this._running = false;

    this.reducer = CreateGameReducer({
      game: this.game,
      numPlayers,
      multiplayer,
    });

    let initialState = null;
    if (!multiplayer) {
      initialState = InitializeGame({ game: this.game, numPlayers });
    }

    this.reset = () => {
      this.store.dispatch(ActionCreators.reset(initialState));
    };
    this.undo = () => {
      this.store.dispatch(ActionCreators.undo());
    };
    this.redo = () => {
      this.store.dispatch(ActionCreators.redo());
    };

    this.store = null;
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
    const LogMiddleware = store => next => action => {
      const result = next(action);
      const state = store.getState();

      switch (action.type) {
        case Actions.MAKE_MOVE:
        case Actions.GAME_EVENT: {
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
    const TransportMiddleware = store => next => action => {
      const baseState = store.getState();
      const result = next(action);

      if (action.clientOnly != true) {
        this.transport.onAction(baseState, action);
      }

      return result;
    };

    /**
     * Middleware that intercepts actions and invokes the subscription callback.
     */
    const SubscriptionMiddleware = () => next => action => {
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

    this.store = createStore(this.reducer, initialState, enhancer);

    this.transport = {
      isConnected: true,
      onAction: () => {},
      subscribe: () => {},
      subscribeGameMetadata: _metadata => {}, // eslint-disable-line no-unused-vars
      connect: () => {},
      disconnect: () => {},
      updateGameID: () => {},
      updatePlayerID: () => {},
    };

    if (multiplayer) {
      if (typeof multiplayer === 'function') {
        this.transport = multiplayer({
          game: this.game,
          gameMeta: game,
          store: this.store,
          gameID,
          playerID,
          gameName: this.game.name,
          numPlayers,
        });
      } else {
        error('invalid multiplayer spec');
      }
    }

    this.createDispatchers();

    this.transport.subscribeGameMetadata(metadata => {
      this.gameMetadata = metadata;
    });

    this._debugPanel = null;
  }

  notifySubscribers() {
    Object.values(this.subscribers).forEach(fn => fn(this.getState()));
  }

  overrideGameState(state) {
    this.gameStateOverride = state;
    this.notifySubscribers();
  }

  start() {
    this.transport.connect();
    this.notifySubscribers();
    this._running = true;

    if (
      process.env.NODE_ENV !== 'production' &&
      this.debug !== false &&
      this._debugPanel == null
    ) {
      let target = document.body;
      if (this.debug && this.debug.target) {
        target = this.debug.target;
      }
      this._debugPanel = new Debug({
        target,
        props: {
          client: this,
        },
      });
    }
  }

  stop() {
    this.transport.disconnect();
    this._running = false;

    if (this._debugPanel != null) {
      this._debugPanel.$destroy();
      this._debugPanel = null;
    }
  }

  subscribe(fn) {
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

  getState() {
    let state = this.store.getState();

    if (this.gameStateOverride !== null) {
      state = this.gameStateOverride;
    }

    // This is the state before a sync with the game master.
    if (state === null) {
      return state;
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
    const G = this.game.playerView(state.G, state.ctx, this.playerID);

    // Combine into return value.
    let ret = { ...state, isActive, G, log: this.log };

    const isConnected = this.transport.isConnected;
    ret = { ...ret, isConnected };

    return ret;
  }

  createDispatchers() {
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
  }

  updatePlayerID(playerID) {
    this.playerID = playerID;
    this.createDispatchers();
    this.transport.updatePlayerID(playerID);
  }

  updateGameID(gameID) {
    this.gameID = gameID;
    this.createDispatchers();
    this.transport.updateGameID(gameID);
  }

  updateCredentials(credentials) {
    this.credentials = credentials;
    this.createDispatchers();
  }
}
