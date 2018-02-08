/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

const Koa = require('koa');
const IO = require('koa-socket');
const Router = require('koa-router');
const koaBody = require('koa-body');
const Redux = require('redux');
import { InMemory } from './db';
import { createGameReducer } from '../core/reducer';

function Server({ games, db, authGames, secretKey }) {
  const app = new Koa();
  const io = new IO();
  const router = new Router();
  app.context.io = io;
  io.attach(app);

  if (db === undefined) {
    db = new InMemory();
  }

  const clientInfo = new Map();
  const roomInfo = new Map();
  const playerInfo = new Map();

  function createRoom(gameID, roomClients) {
    if (roomClients === undefined || roomClients === null) {
      roomClients = new Set();
    }

    roomInfo.set(gameID, roomClients);

    return roomClients;
  }

  for (const game of games) {
    const nsp = app._io.of(game.name);

    nsp.on('connection', socket => {
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
        if (
          state.ctx.currentPlayer != 'any' &&
          playerID != state.ctx.currentPlayer
        ) {
          return;
        }

        if (state._id == stateID) {
          // Update server's version of the store.
          store.dispatch(action);
          const state = store.getState();

          // Get clients connected to this current game.
          const roomClients = Array.from(roomInfo.get(gameID))
            .map(playerID => playerInfo.get(playerID))
            .filter(socketID => socketID !== undefined);
          for (const client of roomClients) {
            const playerID = clientInfo.get(client).playerID;

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

          db.set(gameID, store);
        }
      });

      socket.on('sync', (gameID, playerID, numPlayers) => {
        let roomClients = roomInfo.get(gameID);

        //If this is an authenticated game the room must exist and have the player matched to it
        if (
          authGames &&
          (roomClients === undefined || !roomClients.has(playerID))
        ) {
          socket.disconnect(true);
          return;
        }

        if (roomClients === undefined) {
          roomClients = createRoom(gameID);
        }
        roomClients.add(playerID);

        clientInfo.set(socket.id, { gameID, playerID });
        playerInfo.set(playerID, socket.id);

        socket.join(gameID);

        let store = db.get(gameID);
        if (store === undefined) {
          const reducer = createGameReducer({ game, numPlayers });
          store = Redux.createStore(reducer);
          db.set(gameID, store);
        }

        const state = store.getState();
        socket.emit('sync', gameID, {
          ...state,
          G: game.playerView(state.G, state.ctx, playerID),
        });
      });

      socket.on('disconnect', () => {
        clientInfo.delete(socket.id);
      });
    });
  }

  app.use(koaBody());
  router.post('/api/createGame', ctx => {
    if (ctx.request.headers['authorization'] !== secretKey) {
      ctx.body = {
        status: 'failed',
        message: 'auth failed',
      };
      return;
    }

    createRoom(ctx.request.body.gameID, new Set(ctx.request.body.roomClients));

    ctx.body = {
      status: 'success',
      message: 'game created',
    };
  });
  app.use(router.routes());

  return app;
}

export default Server;
