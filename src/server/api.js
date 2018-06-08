/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

const Koa = require('koa');
const Router = require('koa-router');
const koaBody = require('koa-body');
const uuid = require('uuid/v4');
const cors = require('@koa/cors');
const Redux = require('redux');

import { CreateGameReducer } from '../core/reducer';

const createCredentials = () => uuid();
const getGameMetadataKey = gameID => `${gameID}:metadata`;
const getNewGameInstanceID = () => uuid();
const createGameMetadata = () => ({
  players: {},
});

export const isActionFromAuthenticPlayer = async ({
  action,
  db,
  gameID,
  playerID,
}) => {
  const gameMetadata = await db.get(getGameMetadataKey(gameID));
  if (!gameMetadata) {
    return true;
  }

  if (!action.payload) {
    return true;
  }

  const hasCredentials = Object.keys(gameMetadata.players).some(key => {
    return !!(
      gameMetadata.players[key] && gameMetadata.players[key].credentials
    );
  });
  if (!hasCredentials) {
    return true;
  }

  if (!action.payload.credentials) {
    return false;
  }

  if (
    action.payload.credentials !== gameMetadata.players[playerID].credentials
  ) {
    return false;
  }

  return true;
};

export const createApiServer = ({ db, games }) => {
  const app = new Koa();
  const router = new Router();

  router.get('/games', async ctx => {
    ctx.body = games.map(game => game.name);
  });

  router.post('/games/:name/create', koaBody(), async ctx => {
    const gameName = ctx.params.name;
    let numPlayers = parseInt(ctx.request.body.numPlayers);
    if (!numPlayers) {
      numPlayers = 2;
    }

    const gameMetadata = createGameMetadata();

    const game = games.find(g => g.name === gameName);
    const reducer = CreateGameReducer({
      game,
      numPlayers,
    });
    const store = Redux.createStore(reducer);
    const state = store.getState();

    for (let playerIndex = 0; playerIndex < numPlayers; playerIndex++) {
      const credentials = createCredentials();
      gameMetadata.players[playerIndex] = { id: playerIndex, credentials };
    }

    const gameID = getNewGameInstanceID();
    const namespacedGameID = `${gameName}:${gameID}`;

    await db.set(getGameMetadataKey(namespacedGameID), gameMetadata);
    await db.set(namespacedGameID, state);

    ctx.body = {
      gameID,
    };
  });

  router.patch('/game_instances/:id/join', koaBody(), async ctx => {
    const gameID = ctx.params.id;
    const gameName = ctx.request.body.gameName;
    const playerID = ctx.request.body.playerID;
    const playerName = ctx.request.body.playerName;

    const namespacedGameID = `${gameName}:${gameID}`;
    const gameMetadata = await db.get(getGameMetadataKey(namespacedGameID));

    if (gameMetadata === null) {
      ctx.throw(404, 'Game not found');
    }

    gameMetadata.players[playerID].name = playerName;
    const playerCredentials = gameMetadata.players[playerID].credentials;

    await db.set(getGameMetadataKey(namespacedGameID), gameMetadata);

    ctx.body = {
      playerCredentials,
    };
  });

  app.use(cors());

  // If API_SECRET is set, then require that requests set an
  // api-secret header that is set to the same value.
  app.use(async (ctx, next) => {
    await next();

    if (
      !!process.env.API_SECRET &&
      ctx.request.headers['api-secret'] !== process.env.API_SECRET
    ) {
      ctx.throw(403, 'Invalid API secret');
    }
  });

  app.use(router.routes()).use(router.allowedMethods());

  return app;
};
