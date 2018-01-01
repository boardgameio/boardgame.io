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

function Server({game, numPlayers}) {
  const app = new Koa();
  const io = new IO();

  app.context.io = io;
  io.attach(app);

  const reducer = createGameReducer({game, numPlayers});
  const db = new InMemory(reducer);
  const clientInfo = new Map();
  const roomInfo = new Map();

  io.on('connection', (ctx) => {
    const socket = ctx.socket;

    socket.on('action', (action, stateID, gameID, playerID) => {
      const store = db.get(gameID);

      if (store === undefined) {
        return { error: 'game not found' };
      }

      const state = store.getState();

      // The null player is a view-only player.
      if (playerID == null) {
        return;
      }

      // Bail out if the player making the move is not
      // the current player.
      if (state.ctx.currentPlayer != 'any' &&
          playerID != state.ctx.currentPlayer) {
        return;
      }

      if (state._id == stateID) {
        // Update server's version of the store.
        store.dispatch(action);
        const state = store.getState();

        // Get clients connected to this current game.
        const roomClients = roomInfo.get(gameID);
        for (const client of roomClients.values()) {
          // Don't send an update to the current client.
          if (client == socket.id) {
            continue;
          }

          const playerID = clientInfo.get(client);

          socket.to(client).emit('sync', gameID, {
            ...state,
            G: game.playerView(state.G, state.ctx, playerID)
          });
        }

        db.set(gameID, store);
      }
    });

    socket.on('sync', (gameID, playerID) => {
      socket.join(gameID);

      let roomClients = roomInfo.get(gameID);
      if (roomClients === undefined) {
        roomClients = new Set();
        roomInfo.set(gameID, roomClients);
      }
      roomClients.add(socket.id);

      clientInfo.set(socket.id, { gameID, playerID });

      let store = db.get(gameID);
      if (store === undefined) {
        store = Redux.createStore(reducer);
        db.set(gameID, store);
      }

      const state = store.getState();
      socket.emit('sync', gameID, {
        ...state,
        G: game.playerView(state.G, state.ctx, playerID)
      });
    });

    socket.on('disconnect', () => {
      clientInfo.delete(socket.id);
    });
  });

  return app;
}

export default Server;
