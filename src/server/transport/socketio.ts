/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import IO from 'koa-socket-2';
import { Socket, ServerOptions as SocketOptions } from 'socket.io';
import { ServerOptions as HttpsOptions } from 'https';
import {
  Master,
  TransportAPI as MasterTransport,
  AuthFn,
} from '../../master/master';
import { PlayerID } from '../../types';

const PING_TIMEOUT = 20 * 1e3;
const PING_INTERVAL = 10 * 1e3;

/**
 * API that's exposed by SocketIO for the Master to send
 * information to the clients.
 */
export function TransportAPI(
  matchID: string,
  socket: Socket,
  clientInfo: SocketIO['clientInfo'],
  roomInfo: SocketIO['roomInfo']
): MasterTransport {
  /**
   * Send a message to a specific client.
   */
  const send: MasterTransport['send'] = ({ type, playerID, args }) => {
    const clients = roomInfo.get(matchID).values();
    for (const client of clients) {
      const info = clientInfo.get(client);
      if (info.playerID === playerID) {
        if (socket.id === client) {
          socket.emit.apply(socket, [type, ...args]);
        } else {
          socket.to(info.socket.id).emit.apply(socket, [type, ...args]);
        }
      }
    }
  };

  /**
   * Send a message to all clients.
   */
  const sendAll: MasterTransport['sendAll'] = makePlayerData => {
    roomInfo.get(matchID).forEach(c => {
      const playerID: PlayerID = clientInfo.get(c).playerID;
      const data = makePlayerData(playerID);
      send({ playerID, ...data });
    });
  };

  return { send, sendAll };
}

export interface SocketOpts {
  auth?: boolean | AuthFn;
  https?: HttpsOptions;
  socketOpts?: SocketOptions;
  socketAdapter?: any;
}

interface Client {
  matchID: string;
  playerID: string;
  socket: Socket;
}

/**
 * Transport interface that uses socket.io
 */
export class SocketIO {
  protected clientInfo: Map<string, Client>;
  protected roomInfo: Map<string, Set<string>>;
  private auth: boolean | AuthFn;
  private https: HttpsOptions;
  private socketAdapter: any;
  private socketOpts: SocketOptions;

  constructor({
    auth = true,
    https,
    socketAdapter,
    socketOpts,
  }: SocketOpts = {}) {
    this.clientInfo = new Map();
    this.roomInfo = new Map();
    this.auth = auth;
    this.https = https;
    this.socketAdapter = socketAdapter;
    this.socketOpts = socketOpts;
  }

  init(app, games) {
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

      nsp.on('connection', (socket: Socket) => {
        socket.on('update', async (...args: Parameters<Master['onUpdate']>) => {
          const [action, stateID, matchID, playerID] = args;
          const master = new Master(
            game,
            app.context.db,
            TransportAPI(matchID, socket, this.clientInfo, this.roomInfo),
            this.auth
          );
          await master.onUpdate(action, stateID, matchID, playerID);
        });

        socket.on('sync', async (...args: Parameters<Master['onSync']>) => {
          const [matchID, playerID, numPlayers] = args;
          socket.join(matchID);

          // Remove client from any previous game that it was a part of.
          if (this.clientInfo.has(socket.id)) {
            const { matchID: oldMatchID } = this.clientInfo.get(socket.id);
            this.roomInfo.get(oldMatchID).delete(socket.id);
          }

          let roomClients = this.roomInfo.get(matchID);
          if (roomClients === undefined) {
            roomClients = new Set<string>();
            this.roomInfo.set(matchID, roomClients);
          }
          roomClients.add(socket.id);

          this.clientInfo.set(socket.id, { matchID, playerID, socket });

          const master = new Master(
            game,
            app.context.db,
            TransportAPI(matchID, socket, this.clientInfo, this.roomInfo),
            this.auth
          );
          await master.onSync(matchID, playerID, numPlayers);
        });

        socket.on('disconnect', () => {
          if (this.clientInfo.has(socket.id)) {
            const { matchID } = this.clientInfo.get(socket.id);
            this.roomInfo.get(matchID).delete(socket.id);
            this.clientInfo.delete(socket.id);
          }
        });
      });
    }
  }
}
