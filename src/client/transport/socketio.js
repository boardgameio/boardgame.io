/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import * as ActionCreators from '../../core/action-creators';
import io from 'socket.io-client';
import { Transport } from './transport';

/**
 * SocketIO
 *
 * Transport interface that interacts with the Master via socket.io.
 */
export class SocketIOTransport extends Transport {
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
    store,
    gameID,
    playerID,
    gameName,
    numPlayers,
    server,
  } = {}) {
    super({ store, gameName, playerID, gameID, numPlayers });

    this.server = server;
    this.socket = socket;
    this.socketOpts = socketOpts;
    this.isConnected = false;
    this.callback = () => {};
    this.gameMetadataCallback = () => {};
  }

  /**
   * Called when an action that has to be relayed to the
   * game master is made.
   */
  onAction(state, action) {
    this.socket.emit(
      'update',
      action,
      state._stateID,
      this.gameID,
      this.playerID
    );
  }

  /**
   * Connect to the server.
   */
  connect() {
    if (!this.socket) {
      if (this.server) {
        let server = this.server;
        if (server.search(/^https?:\/\//) == -1) {
          server = 'http://' + this.server;
        }
        if (server.substr(-1) != '/') {
          // add trailing slash if not already present
          server = server + '/';
        }
        this.socket = io(server + this.gameName, this.socketOpts);
      } else {
        this.socket = io('/' + this.gameName, this.socketOpts);
      }
    }

    // Called when another player makes a move and the
    // master broadcasts the update to other clients (including
    // this one).
    this.socket.on('update', (gameID, state, deltalog) => {
      const currentState = this.store.getState();

      if (gameID == this.gameID && state._stateID >= currentState._stateID) {
        const action = ActionCreators.update(state, deltalog);
        this.store.dispatch(action);
      }
    });

    // Called when the client first connects to the master
    // and requests the current game state.
    this.socket.on('sync', (gameID, syncInfo) => {
      if (gameID == this.gameID) {
        const action = ActionCreators.sync(syncInfo);
        this.gameMetadataCallback(syncInfo.filteredMetadata);
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
   * Disconnect from the server.
   */
  disconnect() {
    this.socket.close();
    this.socket = null;
    this.isConnected = false;
    this.callback();
  }

  /**
   * Subscribe to connection state changes.
   */
  subscribe(fn) {
    this.callback = fn;
  }

  subscribeGameMetadata(fn) {
    this.gameMetadataCallback = fn;
  }

  /**
   * Updates the game id.
   * @param {string} id - The new game id.
   */
  updateGameID(id) {
    this.gameID = id;

    const action = ActionCreators.reset(null);
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

    const action = ActionCreators.reset(null);
    this.store.dispatch(action);

    if (this.socket) {
      this.socket.emit('sync', this.gameID, this.playerID, this.numPlayers);
    }
  }
}

export function SocketIO({ server, socketOpts } = {}) {
  return transportOpts =>
    new SocketIOTransport({
      server,
      socketOpts,
      ...transportOpts,
    });
}
