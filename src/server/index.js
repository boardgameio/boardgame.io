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
 * Instantiate a game server.
 *
 * @param {Array} games - The games that this server will handle.
 * @param {object} db - The interface with the database.
 * @param {object} transport - The interface with the clients.
 */
export function Server({ games, db, transport, singlePort = false }) {
  const app = new Koa();

  if (db === undefined) {
    db = DBFromEnv();
  }
  app.context.db = db;

  if (transport === undefined) {
    transport = SocketIO();
  }
  transport.init(app, games);

  const api = singlePort
    ? addApiToServer({ app, db, games })
    : createApiServer({ db, games });

  return {
    app,
    api,
    db,

    run: async (port, callback, apiPort) => {
      await db.connect();

      let apiServer;
      if (!singlePort) {
        apiServer = await api.listen(
          apiPort ? apiPort : port ? port + 1 : null
        );
        logger.info(`Listening API on ${apiServer.address().port}...`);
      }

      const appServer = await app.listen(port, callback);
      logger.info(`Listening App on ${appServer.address().port}...`);

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
