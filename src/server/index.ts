/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import Koa from 'koa';
import Router from '@koa/router';
import type { CorsOptions } from 'cors';

import { configureRouter, configureApp } from './api';
import { DBFromEnv } from './db';
import { ProcessGameConfig } from '../core/game';
import * as logger from '../core/logger';
import { Auth } from './auth';
import { SocketIO } from './transport/socketio';
import type { Server as ServerTypes, Game, StorageAPI } from '../types';

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
): ServerConfig =>
  portOrConfig && typeof portOrConfig === 'object'
    ? {
        ...portOrConfig,
        callback: portOrConfig.callback || callback,
      }
    : { port: portOrConfig as number, callback };

export const getPortFromServer = (
  server: KoaServer
): string | number | null => {
  const address = server.address();
  if (typeof address === 'string') return address;
  if (address === null) return null;
  return address.port;
};

interface ServerOpts {
  games: Game[];
  origins?: CorsOptions['origin'];
  apiOrigins?: CorsOptions['origin'];
  db?: StorageAPI.Async | StorageAPI.Sync;
  transport?: SocketIO;
  uuid?: () => string;
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
 * @param origins - Allowed origins to use this server, e.g. `['http://localhost:3000']`.
 * @param apiOrigins - Allowed origins to use the Lobby API, defaults to `origins`.
 * @param generateCredentials - Method for API to generate player credentials.
 * @param https - HTTPS configuration options passed through to the TLS module.
 * @param lobbyConfig - Configuration options for the Lobby API server.
 */
export function Server({
  games,
  db,
  transport,
  https,
  uuid,
  origins,
  apiOrigins = origins,
  generateCredentials = uuid,
  authenticateCredentials,
}: ServerOpts) {
  const app: ServerTypes.App = new Koa();

  games = games.map((game) => ProcessGameConfig(game));

  if (db === undefined) {
    db = DBFromEnv();
  }
  app.context.db = db;

  const auth = new Auth({ authenticateCredentials, generateCredentials });
  app.context.auth = auth;

  if (transport === undefined) {
    transport = new SocketIO({ https });
  }
  if (origins === undefined) {
    console.warn(
      'Server `origins` option is not set.\n' +
        'Since boardgame.io@0.45, CORS is not enabled by default and you must ' +
        'explicitly set the origins that are allowed to connect to the server.\n' +
        'See https://boardgame.io/documentation/#/api/Server'
    );
  }
  transport.init(app, games, origins);

  const router = new Router<any, ServerTypes.AppCtx>();

  return {
    app,
    db,
    auth,
    router,
    transport,

    run: async (portOrConfig: number | ServerConfig, callback?: () => void) => {
      const serverRunConfig = createServerRunConfig(portOrConfig, callback);
      configureRouter({ router, db, games, uuid, auth });

      // DB
      await db.connect();

      // Lobby API
      const lobbyConfig = serverRunConfig.lobbyConfig;
      let apiServer: KoaServer | undefined;
      if (!lobbyConfig || !lobbyConfig.apiPort) {
        configureApp(app, router, apiOrigins);
      } else {
        // Run API in a separate Koa app.
        const api: ServerTypes.App = new Koa();
        api.context.db = db;
        api.context.auth = auth;
        configureApp(api, router, apiOrigins);
        await new Promise<void>((resolve) => {
          apiServer = api.listen(lobbyConfig.apiPort, resolve);
        });
        if (lobbyConfig.apiCallback) lobbyConfig.apiCallback();
        logger.info(`API serving on ${getPortFromServer(apiServer)}...`);
      }

      // Run Game Server (+ API, if necessary).
      let appServer: KoaServer;
      await new Promise<void>((resolve) => {
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
