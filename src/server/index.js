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
import { InMemory } from './db';
import { createGameReducer } from '../core/reducer';

function Server({ games, db }) {
  const app = new Koa();
  const io = new IO();
  app.context.io = io;
  io.attach(app);

  if (db === undefined) {
    db = new InMemory();
  }

  const clientInfo = new Map();
  const roomInfo = new Map();

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

        // Bail out if the player making the move is not
        // the current player.
        if (
          state.ctx.currentPlayer != 'any' &&
          playerID != state.ctx.currentPlayer
        ) {
          return;
        }

        if (state._id == stateID) {
          // Update server's version of the store.
          store.dispatch(action);
          state = store.getState();

          // Get clients connected to this current game.
          const roomClients = roomInfo.get(gameID);
          for (const client of roomClients.values()) {
            const playerID = clientInfo.get(client);

            if (client === socket.id) {
              socket.emit('sync', gameID, {
                ...state,
                G: game.playerView(state.G, state.ctx, playerID),
              });
            } else {
              socket.to(client).emit('sync', gameID, {
                ...state,
                G: game.playerView(state.G, state.ctx, playerID),
              });
            }
          }

          db.set(gameID, store.getState());
        }
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

        socket.emit('sync', gameID, {
          ...state,
          G: game.playerView(state.G, state.ctx, playerID),
        });

        return;
      });

      socket.on('disconnect', () => {
        clientInfo.delete(socket.id);
      });
    });
  }

  return app;
}

export default Server;
