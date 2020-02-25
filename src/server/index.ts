/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

const Koa = require('koa');

import { addApiToServer, createApiServer } from './api';
import { DBFromEnv } from './db';
import { Game } from '../core/game';
import * as logger from '../core/logger';
import { SocketIO } from './transport/socketio';

interface ServerConfig {
  port?: Number;
  callback?: Function;
  lobbyConfig?: {
    apiPort: Number;
    apiCallback?: Function;
  };
}

/**
 * Build config object from server run arguments.
 */
export const createServerRunConfig = (
  portOrConfig: Number | ServerConfig,
  callback?: Function
): ServerConfig => {
  const config: ServerConfig = {};
  if (portOrConfig && typeof portOrConfig === 'object') {
    const serverConfig = portOrConfig as ServerConfig;
    config.port = serverConfig.port;
    config.callback = serverConfig.callback || callback;
    config.lobbyConfig = serverConfig.lobbyConfig;
  } else {
    config.port = portOrConfig as Number;
    config.callback = callback;
  }
  return config;
};

/**
 * Instantiate a game server.
 *
 * @param {Array} games - The games that this server will handle.
 * @param {object} db - The interface with the database.
 * @param {object} transport - The interface with the clients.
 * @param {function} authenticateCredentials - Function to test player
 *                                             credentials. Optional.
 * @param {function} generateCredentials - Method for API to generate player
 *                                         credentials. Optional.
 */
export function Server({
  games,
  db,
  transport,
  authenticateCredentials,
  generateCredentials,
}: any) {
  const app = new Koa();

  games = games.map(Game);

  if (db === undefined) {
    db = DBFromEnv();
  }
  app.context.db = db;

  if (transport === undefined) {
    const auth =
      typeof authenticateCredentials === 'function'
        ? authenticateCredentials
        : true;
    transport = SocketIO({ auth });
  }
  transport.init(app, games);

  return {
    app,
    db,

    run: async (portOrConfig: Number | object, callback?: Function) => {
      const serverRunConfig = createServerRunConfig(portOrConfig, callback);

      // DB
      await db.connect();

      // Lobby API
      const lobbyConfig = serverRunConfig.lobbyConfig;
      let apiServer;
      if (!lobbyConfig || !lobbyConfig.apiPort) {
        addApiToServer({ app, db, games, lobbyConfig, generateCredentials });
      } else {
        // Run API in a separate Koa app.
        const api = createApiServer({
          db,
          games,
          lobbyConfig,
          generateCredentials,
        });
        apiServer = await api.listen(
          lobbyConfig.apiPort,
          lobbyConfig.apiCallback
        );
        logger.info(`API serving on ${apiServer.address().port}...`);
      }

      // Run Game Server (+ API, if necessary).
      const appServer = await app.listen(
        serverRunConfig.port,
        serverRunConfig.callback
      );
      logger.info(`App serving on ${appServer.address().port}...`);

      return { apiServer, appServer };
    },

    kill: ({ apiServer, appServer }: any) => {
      if (apiServer) {
        apiServer.close();
      }
      appServer.close();
    },
  };
}
