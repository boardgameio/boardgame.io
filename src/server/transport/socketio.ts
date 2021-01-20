/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import IO from 'koa-socket-2';
import type IOTypes from 'socket.io';
import type { ServerOptions as HttpsOptions } from 'https';
import PQueue from 'p-queue';
import { Master } from '../../master/master';
import type {
  TransportAPI as MasterTransport,
  TransportData,
} from '../../master/master';
import type { Game, Server } from '../../types';

const PING_TIMEOUT = 20 * 1e3;
const PING_INTERVAL = 10 * 1e3;

/**
 * API that's exposed by SocketIO for the Master to send
 * information to the clients.
 */
export function TransportAPI(
  matchID: string,
  socket: IOTypes.Socket,
  clientInfo: SocketIO['clientInfo'],
  roomInfo: SocketIO['roomInfo']
): MasterTransport {
  /**
   * Emit a socket.io event to the recipientID.
   * If the recipient is the current socket, uses a basic emit, otherwise
   * emits via the current socket’s `to` method.
   */
  const emit = (recipientID: string, { type, args }: TransportData) => {
    const emitter = socket.id === recipientID ? socket : socket.to(recipientID);
    emitter.emit(type, ...args);
  };

  /**
   * Send a message to a specific client.
   */
  const send: MasterTransport['send'] = ({ playerID, ...data }) => {
    roomInfo.get(matchID).forEach((clientID) => {
      const client = clientInfo.get(clientID);
      if (client.playerID === playerID) emit(clientID, data);
    });
  };

  /**
   * Send a message to all clients.
   */
  const sendAll: MasterTransport['sendAll'] = (makePlayerData) => {
    roomInfo.get(matchID).forEach((clientID) => {
      const { playerID } = clientInfo.get(clientID);
      const data = makePlayerData(playerID);
      emit(clientID, data);
    });
  };

  return { send, sendAll };
}

export interface SocketOpts {
  https?: HttpsOptions;
  socketOpts?: IOTypes.ServerOptions;
  socketAdapter?: any;
}

interface Client {
  matchID: string;
  playerID: string;
  socket: IOTypes.Socket;
  credentials: string | undefined;
}

/**
 * Transport interface that uses socket.io
 */
export class SocketIO {
  protected clientInfo: Map<string, Client>;
  protected roomInfo: Map<string, Set<string>>;
  protected perMatchQueue: Map<string, PQueue>;
  private https: HttpsOptions;
  private socketAdapter: any;
  private socketOpts: IOTypes.ServerOptions;

  constructor({ https, socketAdapter, socketOpts }: SocketOpts = {}) {
    this.clientInfo = new Map();
    this.roomInfo = new Map();
    this.perMatchQueue = new Map();
    this.https = https;
    this.socketAdapter = socketAdapter;
    this.socketOpts = socketOpts;
  }

  /**
   * Unregister client data for a socket.
   */
  private removeClient(socketID: string): void {
    // Get client data for this socket ID.
    const client = this.clientInfo.get(socketID);
    if (!client) return;
    // Remove client from list of connected sockets for this match.
    const { matchID } = client;
    const matchClients = this.roomInfo.get(matchID);
    matchClients.delete(socketID);
    // If the match is now empty, also delete the match’s promise queue.
    if (matchClients.size === 0) this.deleteMatchQueue(matchID);
    // Remove client data from the client map.
    this.clientInfo.delete(socketID);
  }

  /**
   * Register client data for a socket.
   */
  private addClient(client: Client): void {
    // Add client to list of connected sockets for this match.
    let matchClients = this.roomInfo.get(client.matchID);
    if (matchClients === undefined) {
      matchClients = new Set<string>();
      this.roomInfo.set(client.matchID, matchClients);
    }
    matchClients.add(client.socket.id);
    // Register data for this socket in the client map.
    this.clientInfo.set(client.socket.id, client);
  }

  init(app: Server.App & { _io?: IOTypes.Server }, games: Game[]) {
    const io = new IO({
      ioOptions: {
        pingTimeout: PING_TIMEOUT,
        pingInterval: PING_INTERVAL,
        ...this.socketOpts,
      },
    });

    app.context.io = io;
    io.attach(app, !!this.https, this.https);

    if (this.socketAdapter) {
      io.adapter(this.socketAdapter);
    }

    for (const game of games) {
      const nsp = app._io.of(game.name);

      nsp.on('connection', (socket: IOTypes.Socket) => {
        socket.on('update', async (...args: Parameters<Master['onUpdate']>) => {
          const [action, stateID, matchID, playerID] = args;
          const master = new Master(
            game,
            app.context.db,
            TransportAPI(matchID, socket, this.clientInfo, this.roomInfo),
            app.context.auth
          );

          const matchQueue = this.getMatchQueue(matchID);
          await matchQueue.add(() =>
            master.onUpdate(action, stateID, matchID, playerID)
          );
        });

        socket.on('sync', async (...args: Parameters<Master['onSync']>) => {
          const [matchID, playerID, credentials] = args;
          socket.join(matchID);

          this.removeClient(socket.id);
          this.addClient({ socket, matchID, playerID, credentials });

          const master = new Master(
            game,
            app.context.db,
            TransportAPI(matchID, socket, this.clientInfo, this.roomInfo),
            app.context.auth
          );
          const syncResponse = await master.onSync(...args);
          if (syncResponse && syncResponse.error === 'unauthorized') {
            this.removeClient(socket.id);
            return;
          }
          await master.onConnectionChange(matchID, playerID, credentials, true);
        });

        socket.on('disconnect', async () => {
          const client = this.clientInfo.get(socket.id);
          this.removeClient(socket.id);
          if (client) {
            const { matchID, playerID, credentials } = client;
            const master = new Master(
              game,
              app.context.db,
              TransportAPI(matchID, socket, this.clientInfo, this.roomInfo),
              app.context.auth
            );
            await master.onConnectionChange(
              matchID,
              playerID,
              credentials,
              false
            );
          }
        });

        socket.on(
          'chat',
          async (...args: Parameters<Master['onChatMessage']>) => {
            const [matchID] = args;
            const master = new Master(
              game,
              app.context.db,
              TransportAPI(matchID, socket, this.clientInfo, this.roomInfo),
              app.context.auth
            );
            master.onChatMessage(...args);
          }
        );
      });
    }
  }

  /**
   * Create a PQueue for a given matchID if none exists and return it.
   * @param matchID
   * @returns
   */
  getMatchQueue(matchID: string): PQueue {
    if (!this.perMatchQueue.has(matchID)) {
      // PQueue should process only one action at a time.
      this.perMatchQueue.set(matchID, new PQueue({ concurrency: 1 }));
    }
    return this.perMatchQueue.get(matchID);
  }

  /**
   * Delete a PQueue for a given matchID.
   * @param matchID
   */
  deleteMatchQueue(matchID: string): void {
    this.perMatchQueue.delete(matchID);
  }
}
