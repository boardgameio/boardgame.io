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
import * as logger from '../core/logger';
import { SocketIO } from './transport/socketio';

/**
 * Build config object from server run arguments.
 *
 * @param {number} portOrConfig - Either port or server config object. Optional.
 * @param {function} callback - Server run callback. Optional.
 */
export const createServerRunConfig = (portOrConfig, callback) => {
  const config = {};
  if (portOrConfig && typeof portOrConfig === 'object') {
    config.port = portOrConfig.port;
    config.callback = portOrConfig.callback || callback;
    config.apiPort = portOrConfig.apiPort;
    config.apiCallback = portOrConfig.apiCallback;
  } else {
    config.port = portOrConfig;
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
 */
export function Server({ games, db, transport }) {
  const app = new Koa();

  if (db === undefined) {
    db = DBFromEnv();
  }
  app.context.db = db;

  if (transport === undefined) {
    transport = SocketIO();
  }
  transport.init(app, games);

  return {
    app,
    db,

    run: async (portOrConfig, callback) => {
      const serverRunConfig = createServerRunConfig(portOrConfig, callback);

      // DB
      await db.connect();

      // API
      let apiServer;
      if (!serverRunConfig.apiPort) {
        addApiToServer({ app, db, games });
      } else {
        // Run API in a separate Koa app.
        const api = createApiServer({ db, games });
        apiServer = await api.listen(
          serverRunConfig.apiPort,
          serverRunConfig.apiCallback
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

    kill: ({ apiServer, appServer }) => {
      if (apiServer) {
        apiServer.close();
      }
      appServer.close();
    },
  };
}
