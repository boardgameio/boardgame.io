/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import type Koa from 'koa';
import type Router from 'koa-router';
import koaBody from 'koa-body';
import { nanoid } from 'nanoid';
import cors from '@koa/cors';
import type IOTypes from 'socket.io';
import { createMatch, getFirstAvailablePlayerID, getNumPlayers } from './util';
import type { Auth } from './auth';
import type { Server, LobbyAPI, Game, StorageAPI } from '../types';

/**
 * Creates a new match.
 *
 * @param {object} db - The storage API.
 * @param {object} game - The game config object.
 * @param {number} numPlayers - The number of players.
 * @param {object} setupData - User-defined object that's available
 *                             during game setup.
 * @param {object } lobbyConfig - Configuration options for the lobby.
 * @param {boolean} unlisted - Whether the match should be excluded from public listing.
 */
const CreateMatch = async ({
  ctx,
  db,
  uuid,
  ...opts
}: {
  db: StorageAPI.Sync | StorageAPI.Async;
  ctx: Koa.BaseContext;
  uuid: () => string;
} & Parameters<typeof createMatch>[0]): Promise<string> => {
  const matchID = uuid();
  const match = createMatch(opts);

  if ('setupDataError' in match) {
    ctx.throw(400, match.setupDataError);
  } else {
    await db.createMatch(matchID, match);
    return matchID;
  }
};

/**
 * Create a metadata object without secret credentials to return to the client.
 *
 * @param {string} matchID - The identifier of the match the metadata belongs to.
 * @param {object} metadata - The match metadata object to strip credentials from.
 * @return - A metadata object without player credentials.
 */
const createClientMatchData = (
  matchID: string,
  metadata: Server.MatchData
): LobbyAPI.Match => {
  return {
    ...metadata,
    matchID,
    players: Object.values(metadata.players).map((player) => {
      // strip away credentials
      const { credentials, ...strippedInfo } = player;
      return strippedInfo;
    }),
  };
};

