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
import { createGameReducer } from '../core/reducer';
import './client.css';

/**
 * createEventDispatchers
 *
 * Creates a set of dispatchers to dispatch game flow events.
 * @param {Array} eventNames - A list of event names.
 * @param {object} store - The Redux store to create dispatchers for.
 * @param {string} playerID - The ID of the player dispatching these events.
 */
export function createEventDispatchers(eventNames, store, playerID) {
  let dispatchers = {};
  for (const name of eventNames) {
    dispatchers[name] = function(...args) {
      store.dispatch(ActionCreators.gameEvent(name, args, playerID));
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
export function createMoveDispatchers(moveNames, store, playerID) {
  let dispatchers = {};
  for (const name of moveNames) {
    dispatchers[name] = function(...args) {
      store.dispatch(ActionCreators.makeMove(name, args, playerID));
    };
  }
  return dispatchers;
}

/**
 * Implementation of Client (see below).
 */
class _ClientImpl {
  constructor({ game, numPlayers, multiplayer, gameID, playerID, enhancer }) {
    this.game = game;
    this.playerID = playerID;
    this.gameID = gameID;

    let server = undefined;
    if (multiplayer instanceof Object && 'server' in multiplayer) {
      server = multiplayer.server;
      multiplayer = true;
    }

    this.multiplayer = multiplayer;

    const GameReducer = createGameReducer({
      game,
      numPlayers,
      multiplayer,
    });

    this.store = null;

    if (multiplayer) {
      this.multiplayerClient = new Multiplayer({
        gameID: gameID,
        playerID: playerID,
        gameName: game.name,
        numPlayers,
        server,
      });
      this.store = this.multiplayerClient.createStore(GameReducer, enhancer);
    } else {
      this.store = createStore(GameReducer, enhancer);

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
    if (this.multiplayer) {
      if (this.playerID == null) {
        isActive = false;
      }
      if (
        !this.game.flow.canMakeMove(state.G, state.ctx, {
          playerID: this.playerID,
        })
      ) {
        isActive = false;
      }
    }

    // Secrets are normally stripped on the server,
    // but we also strip them here so that game developers
    // can see their effects while prototyping.
    let playerID = this.playerID;
    if (!this.multiplayer && !playerID && state.ctx.currentPlayer != 'any') {
      playerID = state.ctx.currentPlayer;
    }
    const G = this.game.playerView(state.G, state.ctx, playerID);

    if (state.ctx.gameover !== undefined) {
      isActive = false;
    }

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
      this.playerID
    );

    this.events = createEventDispatchers(
      this.game.flow.eventNames,
      this.store,
      this.playerID
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
 * @param {...object} gameID - The gameID that you want to connect to.
 * @param {...object} playerID - The playerID associated with this client.
 *
 * Returns:
 *   A JS object that provides an API to interact with the
 *   game by dispatching moves and events.
 */
export function Client(opts) {
  return new _ClientImpl(opts);
}
