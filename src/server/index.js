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
import { createGameReducer } from '../both/reducer';

const games = {};

function Server({game, numPlayers}) {
  const app = new Koa();
  const io = new IO();

  app.context.io = io;
  io.attach(app);

  const reducer = createGameReducer({game, numPlayers});

  io.on('connection', (ctx) => {
    const socket = ctx.socket;

    socket.on('action', action => {
      const gameid = action._gameid;

      if (!(gameid in games)) {
        return { error: 'game not found' };
      }

      const store = games[gameid];
      const state = store.getState();

      if (state._id == action._id) {
        store.dispatch(action);
        socket.broadcast.emit('action', action);
      }
    });

    socket.on('sync', gameid => {
      if (!(gameid in games)) {
        games[gameid] = Redux.createStore(reducer);
      }

      const store = games[gameid];
      const state = store.getState();
      socket.emit('sync', state);
    });
  });

  return app;
}

export default Server;
