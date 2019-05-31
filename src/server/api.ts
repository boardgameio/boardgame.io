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

const isGameMetadataKey = (key, gameName) =>
  key.match(gameName + ':.*:metadata');
const getNamespacedGameID = (gameID, gameName) => `${gameName}:${gameID}`;
const createGameMetadata = () => ({
  players: {},
});

const GameMetadataKey = gameID => `${gameID}:metadata`;

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
  db,
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
    const credentials = lobbyConfig.uuid();
    gameMetadata.players[playerIndex] = { id: playerIndex, credentials };
  }

  const gameID = lobbyConfig.uuid();
  const namespacedGameID = getNamespacedGameID(gameID, game.name);

  await db.set(GameMetadataKey(namespacedGameID), gameMetadata);
  await db.set(namespacedGameID, state);

  return gameID;
};

export const createApiServer = ({ db, games, lobbyConfig }) => {
  const app = new Koa();
  return addApiToServer({ app, db, games, lobbyConfig });
};

export const addApiToServer = ({ app, db, games, lobbyConfig }) => {
  if (!lobbyConfig) {
    lobbyConfig = {};
  }
  if (!lobbyConfig.uuid) {
    lobbyConfig = { ...lobbyConfig, uuid };
  }
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
    for (let key of [...gameList]) {
      if (isGameMetadataKey(key, gameName)) {
        const gameID = key.slice(
          gameName.length + 1,
          key.lastIndexOf(':metadata')
        );
        const metadata = await db.get(key);
        rooms.push({
          gameID: gameID,
          players: Object.values(metadata.players).map((player: any) => {
            // strip away credentials
            return { id: player.id, name: player.name };
          }),
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
    const room = await db.get(`${gameName}:${GameMetadataKey(gameID)}`);
    if (!room) {
      ctx.throw(404, 'Room ' + gameID + ' not found');
    }
    const strippedRoom = {
      roomID: gameID,
      players: Object.values(room.players).map((player: any) => {
        return { id: player.id, name: player.name };
      }),
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
    const gameMetadata = await db.get(GameMetadataKey(namespacedGameID));
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
    const playerCredentials = gameMetadata.players[playerID].credentials;

    await db.set(GameMetadataKey(namespacedGameID), gameMetadata);

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
    const gameMetadata = await db.get(GameMetadataKey(namespacedGameID));
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
    if (Object.values(gameMetadata.players).some((val: any) => val.name)) {
      await db.set(GameMetadataKey(namespacedGameID), gameMetadata);
    } else {
      // remove room
      await db.remove(roomID);
      await db.remove(GameMetadataKey(namespacedGameID));
    }
    ctx.body = {};
  });

  router.post('/games/:name/:id/playAgain', koaBody(), async ctx => {
    const gameName = ctx.params.name;
    const roomID = ctx.params.id;
    const playerID = ctx.request.body.playerID;
    const credentials = ctx.request.body.credentials;
    const namespacedGameID = getNamespacedGameID(roomID, gameName);
    const gameMetadata = await db.get(GameMetadataKey(namespacedGameID));
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

    await db.set(GameMetadataKey(namespacedGameID), gameMetadata);

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
    const gameMetadata = await db.get(GameMetadataKey(namespacedGameID));
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
    await db.set(GameMetadataKey(namespacedGameID), gameMetadata);
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
