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
import type { Master } from '../../master/master';
import { Transport } from './transport';
import type { Operation } from 'rfc6902';
import type {
  TransportOpts,
  MetadataCallback,
  ChatCallback,
} from './transport';
import type {
  CredentialedActionShape,
  FilteredMetadata,
  LogEntry,
  PlayerID,
  State,
  SyncInfo,
  ChatMessage,
} from '../../types';

interface SocketIOOpts {
  server?: string;
  socketOpts?: SocketIOClient.ConnectOpts;
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
  socket: SocketIOClient.Socket;
  socketOpts: SocketIOClient.ConnectOpts;
  callback: () => void;
  matchDataCallback: MetadataCallback;
  chatMessageCallback: ChatCallback;

  /**
   * Creates a new Multiplayer instance.
   * @param {object} socket - Override for unit tests.
   * @param {object} socketOpts - Options to pass to socket.io.
   * @param {object} store - Redux store
   * @param {string} matchID - The game ID to connect to.
   * @param {string} playerID - The player ID associated with this client.
   * @param {string} credentials - Authentication credentials
   * @param {string} gameName - The game type (the `name` field in `Game`).
   * @param {string} numPlayers - The number of players.
   * @param {string} server - The game server in the form of 'hostname:port'. Defaults to the server serving the client if not provided.
   */
  constructor({
    socket,
    socketOpts,
    server,
    ...opts
  }: SocketIOTransportOpts = {}) {
    super(opts);

    this.server = server;
    this.socket = socket;
    this.socketOpts = socketOpts;
    this.isConnected = false;
    this.callback = () => {};
    this.matchDataCallback = () => {};
    this.chatMessageCallback = () => {};
  }

  /**
   * Called when an action that has to be relayed to the
   * game master is made.
   */
  onAction(state: State, action: CredentialedActionShape.Any) {
    const args: Parameters<Master['onUpdate']> = [
      action,
      state._stateID,
      this.matchID,
      this.playerID,
    ];
    this.socket.emit('update', ...args);
  }

  onChatMessage(matchID: string, chatMessage: ChatMessage) {
    const args: Parameters<Master['onChatMessage']> = [
      matchID,
      chatMessage,
      this.credentials,
    ];
    this.socket.emit('chat', ...args);
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
        if (server.slice(-1) != '/') {
          // add trailing slash if not already present
          server = server + '/';
        }
        this.socket = io(server + this.gameName, this.socketOpts);
      } else {
        this.socket = io('/' + this.gameName, this.socketOpts);
      }
    }

    // Called when another player makes a move and the
    // master broadcasts the update as a patch to other clients (including
    // this one).
    this.socket.on(
      'patch',
      (
        matchID: string,
        prevStateID: number,
        stateID: number,
        patch: Operation[],
        deltalog: LogEntry[]
      ) => {
        const currentStateID = this.store.getState()._stateID;
        if (matchID === this.matchID && prevStateID === currentStateID) {
          const action = ActionCreators.patch(
            prevStateID,
            stateID,
            patch,
            deltalog
          );
          this.store.dispatch(action);
          // emit sync if patch apply failed
          if (this.store.getState()._stateID === currentStateID) {
            this.sync();
          }
        }
      }
    );

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

    // Called when new player joins the match or changes
    // it's connection status
    this.socket.on(
      'matchData',
      (matchID: string, matchData: FilteredMetadata) => {
        if (matchID == this.matchID) {
          this.matchDataCallback(matchData);
        }
      }
    );

    this.socket.on('chat', (matchID: string, chatMessage: ChatMessage) => {
      if (matchID === this.matchID) {
        this.chatMessageCallback(chatMessage);
      }
    });

    // Keep track of connection status.
    this.socket.on('connect', () => {
      // Initial sync to get game state.
      this.sync();
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

  subscribeChatMessage(fn: ChatCallback) {
    this.chatMessageCallback = fn;
  }

  /**
   * Send a “sync” event to the server.
   */
  private sync() {
    if (this.socket) {
      const args: Parameters<Master['onSync']> = [
        this.matchID,
        this.playerID,
        this.credentials,
        this.numPlayers,
      ];
      this.socket.emit('sync', ...args);
    }
  }

  /**
   * Dispatches a reset action, then requests a fresh sync from the server.
   */
  private resetAndSync() {
    const action = ActionCreators.reset(null);
    this.store.dispatch(action);
    this.sync();
  }

  /**
   * Updates the game id.
   * @param {string} id - The new game id.
   */
  updateMatchID(id: string) {
    this.matchID = id;
    this.resetAndSync();
  }

  /**
   * Updates the player associated with this client.
   * @param {string} id - The new player id.
   */
  updatePlayerID(id: PlayerID) {
    this.playerID = id;
    this.resetAndSync();
  }

  /**
   * Updates the credentials associated with this client.
   * @param {string|undefined} credentials - The new credentials to use.
   */
  updateCredentials(credentials?: string) {
    this.credentials = credentials;
    this.resetAndSync();
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
