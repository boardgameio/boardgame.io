/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import Koa from 'koa';

import { addApiToServer, createApiServer } from './api';
import { DBFromEnv } from './db';
import { ProcessGameConfig } from '../core/game';
import * as logger from '../core/logger';
import { SocketIO } from './transport/socketio';
import { Server as ServerTypes, Game, StorageAPI } from '../types';

export type KoaServer = ReturnType<Koa['listen']>;

interface ServerConfig {
  port?: number;
  callback?: () => void;
  lobbyConfig?: {
    apiPort: number;
    apiCallback?: () => void;
  };
}

interface HttpsOptions {
  cert: string;
  key: string;
}

/**
 * Build config object from server run arguments.
 */
export const createServerRunConfig = (
  portOrConfig: number | ServerConfig,
  callback?: () => void
): ServerConfig => {
  const config: ServerConfig = {};
  if (portOrConfig && typeof portOrConfig === 'object') {
    const serverConfig = portOrConfig as ServerConfig;
    config.port = serverConfig.port;
    config.callback = serverConfig.callback || callback;
    config.lobbyConfig = serverConfig.lobbyConfig;
  } else {
    config.port = portOrConfig as number;
    config.callback = callback;
  }
  return config;
};

const getPortFromServer = (server: KoaServer): string | number | null => {
  const address = server.address();
  if (typeof address === 'string') return address;
  if (address === null) return null;
  return address.port;
};

interface ServerOpts {
  games: Game[];
  db?: StorageAPI.Async | StorageAPI.Sync;
  transport?;
  authenticateCredentials?: ServerTypes.AuthenticateCredentials;
  generateCredentials?: ServerTypes.GenerateCredentials;
  https?: HttpsOptions;
}

/**
 * Instantiate a game server.
 *
 * @param games - The games that this server will handle.
 * @param db - The interface with the database.
 * @param transport - The interface with the clients.
 * @param authenticateCredentials - Function to test player credentials.
 * @param generateCredentials - Method for API to generate player credentials.
 * @param https - HTTPS configuration options passed through to the TLS module.
 */
export function Server({
  games,
  db,
  transport,
  authenticateCredentials,
  generateCredentials,
  https,
}: ServerOpts) {
  const app = new Koa();

  games = games.map(ProcessGameConfig);

  if (db === undefined) {
    db = DBFromEnv();
  }
  app.context.db = db;

  if (transport === undefined) {
    const auth =
      typeof authenticateCredentials === 'function'
        ? authenticateCredentials
        : true;
    transport = SocketIO({
      auth,
      https,
    });
  }
  transport.init(app, games);

  return {
    app,
    db,

    run: async (portOrConfig: number | object, callback?: () => void) => {
      const serverRunConfig = createServerRunConfig(portOrConfig, callback);

      // DB
      await db.connect();

      // Lobby API
      const lobbyConfig: ServerTypes.LobbyConfig = serverRunConfig.lobbyConfig;
      let apiServer: KoaServer | undefined;
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
        await new Promise(resolve => {
          apiServer = api.listen(lobbyConfig.apiPort, resolve);
        });
        if (lobbyConfig.apiCallback) lobbyConfig.apiCallback();
        logger.info(`API serving on ${getPortFromServer(apiServer)}...`);
      }

      // Run Game Server (+ API, if necessary).
      let appServer: KoaServer;
      await new Promise(resolve => {
        appServer = app.listen(serverRunConfig.port, resolve);
      });
      if (serverRunConfig.callback) serverRunConfig.callback();
      logger.info(`App serving on ${getPortFromServer(appServer)}...`);

      return { apiServer, appServer };
    },

    kill: (servers: { apiServer?: KoaServer; appServer: KoaServer }) => {
      if (servers.apiServer) {
        servers.apiServer.close();
      }
      servers.appServer.close();
    },
  };
}
