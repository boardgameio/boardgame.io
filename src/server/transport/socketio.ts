/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import IO from 'koa-socket-2';
import { ServerOptions as SocketOptions } from 'socket.io';
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
  gameID: string,
  socket,
  clientInfo: Map<any, any>,
  roomInfo: Map<any, any>
): MasterTransport {
  /**
   * Send a message to a specific client.
   */
  const send: MasterTransport['send'] = ({ type, playerID, args }) => {
    const clients = roomInfo.get(gameID).values();
    for (const client of clients) {
      const info = clientInfo.get(client);
      if (info.playerID == playerID) {
        if (socket.id == client) {
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
    roomInfo.get(gameID).forEach(c => {
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
}

/**
 * Transport interface that uses socket.io
 */
export class SocketIO {
  protected clientInfo: Map<any, any>;
  protected roomInfo: Map<any, any>;
  private auth: boolean | AuthFn;
  private https: HttpsOptions;
  private socketOpts: SocketOptions;

  constructor({ auth = true, https, socketOpts }: SocketOpts = {}) {
    this.clientInfo = new Map();
    this.roomInfo = new Map();
    this.auth = auth;
    this.https = https;
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

    for (const game of games) {
      const nsp = app._io.of(game.name);

      nsp.on('connection', socket => {
        socket.on('update', async (action, stateID, gameID, playerID) => {
          const master = new Master(
            game,
            app.context.db,
            TransportAPI(gameID, socket, this.clientInfo, this.roomInfo),
            this.auth
          );
          await master.onUpdate(action, stateID, gameID, playerID);
        });

        socket.on('sync', async (gameID, playerID, numPlayers) => {
          socket.join(gameID);

          // Remove client from any previous game that it was a part of.
          if (this.clientInfo.has(socket.id)) {
            const { gameID: oldGameID } = this.clientInfo.get(socket.id);
            this.roomInfo.get(oldGameID).delete(socket.id);
          }

          let roomClients = this.roomInfo.get(gameID);
          if (roomClients === undefined) {
            roomClients = new Set();
            this.roomInfo.set(gameID, roomClients);
          }
          roomClients.add(socket.id);

          this.clientInfo.set(socket.id, { gameID, playerID, socket });

          const master = new Master(
            game,
            app.context.db,
            TransportAPI(gameID, socket, this.clientInfo, this.roomInfo),
            this.auth
          );
          await master.onSync(gameID, playerID, numPlayers);
        });

        socket.on('disconnect', () => {
          if (this.clientInfo.has(socket.id)) {
            const { gameID } = this.clientInfo.get(socket.id);
            this.roomInfo.get(gameID).delete(socket.id);
            this.clientInfo.delete(socket.id);
          }
        });
      });
    }
  }
}
