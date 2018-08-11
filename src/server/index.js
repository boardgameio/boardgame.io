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

import { DBFromEnv } from './db';
import { CreateGameReducer } from '../core/reducer';
import { MAKE_MOVE, GAME_EVENT } from '../core/action-types';
import { createApiServer, isActionFromAuthenticPlayer } from './api';

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
    db = DBFromEnv();
  }

  const api = createApiServer({ db, games });

  const clientInfo = _clientInfo || new Map();
  const roomInfo = _roomInfo || new Map();

  for (const game of games) {
    const nsp = app._io.of(game.name);

    nsp.on('connection', socket => {
      socket.on('update', async (action, stateID, gameID, playerID) => {
        let state = await db.get(gameID);

        if (state === undefined) {
          return { error: 'game not found' };
        }

        const reducer = CreateGameReducer({
          game,
          numPlayers: state.ctx.numPlayers,
        });
        const store = Redux.createStore(reducer, state);

        const isActionAuthentic = await isActionFromAuthenticPlayer({
          action,
          db,
          gameID,
          playerID,
        });
        if (!isActionAuthentic) {
          return { error: 'unauthorized action' };
        }

        // Check whether the player is allowed to make the move.
        if (
          action.type == MAKE_MOVE &&
          !game.flow.canPlayerMakeMove(state.G, state.ctx, playerID)
        ) {
          return;
        }

        // Check whether the player is allowed to call the event.
        if (
          action.type == GAME_EVENT &&
          !game.flow.canPlayerCallEvent(state.G, state.ctx, playerID)
        ) {
          return;
        }

        if (state._stateID == stateID) {
          let log = store.getState().log;

          // Update server's version of the store.
          store.dispatch(action);
          state = store.getState();

          // Get clients connected to this current game.
          const roomClients = roomInfo.get(gameID);
          for (const client of roomClients.values()) {
            const { playerID } = clientInfo.get(client);
            const ctx = Object.assign({}, state.ctx, { _random: undefined });
            const filteredState = Object.assign({}, state, {
              G: game.playerView(state.G, ctx, playerID),
              ctx: ctx,
              log: undefined,
              deltalog: undefined,
            });

            if (client === socket.id) {
              socket.emit('update', gameID, filteredState, state.deltalog);
            } else {
              socket
                .to(client)
                .emit('update', gameID, filteredState, state.deltalog);
            }
          }

          // TODO: We currently attach the log back into the state
          // object before storing it, but this should probably
          // sit in a different part of the database eventually.
          log = [...log, ...state.deltalog];
          const stateWithLog = Object.assign({}, state, log);

          await db.set(gameID, stateWithLog);
        }

        return;
      });

      socket.on('sync', async (gameID, playerID, numPlayers) => {
        socket.join(gameID);
        const reducer = CreateGameReducer({ game, numPlayers });
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
          state.log = [];
          await db.set(gameID, state);
        }

        const ctx = Object.assign({}, state.ctx, { _random: undefined });
        const filteredState = Object.assign({}, state, {
          G: game.playerView(state.G, ctx, playerID),
          ctx: ctx,
          log: undefined,
          deltalog: undefined,
        });

        socket.emit('sync', gameID, filteredState, state.log);

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
    api,
    db,
    run: async (port, callback) => {
      await db.connect();
      await api.listen(port + 1);
      await app.listen(port, callback);
    },
  };
}