export const configureRouter = ({
  router,
  db,
  auth,
  games,
  uuid = () => nanoid(11),
}: {
  router: Router<any, Server.AppCtx>;
  auth: Auth;
  games: Game[];
  uuid?: () => string;
  db: StorageAPI.Sync | StorageAPI.Async;
}) => {
  /**
   * List available games.
   *
   * @return - Array of game names as string.
   */
  router.get('/games', async (ctx) => {
    const body: LobbyAPI.GameList = games.map((game) => game.name);
    ctx.body = body;
  });

  /**
   * Create a new match of a given game.
   *
   * @param {string} name - The name of the game of the new match.
   * @param {number} numPlayers - The number of players.
   * @param {object} setupData - User-defined object that's available
   *                             during game setup.
   * @param {boolean} unlisted - Whether the match should be excluded from public listing.
   * @return - The ID of the created match.
   */
  router.post('/games/:name/create', koaBody(), async (ctx) => {
    // The name of the game (for example: tic-tac-toe).
    const gameName = ctx.params.name;
    // User-data to pass to the game setup function.
    const setupData = ctx.request.body.setupData;
    // Whether the game should be excluded from public listing.
    const unlisted = ctx.request.body.unlisted;
    // The number of players for this game instance.
    const numPlayers = Number.parseInt(ctx.request.body.numPlayers);

    const game = games.find((g) => g.name === gameName);
    if (!game) ctx.throw(404, 'Game ' + gameName + ' not found');

    const matchID = await CreateMatch({
      ctx,
      db,
      game,
      numPlayers,
      setupData,
      uuid,
      unlisted,
    });

    const body: LobbyAPI.CreatedMatch = { matchID };
    ctx.body = body;
  });

  /**
   * List matches for a given game.
   *
   * This does not return matches that are marked as unlisted.
   *
   * @param {string} name - The name of the game.
   * @return - Array of match objects.
   */
  router.get('/games/:name', async (ctx) => {
    const gameName = ctx.params.name;
    const {
      isGameover: isGameoverString,
      updatedBefore: updatedBeforeString,
      updatedAfter: updatedAfterString,
    } = ctx.query;

    let isGameover: boolean | undefined;
    if (isGameoverString) {
      if (isGameoverString.toLowerCase() === 'true') {
        isGameover = true;
      } else if (isGameoverString.toLowerCase() === 'false') {
        isGameover = false;
      }
    }
    let updatedBefore: number | undefined;
    if (updatedBeforeString) {
      const parsedNumber = Number.parseInt(updatedBeforeString, 10);
      if (parsedNumber > 0) {
        updatedBefore = parsedNumber;
      }
    }
    let updatedAfter: number | undefined;
    if (updatedAfterString) {
      const parsedNumber = Number.parseInt(updatedAfterString, 10);
      if (parsedNumber > 0) {
        updatedAfter = parsedNumber;
      }
    }
    const matchList = await db.listMatches({
      gameName,
      where: {
        isGameover,
        updatedAfter,
        updatedBefore,
      },
    });
    const matches = [];
    for (const matchID of matchList) {
      const { metadata } = await (db as StorageAPI.Async).fetch(matchID, {
        metadata: true,
      });
      if (!metadata.unlisted) {
        matches.push(createClientMatchData(matchID, metadata));
      }
    }
    const body: LobbyAPI.MatchList = { matches };
    ctx.body = body;
  });

  /**
   * Get data about a specific match.
   *
   * @param {string} name - The name of the game.
   * @param {string} id - The ID of the match.
   * @return - A match object.
   */
  router.get('/games/:name/:id', async (ctx) => {
    const matchID = ctx.params.id;
    const { metadata } = await (db as StorageAPI.Async).fetch(matchID, {
      metadata: true,
    });
    if (!metadata) {
      ctx.throw(404, 'Match ' + matchID + ' not found');
    }
    const body: LobbyAPI.Match = createClientMatchData(matchID, metadata);
    ctx.body = body;
  });

  /**
   * Join a given match.
   *
   * @param {string} name - The name of the game.
   * @param {string} id - The ID of the match.
   * @param {string} playerID - The ID of the player who joins. If not sent, will be assigned to the first index available.
   * @param {string} playerName - The name of the player who joins.
   * @param {object} data - The default data of the player in the match.
   * @return - Player credentials to use when interacting in the joined match.
   */
  router.post('/games/:name/:id/join', koaBody(), async (ctx) => {
    let playerID = ctx.request.body.playerID;
    const playerName = ctx.request.body.playerName;
    const data = ctx.request.body.data;
    const matchID = ctx.params.id;
    if (!playerName) {
      ctx.throw(403, 'playerName is required');
    }

    const { metadata } = await (db as StorageAPI.Async).fetch(matchID, {
      metadata: true,
    });
    if (!metadata) {
      ctx.throw(404, 'Match ' + matchID + ' not found');
    }

    if (typeof playerID === 'undefined' || playerID === null) {
      playerID = getFirstAvailablePlayerID(metadata.players);
      if (playerID === undefined) {
        const numPlayers = getNumPlayers(metadata.players);
        ctx.throw(
          409,
          `Match ${matchID} reached maximum number of players (${numPlayers})`
        );
      }
    }

    if (!metadata.players[playerID]) {
      ctx.throw(404, 'Player ' + playerID + ' not found');
    }
    if (metadata.players[playerID].name) {
      ctx.throw(409, 'Player ' + playerID + ' not available');
    }

    if (data) {
      metadata.players[playerID].data = data;
    }
    metadata.players[playerID].name = playerName;
    const playerCredentials = await auth.generateCredentials(ctx);
    metadata.players[playerID].credentials = playerCredentials;

    await db.setMetadata(matchID, metadata);

    const body: LobbyAPI.JoinedMatch = { playerCredentials };
    ctx.body = body;
  });

  /**
   * Leave a given match.
   *
   * @param {string} name - The name of the game.
   * @param {string} id - The ID of the match.
   * @param {string} playerID - The ID of the player who leaves.
   * @param {string} credentials - The credentials of the player who leaves.
   * @return - Nothing.
   */
  router.post('/games/:name/:id/leave', koaBody(), async (ctx) => {
    const matchID = ctx.params.id;
    const playerID = ctx.request.body.playerID;
    const credentials = ctx.request.body.credentials;
    const { metadata } = await (db as StorageAPI.Async).fetch(matchID, {
      metadata: true,
    });
    if (typeof playerID === 'undefined' || playerID === null) {
      ctx.throw(403, 'playerID is required');
    }

    if (!metadata) {
      ctx.throw(404, 'Match ' + matchID + ' not found');
    }
    if (!metadata.players[playerID]) {
      ctx.throw(404, 'Player ' + playerID + ' not found');
    }
    const isAuthorized = await auth.authenticateCredentials({
      playerID,
      credentials,
      metadata,
    });
    if (!isAuthorized) {
      ctx.throw(403, 'Invalid credentials ' + credentials);
    }

    delete metadata.players[playerID].name;
    delete metadata.players[playerID].credentials;
    const hasPlayers = Object.values(metadata.players).some(({ name }) => name);
    await (hasPlayers
      ? db.setMetadata(matchID, metadata) // Update metadata.
      : db.wipe(matchID)); // Delete match.
    ctx.body = {};
  });

  /**
   * Start a new match based on another existing match.
   *
   * @param {string} name - The name of the game.
   * @param {string} id - The ID of the match.
   * @param {string} playerID - The ID of the player creating the match.
   * @param {string} credentials - The credentials of the player creating the match.
   * @param {boolean} unlisted - Whether the match should be excluded from public listing.
   * @return - The ID of the new match.
   */
  router.post('/games/:name/:id/playAgain', koaBody(), async (ctx) => {
    const gameName = ctx.params.name;
    const matchID = ctx.params.id;
    const playerID = ctx.request.body.playerID;
    const credentials = ctx.request.body.credentials;
    const unlisted = ctx.request.body.unlisted;
    const { metadata } = await (db as StorageAPI.Async).fetch(matchID, {
      metadata: true,
    });

    if (typeof playerID === 'undefined' || playerID === null) {
      ctx.throw(403, 'playerID is required');
    }

    if (!metadata) {
      ctx.throw(404, 'Match ' + matchID + ' not found');
    }
    if (!metadata.players[playerID]) {
      ctx.throw(404, 'Player ' + playerID + ' not found');
    }
    const isAuthorized = await auth.authenticateCredentials({
      playerID,
      credentials,
      metadata,
    });
    if (!isAuthorized) {
      ctx.throw(403, 'Invalid credentials ' + credentials);
    }

    // Check if nextMatch is already set, if so, return that id.
    if (metadata.nextMatchID) {
      ctx.body = { nextMatchID: metadata.nextMatchID };
      return;
    }

    // User-data to pass to the game setup function.
    const setupData = ctx.request.body.setupData || metadata.setupData;
    // The number of players for this game instance.
    const numPlayers =
      Number.parseInt(ctx.request.body.numPlayers) ||
      // eslint-disable-next-line unicorn/explicit-length-check
      Object.keys(metadata.players).length;

    const game = games.find((g) => g.name === gameName);
    const nextMatchID = await CreateMatch({
      ctx,
      db,
      game,
      numPlayers,
      setupData,
      uuid,
      unlisted,
    });
    metadata.nextMatchID = nextMatchID;

    await db.setMetadata(matchID, metadata);

    const body: LobbyAPI.NextMatch = { nextMatchID };
    ctx.body = body;
  });

  const updatePlayerMetadata = async (ctx: Koa.Context) => {
    const matchID = ctx.params.id;
    const playerID = ctx.request.body.playerID;
    const credentials = ctx.request.body.credentials;
    const newName = ctx.request.body.newName;
    const data = ctx.request.body.data;
    const { metadata } = await (db as StorageAPI.Async).fetch(matchID, {
      metadata: true,
    });
    if (typeof playerID === 'undefined') {
      ctx.throw(403, 'playerID is required');
    }
    if (data === undefined && !newName) {
      ctx.throw(403, 'newName or data is required');
    }
    if (newName && typeof newName !== 'string') {
      ctx.throw(403, `newName must be a string, got ${typeof newName}`);
    }
    if (!metadata) {
      ctx.throw(404, 'Match ' + matchID + ' not found');
    }
    if (!metadata.players[playerID]) {
      ctx.throw(404, 'Player ' + playerID + ' not found');
    }
    const isAuthorized = await auth.authenticateCredentials({
      playerID,
      credentials,
      metadata,
    });
    if (!isAuthorized) {
      ctx.throw(403, 'Invalid credentials ' + credentials);
    }

    if (newName) {
      metadata.players[playerID].name = newName;
    }
    if (data) {
      metadata.players[playerID].data = data;
    }
    await db.setMetadata(matchID, metadata);
    ctx.body = {};
  };

  /**
   * Change the name of a player in a given match.
   *
   * @param {string} name - The name of the game.
   * @param {string} id - The ID of the match.
   * @param {string} playerID - The ID of the player.
   * @param {string} credentials - The credentials of the player.
   * @param {object} newName - The new name of the player in the match.
   * @return - Nothing.
   */
  router.post('/games/:name/:id/rename', koaBody(), async (ctx) => {
    console.warn(
      'This endpoint /rename is deprecated. Please use /update instead.'
    );
    await updatePlayerMetadata(ctx);
  });

  /**
   * Update the player's data for a given match.
   *
   * @param {string} name - The name of the game.
   * @param {string} id - The ID of the match.
   * @param {string} playerID - The ID of the player.
   * @param {string} credentials - The credentials of the player.
   * @param {object} newName - The new name of the player in the match.
   * @param {object} data - The new data of the player in the match.
   * @return - Nothing.
   */
  router.post('/games/:name/:id/update', koaBody(), updatePlayerMetadata);

  return router;
};

