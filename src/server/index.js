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

    socket.on('action', action => {
      const gameid = action._gameid;
      const store = db.get(gameid);

      if (store == null) {
        return { error: 'game not found' };
      }

      const state = store.getState();

      if (state._id == action._id) {
        store.dispatch(action);
        socket.broadcast.emit('action', action);
        db.set(gameid, store);
      }
    });

    socket.on('sync', gameid => {
      let store = null;
      if (db.get(gameid) == null) {
        store = Redux.createStore(reducer);
        db.set(gameid, store);
      } else {
        store = db.get(gameid);
      }

      const state = store.getState();
      socket.emit('sync', state);
    });
  });

  return app;
}

export default Server;
