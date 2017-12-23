/*
 * Copyright 2017 Google Inc.
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

const Koa = require('koa');
const IO = require('koa-socket');
const Redux = require('redux');
import { InMemory } from './db';
import { createGameReducer } from '../both/reducer';

function Server({game, numPlayers}) {
  const app = new Koa();
  const io = new IO();

  app.context.io = io;
  io.attach(app);

  const reducer = createGameReducer({game, numPlayers});
  const db = new InMemory(reducer);

  io.on('connection', (ctx) => {
    const socket = ctx.socket;

    socket.on('action', (action, stateID, gameID, playerID) => {
      const store = db.get(gameID);

      if (store === undefined) {
        return { error: 'game not found' };
      }

      const state = store.getState();

      // Bail out if the player making the move is not
      // the current player. The null player is always
      // allowed.
      if (playerID != null &&
          playerID != state.ctx.currentPlayer) {
        return;
      }

      if (state._id == stateID) {
        store.dispatch(action);
        const state = store.getState();
        socket.broadcast.emit('sync', gameID, {
          ...state,
          G: game.playerView(state.G, state.ctx)
        });
        db.set(gameID, store);
      }
    });

    socket.on('sync', gameID => {
      let store = db.get(gameID);
      if (store === undefined) {
        store = Redux.createStore(reducer);
        db.set(gameID, store);
      }

      const state = store.getState();
      socket.emit('sync', gameID, {
        ...state,
        G: game.playerView(state.G, state.ctx)
      });
    });
  });

  return app;
}

export default Server;
