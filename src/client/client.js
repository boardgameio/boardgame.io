/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { createStore } from 'redux';
import * as ActionCreators from '../core/action-creators';
import { Multiplayer } from './multiplayer/multiplayer';
import { CreateGameReducer } from '../core/reducer';

/**
 * createEventDispatchers
 *
 * Creates a set of dispatchers to dispatch game flow events.
 * @param {Array} eventNames - A list of event names.
 * @param {object} store - The Redux store to create dispatchers for.
 * @param {string} playerID - The ID of the player dispatching these events.
 */
export function createEventDispatchers(
  eventNames,
  store,
  playerID,
  credentials
) {
  let dispatchers = {};
  for (let i = 0; i < eventNames.length; i++) {
    const name = eventNames[i];
    dispatchers[name] = function(...args) {
      store.dispatch(
        ActionCreators.gameEvent(name, args, playerID, credentials)
      );
    };
  }
  return dispatchers;
}

/**
 * createMoveDispatchers
 *
 * Creates a set of dispatchers to make moves.
 * @param {Array} moveNames - A list of move names.
 * @param {object} store - The Redux store to create dispatchers for.
 */
export function createMoveDispatchers(moveNames, store, playerID, credentials) {
  let dispatchers = {};
  for (let i = 0; i < moveNames.length; i++) {
    const name = moveNames[i];
    dispatchers[name] = function(...args) {
      store.dispatch(
        ActionCreators.makeMove(name, args, playerID, credentials)
      );
    };
  }
  return dispatchers;
}

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

    let server = undefined;
    if (multiplayer instanceof Object && 'server' in multiplayer) {
      server = multiplayer.server;
      multiplayer = true;
    }

    this.multiplayer = multiplayer;

    this.reducer = CreateGameReducer({
      game,
      numPlayers,
      multiplayer,
    });

    if (ai !== undefined && multiplayer === undefined) {
      const bot = new ai.bot({ game, enumerate: ai.enumerate });

      this.step = () => {
        const state = this.store.getState();
        const playerID = state.ctx.actionPlayers[0];
        const { action, metadata } = bot.play(state, playerID);

        if (action) {
          action.payload.metadata = metadata;
          this.store.dispatch(action);
        }

        return action;
      };
    }

    this.reset = () => {
      this.store.dispatch(ActionCreators.reset());
    };
    this.undo = () => {
      this.store.dispatch(ActionCreators.undo());
    };
    this.redo = () => {
      this.store.dispatch(ActionCreators.redo());
    };

    this.store = null;

    if (multiplayer) {
      this.multiplayerClient = new Multiplayer({
        gameID: gameID,
        playerID: playerID,
        gameName: game.name,
        numPlayers,
        server,
        socketOpts,
      });
      this.store = this.multiplayerClient.createStore(this.reducer, enhancer);
    } else {
      this.store = createStore(this.reducer, enhancer);

      // If no playerID was provided, set it to undefined.
      if (this.playerID === null) {
        this.playerID = undefined;
      }
    }

    this.createDispatchers();
  }

  subscribe(fn) {
    this.store.subscribe(fn);

    if (this.multiplayerClient) {
      this.multiplayerClient.subscribe(fn);
    }
  }

  getState() {
    const state = this.store.getState();

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
    let playerID = this.playerID;
    if (!this.multiplayer && !playerID && state.ctx.currentPlayer != 'any') {
      playerID = state.ctx.currentPlayer;
    }
    const G = this.game.playerView(state.G, state.ctx, playerID);

    // Combine into return value.
    let ret = { ...state, isActive, G };

    if (this.multiplayerClient) {
      const isConnected = this.multiplayerClient.isConnected;
      ret = { ...ret, isConnected };
    }

    return ret;
  }

  connect() {
    if (this.multiplayerClient) {
      this.multiplayerClient.connect();
    }
  }

  createDispatchers() {
    this.moves = createMoveDispatchers(
      this.game.moveNames,
      this.store,
      this.playerID,
      this.credentials
    );

    this.events = createEventDispatchers(
      this.game.flow.eventNames,
      this.store,
      this.playerID,
      this.credentials
    );
  }

  updatePlayerID(playerID) {
    this.playerID = playerID;
    this.createDispatchers();

    if (this.multiplayerClient) {
      this.multiplayerClient.updatePlayerID(playerID);
    }
  }

  updateGameID(gameID) {
    this.gameID = gameID;
    this.createDispatchers();

    if (this.multiplayerClient) {
      this.multiplayerClient.updateGameID(gameID);
    }
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
