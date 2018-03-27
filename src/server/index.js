/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

const Koa = require('koa');
const IO = require('koa-socket');
const Redux = require('redux');
import { InMemory, Mongo } from './db';
import { createGameReducer } from '../core/reducer';
const PING_TIMEOUT = 20 * 1e3;
const PING_INTERVAL = 10 * 1e3;

export function Server({ games, db, _clientInfo, _roomInfo }) {
  const app = new Koa();
  const io = new IO({
    ioOptions: {
      pingTimeout: PING_TIMEOUT,
      pingInterval: PING_INTERVAL,
    },
  });
  app.context.io = io;
  io.attach(app);

  if (db === undefined) {
    if (process.env.MONGO_URI) {
      db = new Mongo({ url: process.env.MONGO_URI });
    } else {
      db = new InMemory();
    }
  }

  const clientInfo = _clientInfo || new Map();
  const roomInfo = _roomInfo || new Map();

  for (const game of games) {
    const nsp = app._io.of(game.name);

    nsp.on('connection', socket => {
      socket.on('action', async (action, stateID, gameID, playerID) => {
        let state = await db.get(gameID);

        if (state === undefined) {
          return { error: 'game not found' };
        }

        const reducer = createGameReducer({
          game,
          numPlayers: state.ctx.numPlayers,
        });
        const store = Redux.createStore(reducer, state);

        // The null player is a view-only player.
        if (playerID == null) {
          return;
        }

        // Check whether the player is allowed to make the move
        if (
          !game.flow.canMakeMove(state.G, state.ctx, {
            ...action.payload,
            playerID,
          })
        ) {
          return;
        }

        if (state._stateID == stateID) {
          // Update server's version of the store.
          store.dispatch(action);
          state = store.getState();

          // Get clients connected to this current game.
          const roomClients = roomInfo.get(gameID);
          for (const client of roomClients.values()) {
            const { playerID } = clientInfo.get(client);
            const ctx = Object.assign({}, state.ctx, { _random: undefined });
            const newState = Object.assign({}, state, {
              G: game.playerView(state.G, ctx, playerID),
              ctx: ctx,
            });

            if (client === socket.id) {
              socket.emit('sync', gameID, newState);
            } else {
              socket.to(client).emit('sync', gameID, newState);
            }
          }

          await db.set(gameID, store.getState());
        }

        return;
      });

      socket.on('sync', async (gameID, playerID, numPlayers) => {
        socket.join(gameID);
        const reducer = createGameReducer({ game, numPlayers });
        let roomClients = roomInfo.get(gameID);
        if (roomClients === undefined) {
          roomClients = new Set();
          roomInfo.set(gameID, roomClients);
        }
        roomClients.add(socket.id);

        clientInfo.set(socket.id, { gameID, playerID });

        let state = await db.get(gameID);

        if (state === undefined) {
          const store = Redux.createStore(reducer);
          state = store.getState();
          await db.set(gameID, state);
        }

        const ctx = Object.assign({}, state.ctx, { _random: undefined });
        const newState = Object.assign({}, state, {
          G: game.playerView(state.G, ctx, playerID),
          ctx,
        });

        socket.emit('sync', gameID, newState);

        return;
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

  return {
    app,
    db,
    run: async (port, callback) => {
      await db.connect();
      app.listen(port, callback);
    },
  };
}
