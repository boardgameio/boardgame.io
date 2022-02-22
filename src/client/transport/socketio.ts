/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import * as ioNamespace from 'socket.io-client';

const io = ioNamespace.default;

import type { Master } from '../../master/master';
import { Transport } from './transport';
import type { Operation } from 'rfc6902';
import type { TransportOpts } from './transport';
import type {
  CredentialedActionShape,
  FilteredMetadata,
  LogEntry,
  PlayerID,
  State,
  SyncInfo,
  ChatMessage,
} from '../../types';

type SocketOpts = Partial<
  ioNamespace.SocketOptions & ioNamespace.ManagerOptions
>;

interface SocketIOOpts {
  server?: string;
  socketOpts?: SocketOpts;
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
  socket: ioNamespace.Socket;
  socketOpts: SocketOpts;

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
  constructor({ socket, socketOpts, server, ...opts }: SocketIOTransportOpts) {
    super(opts);

    this.server = server;
    this.socket = socket;
    this.socketOpts = socketOpts;
  }

  sendAction(state: State, action: CredentialedActionShape.Any): void {
    const args: Parameters<Master['onUpdate']> = [
      action,
      state._stateID,
      this.matchID,
      this.playerID,
    ];
    this.socket.emit('update', ...args);
  }

  sendChatMessage(matchID: string, chatMessage: ChatMessage): void {
    const args: Parameters<Master['onChatMessage']> = [
      matchID,
      chatMessage,
      this.credentials,
    ];
    this.socket.emit('chat', ...args);
  }

  connect(): void {
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
        this.notifyClient({
          type: 'patch',
          args: [matchID, prevStateID, stateID, patch, deltalog],
        });
      }
    );

    // Called when another player makes a move and the
    // master broadcasts the update to other clients (including
    // this one).
    this.socket.on(
      'update',
      (matchID: string, state: State, deltalog: LogEntry[]) => {
        this.notifyClient({
          type: 'update',
          args: [matchID, state, deltalog],
        });
      }
    );

    // Called when the client first connects to the master
    // and requests the current game state.
    this.socket.on('sync', (matchID: string, syncInfo: SyncInfo) => {
      this.notifyClient({ type: 'sync', args: [matchID, syncInfo] });
    });

    // Called when new player joins the match or changes
    // it's connection status
    this.socket.on(
      'matchData',
      (matchID: string, matchData: FilteredMetadata) => {
        this.notifyClient({ type: 'matchData', args: [matchID, matchData] });
      }
    );

    this.socket.on('chat', (matchID: string, chatMessage: ChatMessage) => {
      this.notifyClient({ type: 'chat', args: [matchID, chatMessage] });
    });

    // Keep track of connection status.
    this.socket.on('connect', () => {
      // Initial sync to get game state.
      this.requestSync();
      this.setConnectionStatus(true);
    });
    this.socket.on('disconnect', () => {
      this.setConnectionStatus(false);
    });
  }

  disconnect(): void {
    this.socket.close();
    this.socket = null;
    this.setConnectionStatus(false);
  }

  requestSync(): void {
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

  updateMatchID(id: string): void {
    this.matchID = id;
    this.requestSync();
  }

  updatePlayerID(id: PlayerID): void {
    this.playerID = id;
    this.requestSync();
  }

  updateCredentials(credentials?: string): void {
    this.credentials = credentials;
    this.requestSync();
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
