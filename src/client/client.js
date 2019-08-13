/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { createStore, compose, applyMiddleware } from 'redux';
import * as Actions from '../core/action-types';
import * as ActionCreators from '../core/action-creators';
import { error } from '../core/logger';
import { SocketIO } from './transport/socketio';
import { Local, LocalMaster } from './transport/local';
import { InitializeGame, CreateGameReducer } from '../core/reducer';

// The Game Master object (if using a local one).
let localMaster_ = null;

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
class _ClientImpl {
  constructor({
    game,
    ai,
    numPlayers,
    multiplayer,
    socketOpts,
    gameID,
    playerID,
    credentials,
    enhancer,
  }) {
    this.game = game;
    this.playerID = playerID;
    this.gameID = gameID;
    this.credentials = credentials;
    this.multiplayer = multiplayer;
    this.subscribeCallback = () => {};

    this.reducer = CreateGameReducer({
      game,
      numPlayers,
      multiplayer,
    });

    if (ai !== undefined && multiplayer === undefined) {
      const bot = new ai.bot({ game, enumerate: ai.enumerate });

      this.step = async () => {
        const state = this.store.getState();
        const playerID = state.ctx.actionPlayers[0];
        const { action, metadata } = await bot.play(state, playerID);

        if (action) {
          action.payload.metadata = metadata;
          this.store.dispatch(action);
        }

        return action;
      };
    }

    let initialState = null;
    if (multiplayer === undefined) {
      initialState = InitializeGame({ game, numPlayers });
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
      this.subscribeCallback();
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
      updateGameID: () => {},
      updatePlayerID: () => {},
    };

    if (multiplayer !== undefined) {
      if (multiplayer === true) {
        multiplayer = { server: '' };
      }

      if (multiplayer.local === true) {
        if (localMaster_ === null || localMaster_.game !== game) {
          localMaster_ = new LocalMaster(game);
        }

        this.transport = new Local({
          master: localMaster_,
          store: this.store,
          gameID: gameID,
          playerID: playerID,
          gameName: game.name,
          numPlayers,
        });
      } else if (multiplayer.server !== undefined) {
        this.transport = new SocketIO({
          store: this.store,
          gameID: gameID,
          playerID: playerID,
          gameName: game.name,
          numPlayers,
          server: multiplayer.server,
          socketOpts,
        });
      } else if (multiplayer.transport !== undefined) {
        this.transport = new multiplayer.transport({
          store: this.store,
          gameID: gameID,
          playerID: playerID,
          gameName: game.name,
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
  }

  subscribe(fn) {
    const callback = () => fn(this.getState());
    this.transport.subscribe(callback);
    this.subscribeCallback = callback;
  }

  getState() {
    const state = this.store.getState();

    // This is the state before a sync with the game master.
    if (state === null) {
      return state;
    }

    // isActive.

    let isActive = true;

    const canPlayerMakeMove = this.game.flow.canPlayerMakeMove(
      state.G,
      state.ctx,
      this.playerID
    );

    if (this.multiplayer && !canPlayerMakeMove) {
      isActive = false;
    }

    if (
      !this.multiplayer &&
      this.playerID !== null &&
      this.playerID !== undefined &&
      !canPlayerMakeMove
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

  connect() {
    this.transport.connect();
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

/**
 * Client
 *
 * boardgame.io JS client.
 *
 * @param {...object} game - The return value of `Game`.
 * @param {...object} numPlayers - The number of players.
 * @param {...object} multiplayer - Set to true or { server: '<host>:<port>' }
 *                                  to make a multiplayer client. The second
 *                                  syntax specifies a non-default socket server.
 * @param {...object} socketOpts - Options to pass to socket.io.
 * @param {...object} gameID - The gameID that you want to connect to.
 * @param {...object} playerID - The playerID associated with this client.
 * @param {...string} credentials - The authentication credentials associated with this client.
 *
 * Returns:
 *   A JS object that provides an API to interact with the
 *   game by dispatching moves and events.
 */
export function Client(opts) {
  return new _ClientImpl(opts);
}
