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
const uuid = require('shortid').generate;
const cors = require('@koa/cors');

import { InitializeGame } from '../core/initialize';
import * as StorageAPI from './db/base';

const getNamespacedGameID = (gameID: string, gameName: string) =>
  `${gameName}:${gameID}`;
const createGameMetadata = () => ({
  players: {},
  setupData: {},
});

/**
 * Creates a new game.
 *
 * @param {object} db - The storage API.
 * @param {object} game - The game config object.
 * @param {number} numPlayers - The number of players.
 * @param {object} setupData - User-defined object that's available
 *                             during game setup.
 * @param {object } lobbyConfig - Configuration options for the lobby.
 */
export const CreateGame = async (
  db: StorageAPI.Sync | StorageAPI.Async,
  game,
  numPlayers,
  setupData,
  lobbyConfig
) => {
  const gameMetadata = createGameMetadata();

  const state = InitializeGame({
    game,
    numPlayers,
    setupData,
  });

  for (let playerIndex = 0; playerIndex < numPlayers; playerIndex++) {
    gameMetadata.players[playerIndex] = { id: playerIndex };
  }

  gameMetadata.setupData = setupData;

  const gameID = lobbyConfig.uuid();
  const namespacedGameID = getNamespacedGameID(gameID, game.name);

  await db.setMetadata(namespacedGameID, gameMetadata);
  await db.setState(namespacedGameID, state);

  return gameID;
};

export const createApiServer = ({
  db,
  games,
  lobbyConfig,
  generateCredentials,
}: {
  db: any;
  games: any;
  lobbyConfig?: any;
  generateCredentials?: any;
}) => {
  const app = new Koa();
  return addApiToServer({ app, db, games, lobbyConfig, generateCredentials });
};

