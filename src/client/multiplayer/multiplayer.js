/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { RESTORE } from '../../core/action-types';
import * as ActionCreators from '../../core/action-creators';
import { createStore, applyMiddleware, compose } from 'redux';
import io from 'socket.io-client';

// The actions that are sent across the network.
const blacklistedActions = new Set([RESTORE]);

/**
 * Multiplayer
 *
 * Handles all the multiplayer interactions on the client-side.
 */
export class Multiplayer {
  /**
   * Creates a new Mutiplayer instance.
   * @param {object} socket - Override for unit tests.
   * @param {object} socketOpts - Options to pass to socket.io.
   * @param {string} gameID - The game ID to connect to.
   * @param {string} playerID - The player ID associated with this client.
   * @param {string} gameName - The game type (the `name` field in `Game`).
   * @param {string} numPlayers - The number of players.
   * @param {string} server - The game server in the form of 'hostname:port'. Defaults to the server serving the client if not provided.
   */
  constructor({
    socket,
    socketOpts,
    gameID,
    playerID,
    gameName,
    numPlayers,
    server,
  } = {}) {
    this.server = server;
    this.socket = socket;
    this.socketOpts = socketOpts;
    this.gameName = gameName || 'default';
    this.gameID = gameID || 'default';
    this.playerID = playerID || null;
    this.numPlayers = numPlayers || 2;
    this.gameID = this.gameName + ':' + this.gameID;
    this.isConnected = false;
    this.callback = () => {};
  }

  /**
   * Creates a Redux store with some middleware that sends actions
   * to the server whenever they are dispatched.
   * @param {function} reducer - The game reducer.
   * @param {function} enhancer - optional enhancer to apply to Redux store
   */
  createStore(reducer, enhancer) {
    this.store = null;

    // Redux middleware to emit a message on a socket
    // whenever an action is dispatched.
    const SocketEnhancer = applyMiddleware(({ getState }) => next => action => {
      const state = getState();
      const result = next(action);

      if (!blacklistedActions.has(action.type) && action._remote != true) {
        this.socket.emit(
          'action',
          action,
          state._stateID,
          this.gameID,
          this.playerID
        );
      }

      return result;
    });

    enhancer = enhancer ? compose(enhancer, SocketEnhancer) : SocketEnhancer;
    this.store = createStore(reducer, enhancer);

    return this.store;
  }

  /**
   * Connect to the server.
   */
  connect() {
    if (!this.socket) {
      if (this.server) {
        this.socket = io(
          'http://' + this.server + '/' + this.gameName,
          this.socketOpts
        );
      } else {
        this.socket = io('/' + this.gameName, this.socketOpts);
      }
    }

    this.socket.on('sync', (gameID, state) => {
      if (
        gameID == this.gameID &&
        state._stateID >= this.store.getState()._stateID
      ) {
        const action = ActionCreators.restore(state);
        action._remote = true;
        this.store.dispatch(action);
      }
    });

    // Initial sync to get game state.
    this.socket.emit('sync', this.gameID, this.playerID, this.numPlayers);

    // Keep track of connection status.
    this.socket.on('connect', () => {
      this.isConnected = true;
      this.callback();
    });
    this.socket.on('disconnect', () => {
      this.isConnected = false;
      this.callback();
    });
  }

  /**
   * Subscribe to connection state changes.
   */
  subscribe(fn) {
    this.callback = fn;
  }

  /**
   * Updates the game id.
   * @param {string} id - The new game id.
   */
  updateGameID(id) {
    this.gameID = this.gameName + ':' + id;

    const action = ActionCreators.reset();
    action._remote = true;
    this.store.dispatch(action);

    if (this.socket) {
      this.socket.emit('sync', this.gameID, this.playerID, this.numPlayers);
    }
  }

  /**
   * Updates the player associated with this client.
   * @param {string} id - The new player id.
   */
  updatePlayerID(id) {
    this.playerID = id;

    const action = ActionCreators.reset();
    action._remote = true;
    this.store.dispatch(action);

    if (this.socket) {
      this.socket.emit('sync', this.gameID, this.playerID, this.numPlayers);
    }
  }
}
