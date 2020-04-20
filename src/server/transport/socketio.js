/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { Master } from '../../master/master';
const IO = require('koa-socket-2');

const PING_TIMEOUT = 20 * 1e3;
const PING_INTERVAL = 10 * 1e3;

/**
 * API that's exposed by SocketIO for the Master to send
 * information to the clients.
 */
export function TransportAPI(gameID, socket, clientInfo, roomInfo) {
  /**
   * Send a message to a specific client.
   */
  const send = ({ type, playerID, args }) => {
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
  const sendAll = arg => {
    roomInfo.get(gameID).forEach(c => {
      const playerID = clientInfo.get(c).playerID;

      if (typeof arg === 'function') {
        const t = arg(playerID);
        t.playerID = playerID;
        send(t);
      } else {
        arg.playerID = playerID;
        send(arg);
      }
    });
  };

  return { send, sendAll };
}

/**
 * Transport interface that uses socket.io
 */
export function SocketIO({
  clientInfo = new Map(),
  roomInfo = new Map(),
  auth = true,
  https,
} = {}) {
  return {
    init: (app, games) => {
      const io = new IO({
        ioOptions: {
          pingTimeout: PING_TIMEOUT,
          pingInterval: PING_INTERVAL,
        },
      });

      app.context.io = io;
      io.attach(app, !!https, https);

      for (const game of games) {
        const nsp = app._io.of(game.name);

        nsp.on('connection', socket => {
          socket.on('update', async (action, stateID, gameID, playerID) => {
            const master = new Master(
              game,
              app.context.db,
              TransportAPI(gameID, socket, clientInfo, roomInfo),
              auth
            );
            await master.onUpdate(action, stateID, gameID, playerID);
          });

          socket.on('sync', async (gameID, playerID, numPlayers) => {
            socket.join(gameID);

            // Remove client from any previous game that it was a part of.
            if (clientInfo.has(socket.id)) {
              const { gameID: oldGameID } = clientInfo.get(socket.id);
              roomInfo.get(oldGameID).delete(socket.id);
            }

            let roomClients = roomInfo.get(gameID);
            if (roomClients === undefined) {
              roomClients = new Set();
              roomInfo.set(gameID, roomClients);
            }
            roomClients.add(socket.id);

            clientInfo.set(socket.id, { gameID, playerID, socket });

            const master = new Master(
              game,
              app.context.db,
              TransportAPI(gameID, socket, clientInfo, roomInfo),
              auth
            );
            await master.onSync(gameID, playerID, numPlayers);
          });

          socket.on('disconnect', () => {
            if (clientInfo.has(socket.id)) {
              const { gameID } = clientInfo.get(socket.id);
              roomInfo.get(gameID).delete(socket.id);
              clientInfo.delete(socket.id);
            }
          });
        });
      }
    },
  };
}
