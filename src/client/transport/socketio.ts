/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import * as ioNamespace from 'socket.io-client';
const io = ioNamespace.default;

import * as ActionCreators from '../../core/action-creators';
import { Transport, TransportOpts, MetadataCallback } from './transport';
import {
  CredentialedActionShape,
  LogEntry,
  PlayerID,
  State,
  SyncInfo,
} from '../../types';

interface SocketIOOpts {
  server?: string;
  socketOpts?;
}

type SocketIOTransportOpts = TransportOpts &
  SocketIOOpts & {
    socket?;
  };

/**
 * SocketIO
 *
 * Transport interface that interacts with the Master via socket.io.
 */
export class SocketIOTransport extends Transport {
  server: string;
  socket;
  socketOpts;
  callback: () => void;
  matchDataCallback: MetadataCallback;

  /**
   * Creates a new Mutiplayer instance.
   * @param {object} socket - Override for unit tests.
   * @param {object} socketOpts - Options to pass to socket.io.
   * @param {string} matchID - The game ID to connect to.
   * @param {string} playerID - The player ID associated with this client.
   * @param {string} gameName - The game type (the `name` field in `Game`).
   * @param {string} numPlayers - The number of players.
   * @param {string} server - The game server in the form of 'hostname:port'. Defaults to the server serving the client if not provided.
   */
  constructor({
    socket,
    socketOpts,
    store,
    matchID,
    playerID,
    gameName,
    numPlayers,
    server,
  }: SocketIOTransportOpts = {}) {
    super({ store, gameName, playerID, matchID, numPlayers });

    this.server = server;
    this.socket = socket;
    this.socketOpts = socketOpts;
    this.isConnected = false;
    this.callback = () => {};
    this.matchDataCallback = () => {};
  }

  /**
   * Called when an action that has to be relayed to the
   * game master is made.
   */
  onAction(state: State, action: CredentialedActionShape.Any) {
    this.socket.emit(
      'update',
      action,
      state._stateID,
      this.matchID,
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
    this.socket.on(
      'update',
      (matchID: string, state: State, deltalog: LogEntry[]) => {
        const currentState = this.store.getState();

        if (
          matchID == this.matchID &&
          state._stateID >= currentState._stateID
        ) {
          const action = ActionCreators.update(state, deltalog);
          this.store.dispatch(action);
        }
      }
    );

    // Called when the client first connects to the master
    // and requests the current game state.
    this.socket.on('sync', (matchID: string, syncInfo: SyncInfo) => {
      if (matchID == this.matchID) {
        const action = ActionCreators.sync(syncInfo);
        this.matchDataCallback(syncInfo.filteredMetadata);
        this.store.dispatch(action);
      }
    });

    // Keep track of connection status.
    this.socket.on('connect', () => {
      // Initial sync to get game state.
      this.socket.emit('sync', this.matchID, this.playerID, this.numPlayers);
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
  subscribe(fn: () => void) {
    this.callback = fn;
  }

  subscribeMatchData(fn: MetadataCallback) {
    this.matchDataCallback = fn;
  }

  /**
   * Updates the game id.
   * @param {string} id - The new game id.
   */
  updateMatchID(id: string) {
    this.matchID = id;

    const action = ActionCreators.reset(null);
    this.store.dispatch(action);

    if (this.socket) {
      this.socket.emit('sync', this.matchID, this.playerID, this.numPlayers);
    }
  }

  /**
   * Updates the player associated with this client.
   * @param {string} id - The new player id.
   */
  updatePlayerID(id: PlayerID) {
    this.playerID = id;

    const action = ActionCreators.reset(null);
    this.store.dispatch(action);

    if (this.socket) {
      this.socket.emit('sync', this.matchID, this.playerID, this.numPlayers);
    }
  }
}

export function SocketIO({ server, socketOpts }: SocketIOOpts = {}) {
  return (transportOpts: SocketIOTransportOpts) =>
    new SocketIOTransport({
      server,
      socketOpts,
      ...transportOpts,
    });
}