export const addApiToServer = ({
  app,
  db,
  games,
  lobbyConfig,
  generateCredentials,
}: {
  app: any;
  games: any;
  lobbyConfig?: any;
  generateCredentials?: any;
  db: StorageAPI.Sync | StorageAPI.Async;
}) => {
  if (!lobbyConfig) lobbyConfig = {};
  lobbyConfig = {
    ...lobbyConfig,
    uuid: lobbyConfig.uuid || uuid,
    generateCredentials: generateCredentials || lobbyConfig.uuid || uuid,
  };
  const router = new Router();

  router.get('/games', async ctx => {
    ctx.body = games.map(game => game.name);
  });

  router.post('/games/:name/create', koaBody(), async ctx => {
    // The name of the game (for example: tic-tac-toe).
    const gameName = ctx.params.name;
    // User-data to pass to the game setup function.
    const setupData = ctx.request.body.setupData;
    // The number of players for this game instance.
    let numPlayers = parseInt(ctx.request.body.numPlayers);
    if (!numPlayers) {
      numPlayers = 2;
    }

    const game = games.find(g => g.name === gameName);
    const gameID = await CreateGame(
      db,
      game,
      numPlayers,
      setupData,
      lobbyConfig
    );

    ctx.body = {
      gameID,
    };
  });

  router.get('/games/:name', async ctx => {
    const gameName = ctx.params.name;
    const gameList = await db.list();
    let rooms = [];
    for (let gameID of [...gameList]) {
      if (gameID.startsWith(`${gameName}:`)) {
        const metadata = await db.getMetadata(gameID);
        rooms.push({
          gameID,
          players: Object.values(metadata.players).map((player: any) => {
            // strip away credentials
            return { id: player.id, name: player.name };
          }),
          setupData: metadata.setupData,
        });
      }
    }
    ctx.body = {
      rooms: rooms,
    };
  });

  router.get('/games/:name/:id', async ctx => {
    const gameName = ctx.params.name;
    const gameID = ctx.params.id;
    const namespacedGameID = getNamespacedGameID(gameID, gameName);
    const room = await db.getMetadata(namespacedGameID);
    if (!room) {
      ctx.throw(404, 'Room ' + gameID + ' not found');
    }
    const strippedRoom = {
      roomID: namespacedGameID,
      players: Object.values(room.players).map((player: any) => {
        return { id: player.id, name: player.name };
      }),
      setupData: room.setupData,
    };
    ctx.body = strippedRoom;
  });

  router.post('/games/:name/:id/join', koaBody(), async ctx => {
    const playerID = ctx.request.body.playerID;
    const playerName = ctx.request.body.playerName;
    if (typeof playerID === 'undefined' || playerID === null) {
      ctx.throw(403, 'playerID is required');
    }
    if (!playerName) {
      ctx.throw(403, 'playerName is required');
    }
    const gameName = ctx.params.name;
    const roomID = ctx.params.id;
    const namespacedGameID = getNamespacedGameID(roomID, gameName);
    const gameMetadata = await db.getMetadata(namespacedGameID);
    if (!gameMetadata) {
      ctx.throw(404, 'Game ' + roomID + ' not found');
    }
    if (!gameMetadata.players[playerID]) {
      ctx.throw(404, 'Player ' + playerID + ' not found');
    }
    if (gameMetadata.players[playerID].name) {
      ctx.throw(409, 'Player ' + playerID + ' not available');
    }

    gameMetadata.players[playerID].name = playerName;
    const playerCredentials = await lobbyConfig.generateCredentials(ctx);
    gameMetadata.players[playerID].credentials = playerCredentials;

    await db.setMetadata(namespacedGameID, gameMetadata);

    ctx.body = {
      playerCredentials,
    };
  });

  router.post('/games/:name/:id/leave', koaBody(), async ctx => {
    const gameName = ctx.params.name;
    const roomID = ctx.params.id;
    const playerID = ctx.request.body.playerID;
    const credentials = ctx.request.body.credentials;
    const namespacedGameID = getNamespacedGameID(roomID, gameName);
    const gameMetadata = await db.getMetadata(namespacedGameID);
    if (typeof playerID === 'undefined' || playerID === null) {
      ctx.throw(403, 'playerID is required');
    }

    if (!gameMetadata) {
      ctx.throw(404, 'Game ' + roomID + ' not found');
    }
    if (!gameMetadata.players[playerID]) {
      ctx.throw(404, 'Player ' + playerID + ' not found');
    }
    if (credentials !== gameMetadata.players[playerID].credentials) {
      ctx.throw(403, 'Invalid credentials ' + credentials);
    }

    delete gameMetadata.players[playerID].name;
    delete gameMetadata.players[playerID].credentials;
    if (Object.values(gameMetadata.players).some((val: any) => val.name)) {
      await db.setMetadata(namespacedGameID, gameMetadata);
    } else {
      // remove room
      await db.remove(namespacedGameID);
    }
    ctx.body = {};
  });

  router.post('/games/:name/:id/playAgain', koaBody(), async ctx => {
    const gameName = ctx.params.name;
    const roomID = ctx.params.id;
    const playerID = ctx.request.body.playerID;
    const credentials = ctx.request.body.credentials;
    const namespacedGameID = getNamespacedGameID(roomID, gameName);
    const gameMetadata = await db.getMetadata(namespacedGameID);
    // User-data to pass to the game setup function.
    const setupData = ctx.request.body.setupData;
    // The number of players for this game instance.
    let numPlayers = parseInt(ctx.request.body.numPlayers);
    if (!numPlayers) {
      numPlayers = 2;
    }

    if (typeof playerID === 'undefined' || playerID === null) {
      ctx.throw(403, 'playerID is required');
    }

    if (!gameMetadata) {
      ctx.throw(404, 'Game ' + roomID + ' not found');
    }
    if (!gameMetadata.players[playerID]) {
      ctx.throw(404, 'Player ' + playerID + ' not found');
    }
    if (credentials !== gameMetadata.players[playerID].credentials) {
      ctx.throw(403, 'Invalid credentials ' + credentials);
    }

    // Check if nextRoom is already set, if so, return that id.
    if (gameMetadata.nextRoomID) {
      ctx.body = { nextRoomID: gameMetadata.nextRoomID };
      return;
    }

    const game = games.find(g => g.name === gameName);
    const nextRoomID = await CreateGame(
      db,
      game,
      numPlayers,
      setupData,
      lobbyConfig
    );
    gameMetadata.nextRoomID = nextRoomID;

    await db.setMetadata(namespacedGameID, gameMetadata);

    ctx.body = {
      nextRoomID,
    };
  });

  router.post('/games/:name/:id/rename', koaBody(), async ctx => {
    const gameName = ctx.params.name;
    const roomID = ctx.params.id;
    const playerID = ctx.request.body.playerID;
    const credentials = ctx.request.body.credentials;
    const newName = ctx.request.body.newName;
    const namespacedGameID = getNamespacedGameID(roomID, gameName);
    const gameMetadata = await db.getMetadata(namespacedGameID);
    if (typeof playerID === 'undefined') {
      ctx.throw(403, 'playerID is required');
    }
    if (!newName) {
      ctx.throw(403, 'newName is required');
    }
    if (!gameMetadata) {
      ctx.throw(404, 'Game ' + roomID + ' not found');
    }
    if (!gameMetadata.players[playerID]) {
      ctx.throw(404, 'Player ' + playerID + ' not found');
    }
    if (credentials !== gameMetadata.players[playerID].credentials) {
      ctx.throw(403, 'Invalid credentials ' + credentials);
    }

    gameMetadata.players[playerID].name = newName;
    await db.setMetadata(namespacedGameID, gameMetadata);
    ctx.body = {};
  });

  app.use(cors());

  // If API_SECRET is set, then require that requests set an
  // api-secret header that is set to the same value.
  app.use(async (ctx, next) => {
    if (
      !!process.env.API_SECRET &&
      ctx.request.headers['api-secret'] !== process.env.API_SECRET
    ) {
      ctx.throw(403, 'Invalid API secret');
    }

    await next();
  });

  app.use(router.routes()).use(router.allowedMethods());

  return app;
};
