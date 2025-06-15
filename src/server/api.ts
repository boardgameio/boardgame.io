/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import type { CorsOptions } from 'cors';
import type { Request, Response, NextFunction, Router } from 'express';
import express from 'express';
import cors from 'cors';
import { nanoid } from 'nanoid';
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
  res,
  db,
  uuid,
  ...opts
}: {
  db: StorageAPI.Sync | StorageAPI.Async;
  res: Response;
  uuid: () => string;
} & Parameters<typeof createMatch>[0]): Promise<string> => {
  const matchID = uuid();
  const match = createMatch(opts);

  if ('setupDataError' in match) {
    res.status(400).send(match.setupDataError);
    throw new Error(match.setupDataError);
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

/** Utility extracting `string` from a query if it is `string[]`. */
const unwrapQuery = (
  query: undefined | string | string[]
): string | undefined => (Array.isArray(query) ? query[0] : query);

export const configureRouter = ({
  router,
  db,
  auth,
  games,
  uuid = () => nanoid(11),
}: {
  router: Router;
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
  router.get('/games', async (req: Request, res: Response) => {
    const body: LobbyAPI.GameList = games.map((game) => game.name);
    res.json(body);
  });

  // Create a new match
  router.post(
    '/games/:name/create',
    express.json(),
    async (req: Request, res: Response) => {
      const gameName = req.params.name;
      const setupData = req.body?.setupData;
      const unlisted = req.body?.unlisted;
      const numPlayers = Number.parseInt(req.body?.numPlayers);

      const game = games.find((g) => g.name === gameName);
      if (!game) return res.status(404).send('Game ' + gameName + ' not found');

      if (
        req.body.numPlayers !== undefined &&
        (Number.isNaN(numPlayers) ||
          (game.minPlayers && numPlayers < game.minPlayers) ||
          (game.maxPlayers && numPlayers > game.maxPlayers))
      ) {
        return res.status(400).send('Invalid numPlayers');
      }

      try {
        const matchID = await CreateMatch({
          res,
          db,
          game,
          numPlayers,
          setupData,
          uuid,
          unlisted,
        });
        const body: LobbyAPI.CreatedMatch = { matchID };
        res.json(body);
      } catch {
        // Error already handled in CreateMatch
      }
    }
  );

  /**
   * List matches for a given game.
   *
   * This does not return matches that are marked as unlisted.
   *
   * @param {string} name - The name of the game.
   * @return - Array of match objects.
   */
  router.get('/games/:name', async (req: Request, res: Response) => {
    const gameName = req.params.name;
    const isGameoverString = unwrapQuery(
      req.query.isGameover as string | string[]
    );
    const updatedBeforeString = unwrapQuery(
      req.query.updatedBefore as string | string[]
    );
    const updatedAfterString = unwrapQuery(
      req.query.updatedAfter as string | string[]
    );

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
    res.json(body);
  });

  /**
   * Get data about a specific match.
   *
   * @param {string} name - The name of the game.
   * @param {string} id - The ID of the match.
   * @return - A match object.
   */
  router.get('/games/:name/:id', async (req: Request, res: Response) => {
    const matchID = req.params.id;
    const { metadata } = await (db as StorageAPI.Async).fetch(matchID, {
      metadata: true,
    });
    if (!metadata) {
      return res.status(404).send('Match ' + matchID + ' not found');
    }
    const body: LobbyAPI.Match = createClientMatchData(matchID, metadata);
    res.json(body);
  });

  /**
   * Join a given match.
   *
   * @param {string} name - The name of the game.
   * @param {string} id - The ID of the match.
   * @param {string} playerID - The ID of the player who joins. If not sent, will be assigned to the first index available.
   * @param {string} playerName - The name of the player who joins.
   * @param {object} data - The default data of the player in the match.
   * @return - Player ID and credentials to use when interacting in the joined match.
   */
  router.post(
    '/games/:name/:id/join',
    express.json(),
    async (req: Request, res: Response) => {
      let playerID = req.body.playerID;
      const playerName = req.body.playerName;
      const data = req.body.data;
      const matchID = req.params.id;
      if (!playerName) {
        return res.status(403).send('playerName is required');
      }

      const { metadata } = await (db as StorageAPI.Async).fetch(matchID, {
        metadata: true,
      });
      if (!metadata) {
        return res.status(404).send('Match ' + matchID + ' not found');
      }

      if (typeof playerID === 'undefined' || playerID === null) {
        playerID = getFirstAvailablePlayerID(metadata.players);
        if (playerID === undefined) {
          const numPlayers = getNumPlayers(metadata.players);
          return res
            .status(409)
            .send(
              `Match ${matchID} reached maximum number of players (${numPlayers})`
            );
        }
      }

      if (!metadata.players[playerID]) {
        return res.status(404).send('Player ' + playerID + ' not found');
      }
      if (metadata.players[playerID].name) {
        return res.status(409).send('Player ' + playerID + ' not available');
      }

      if (data) {
        metadata.players[playerID].data = data;
      }
      metadata.players[playerID].name = playerName;
      const playerCredentials = await auth.generateCredentials(req, res);
      metadata.players[playerID].credentials = playerCredentials;

      await db.setMetadata(matchID, metadata);

      const body: LobbyAPI.JoinedMatch = { playerID, playerCredentials };
      res.json(body);
    }
  );

  /**
   * Leave a given match.
   *
   * @param {string} name - The name of the game.
   * @param {string} id - The ID of the match.
   * @param {string} playerID - The ID of the player who leaves.
   * @param {string} credentials - The credentials of the player who leaves.
   * @return - Nothing.
   */
  router.post(
    '/games/:name/:id/leave',
    express.json(),
    async (req: Request, res: Response) => {
      const matchID = req.params.id;
      const playerID = req.body.playerID;
      const credentials = req.body.credentials;
      const { metadata } = await (db as StorageAPI.Async).fetch(matchID, {
        metadata: true,
      });
      if (typeof playerID === 'undefined' || playerID === null) {
        return res.status(403).send('playerID is required');
      }

      if (!metadata) {
        return res.status(404).send('Match ' + matchID + ' not found');
      }
      if (!metadata.players[playerID]) {
        return res.status(404).send('Player ' + playerID + ' not found');
      }
      const isAuthorized = await auth.authenticateCredentials({
        playerID,
        credentials,
        metadata,
      });
      if (!isAuthorized) {
        return res.status(403).send('Invalid credentials ' + credentials);
      }

      delete metadata.players[playerID].name;
      delete metadata.players[playerID].credentials;
      const hasPlayers = Object.values(metadata.players).some(
        ({ name }) => name
      );
      await (hasPlayers
        ? db.setMetadata(matchID, metadata) // Update metadata.
        : db.wipe(matchID)); // Delete match.
      res.json({});
    }
  );

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
  router.post(
    '/games/:name/:id/playAgain',
    express.json(),
    async (req: Request, res: Response) => {
      const gameName = req.params.name;
      const matchID = req.params.id;
      const playerID = req.body.playerID;
      const credentials = req.body.credentials;
      const unlisted = req.body.unlisted;
      const { metadata } = await (db as StorageAPI.Async).fetch(matchID, {
        metadata: true,
      });

      if (typeof playerID === 'undefined' || playerID === null) {
        return res.status(403).send('playerID is required');
      }

      if (!metadata) {
        return res.status(404).send('Match ' + matchID + ' not found');
      }
      if (!metadata.players[playerID]) {
        return res.status(404).send('Player ' + playerID + ' not found');
      }
      const isAuthorized = await auth.authenticateCredentials({
        playerID,
        credentials,
        metadata,
      });
      if (!isAuthorized) {
        return res.status(403).send('Invalid credentials ' + credentials);
      }

      // Check if nextMatch is already set, if so, return that id.
      if (metadata.nextMatchID) {
        return res.json({ nextMatchID: metadata.nextMatchID });
      }

      const setupData = req.body.setupData || metadata.setupData;
      const numPlayers =
        Number.parseInt(req.body.numPlayers) ||
        // eslint-disable-next-line unicorn/explicit-length-check
        Object.keys(metadata.players).length;

      const game = games.find((g) => g.name === gameName);
      try {
        const nextMatchID = await CreateMatch({
          res,
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
        res.json(body);
      } catch {
        // Error already handled in CreateMatch
      }
    }
  );

  // Update player metadata
  const updatePlayerMetadata = async (req: Request, res: Response) => {
    const matchID = req.params.id;
    const playerID = req.body.playerID;
    const credentials = req.body.credentials;
    const newName = req.body.newName;
    const data = req.body.data;
    const { metadata } = await (db as StorageAPI.Async).fetch(matchID, {
      metadata: true,
    });
    if (typeof playerID === 'undefined') {
      return res.status(403).send('playerID is required');
    }
    if (data === undefined && !newName) {
      return res.status(403).send('newName or data is required');
    }
    if (newName && typeof newName !== 'string') {
      return res
        .status(403)
        .send(`newName must be a string, got ${typeof newName}`);
    }
    if (!metadata) {
      return res.status(404).send('Match ' + matchID + ' not found');
    }
    if (!metadata.players[playerID]) {
      return res.status(404).send('Player ' + playerID + ' not found');
    }
    const isAuthorized = await auth.authenticateCredentials({
      playerID,
      credentials,
      metadata,
    });
    if (!isAuthorized) {
      return res.status(403).send('Invalid credentials ' + credentials);
    }

    if (newName) {
      metadata.players[playerID].name = newName;
    }
    if (data) {
      metadata.players[playerID].data = data;
    }
    await db.setMetadata(matchID, metadata);
    res.json({});
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
  router.post(
    '/games/:name/:id/rename',
    express.json(),
    async (req: Request, res: Response) => {
      console.warn(
        'This endpoint /rename is deprecated. Please use /update instead.'
      );
      await updatePlayerMetadata(req, res);
    }
  );

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
  router.post('/games/:name/:id/update', express.json(), updatePlayerMetadata);

  return router;
};

export const configureApp = (
  app: express.Application,
  router: Router,
  origins: CorsOptions['origin']
): void => {
  app.use(
    // cors({
    //   origin: (origin, callback) => {
    //     console.log('cors', { origin, origins });
    //     if (!origin || isOriginAllowed(origin, origins)) {
    //       console.log('cors ok');
    //       callback(null, origin);
    //     } else {
    //       console.log('cors bad');
    //       callback(new Error('Not allowed by CORS'), origin);
    //     }
    //   },
    // })
    cors({ origin: origins })
  );

  // If API_SECRET is set, then require that requests set an
  // api-secret header that is set to the same value.
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (
      !!process.env.API_SECRET &&
      req.headers['api-secret'] !== process.env.API_SECRET
    ) {
      return res.status(403).send('Invalid API secret');
    }
    next();
  });

  app.use(router);

  // Error handler
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    if (res.headersSent) {
      return next(err);
    }
    if (err.status) {
      res.status(err.status).send(err.message || err.msg);
    } else {
      res.status(500).send('Internal Server Error');
    }
  });
};

// /**
//  * Check if a request’s origin header is allowed for CORS.
//  * Adapted from `cors` package: https://github.com/expressjs/cors
//  * @param origin Request origin to test.
//  * @param allowedOrigin Origin(s) that are allowed to connect via CORS.
//  * @returns `true` if the origin matched at least one of the allowed origins.
//  */
// function isOriginAllowed(
//   origin: string,
//   allowedOrigin: CorsOptions['origin']
// ): boolean {
//   if (Array.isArray(allowedOrigin)) {
//     for (const entry of allowedOrigin) {
//       if (isOriginAllowed(origin, entry)) {
//         return true;
//       }
//     }
//     return false;
//   } else if (typeof allowedOrigin === 'string') {
//     return origin === allowedOrigin;
//   } else if (allowedOrigin instanceof RegExp) {
//     return allowedOrigin.test(origin);
//   } else {
//     return !!allowedOrigin;
//   }
// }