export const configureApp = (
  app: Server.App,
  router: Router<any, Server.AppCtx>,
  origins: IOTypes.ServerOptions['cors']['origin']
): void => {
  app.use(
    cors({
      // Set Access-Control-Allow-Origin header for allowed origins.
      origin: (ctx) => {
        const origin = ctx.get('Origin');
        return isOriginAllowed(origin, origins) ? origin : '';
      },
    })
  );

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
};

/**
 * Check if a request’s origin header is allowed for CORS.
 * Adapted from `cors` package: https://github.com/expressjs/cors
 * @param origin Request origin to test.
 * @param allowedOrigin Origin(s) that are allowed to connect via CORS.
 * @returns `true` if the origin matched at least one of the allowed origins.
 */
function isOriginAllowed(
  origin: string,
  allowedOrigin: IOTypes.ServerOptions['cors']['origin']
): boolean {
  if (Array.isArray(allowedOrigin)) {
    for (const entry of allowedOrigin) {
      if (isOriginAllowed(origin, entry)) {
        return true;
      }
    }
    return false;
  } else if (typeof allowedOrigin === 'string') {
    return origin === allowedOrigin;
  } else if (allowedOrigin instanceof RegExp) {
    return allowedOrigin.test(origin);
  } else {
    return !!allowedOrigin;
  }
}
