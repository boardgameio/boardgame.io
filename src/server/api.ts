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
import { Server, GameConfig } from '../types';

const createGameMetadata = ({ gameName }): Server.GameMetadata => ({
  gameName,
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
  game: GameConfig,
  numPlayers: number,
  setupData: object,
  lobbyConfig: Server.LobbyConfig
) => {
  const gameMetadata = createGameMetadata({ gameName: game.name });

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

  await db.setMetadata(gameID, gameMetadata);
  await db.setState(gameID, state);

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
  lobbyConfig?: Server.LobbyConfig;
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
  lobbyConfig?: Server.LobbyConfig;
  generateCredentials?: Function;
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
    const gameList = await db.listGames(gameName);
    let rooms = [];
    for (let gameID of gameList) {
      const { metadata } = await (db as StorageAPI.Async).fetch(gameID, {
        metadata: true,
      });
      rooms.push({
        gameID,
        players: Object.values(metadata.players).map((player: any) => {
          // strip away credentials
          return { id: player.id, name: player.name };
        }),
        setupData: metadata.setupData,
      });
    }
    ctx.body = {
      rooms: rooms,
    };
  });

  router.get('/games/:name/:id', async ctx => {
    const gameID = ctx.params.id;
    const { metadata } = await (db as StorageAPI.Async).fetch(gameID, {
      metadata: true,
    });
    if (!metadata) {
      ctx.throw(404, 'Room ' + gameID + ' not found');
    }
    const strippedRoom = {
      roomID: gameID,
      players: Object.values(metadata.players).map((player: any) => {
        return { id: player.id, name: player.name };
      }),
      setupData: metadata.setupData,
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
    const gameID = ctx.params.id;
    const { metadata } = await (db as StorageAPI.Async).fetch(gameID, {
      metadata: true,
    });
    if (!metadata) {
      ctx.throw(404, 'Game ' + gameID + ' not found');
    }
    if (!metadata.players[playerID]) {
      ctx.throw(404, 'Player ' + playerID + ' not found');
    }
    if (metadata.players[playerID].name) {
      ctx.throw(409, 'Player ' + playerID + ' not available');
    }

    metadata.players[playerID].name = playerName;
    const playerCredentials = await lobbyConfig.generateCredentials(ctx);
    metadata.players[playerID].credentials = playerCredentials;

    await db.setMetadata(gameID, metadata);

    ctx.body = {
      playerCredentials,
    };
  });

  router.post('/games/:name/:id/leave', koaBody(), async ctx => {
    const gameID = ctx.params.id;
    const playerID = ctx.request.body.playerID;
    const credentials = ctx.request.body.credentials;
    const { metadata } = await (db as StorageAPI.Async).fetch(gameID, {
      metadata: true,
    });
    if (typeof playerID === 'undefined' || playerID === null) {
      ctx.throw(403, 'playerID is required');
    }

    if (!metadata) {
      ctx.throw(404, 'Game ' + gameID + ' not found');
    }
    if (!metadata.players[playerID]) {
      ctx.throw(404, 'Player ' + playerID + ' not found');
    }
    if (credentials !== metadata.players[playerID].credentials) {
      ctx.throw(403, 'Invalid credentials ' + credentials);
    }

    delete metadata.players[playerID].name;
    delete metadata.players[playerID].credentials;
    if (Object.values(metadata.players).some((val: any) => val.name)) {
      await db.setMetadata(gameID, metadata);
    } else {
      // remove room
      await db.wipe(gameID);
    }
    ctx.body = {};
  });

  router.post('/games/:name/:id/playAgain', koaBody(), async ctx => {
    const gameName = ctx.params.name;
    const gameID = ctx.params.id;
    const playerID = ctx.request.body.playerID;
    const credentials = ctx.request.body.credentials;
    const { metadata } = await (db as StorageAPI.Async).fetch(gameID, {
      metadata: true,
    });
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

    if (!metadata) {
      ctx.throw(404, 'Game ' + gameID + ' not found');
    }
    if (!metadata.players[playerID]) {
      ctx.throw(404, 'Player ' + playerID + ' not found');
    }
    if (credentials !== metadata.players[playerID].credentials) {
      ctx.throw(403, 'Invalid credentials ' + credentials);
    }

    // Check if nextRoom is already set, if so, return that id.
    if (metadata.nextRoomID) {
      ctx.body = { nextRoomID: metadata.nextRoomID };
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
    metadata.nextRoomID = nextRoomID;

    await db.setMetadata(gameID, metadata);

    ctx.body = {
      nextRoomID,
    };
  });

  router.post('/games/:name/:id/rename', koaBody(), async ctx => {
    const gameID = ctx.params.id;
    const playerID = ctx.request.body.playerID;
    const credentials = ctx.request.body.credentials;
    const newName = ctx.request.body.newName;
    const { metadata } = await (db as StorageAPI.Async).fetch(gameID, {
      metadata: true,
    });
    if (typeof playerID === 'undefined') {
      ctx.throw(403, 'playerID is required');
    }
    if (!newName) {
      ctx.throw(403, 'newName is required');
    }
    if (!metadata) {
      ctx.throw(404, 'Game ' + gameID + ' not found');
    }
    if (!metadata.players[playerID]) {
      ctx.throw(404, 'Player ' + playerID + ' not found');
    }
    if (credentials !== metadata.players[playerID].credentials) {
      ctx.throw(403, 'Invalid credentials ' + credentials);
    }

    metadata.players[playerID].name = newName;
    await db.setMetadata(gameID, metadata);
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
