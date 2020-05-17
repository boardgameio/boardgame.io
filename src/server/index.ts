/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import Koa from 'koa';
import Router from 'koa-router';

import { createRouter, configureApp } from './api';
import { DBFromEnv } from './db';
import { ProcessGameConfig } from '../core/game';
import * as logger from '../core/logger';
import { SocketIO } from './transport/socketio';
import { Server as ServerTypes, Game, StorageAPI } from '../types';

export type KoaServer = ReturnType<Koa['listen']>;

type LobbyConfig = ServerTypes.LobbyConfig & ServerTypes.LobbyRuntimeSettings;

interface ServerConfig {
  port?: number;
  callback?: () => void;
  lobbyConfig?: LobbyConfig;
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

type DB = StorageAPI.Async | StorageAPI.Sync;
type Servers = { apiServer?: KoaServer; appServer: KoaServer };

interface ServerOpts {
  games: Game[];
  db?: DB;
  transport?;
  authenticateCredentials?: ServerTypes.AuthenticateCredentials;
  generateCredentials?: ServerTypes.GenerateCredentials;
  https?: HttpsOptions;
  lobbyConfig?: ServerTypes.LobbyConfig;
}

class ServerInstance {
  private _app: Koa;
  private _db: DB;
  private _router: Router;
  private _games: Game[];
  private _generateCredentials: ServerTypes.GenerateCredentials;

  constructor({
    games,
    db,
    transport,
    authenticateCredentials,
    generateCredentials,
    https,
    lobbyConfig,
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
      transport = new SocketIO({
        auth,
        https,
      });
    }
    transport.init(app, games);

    this._games = games;
    this._generateCredentials = generateCredentials;
    this._app = app;
    this._db = db;
    this.setRouter(lobbyConfig);
  }

  private setRouter(lobbyConfig: ServerTypes.LobbyConfig): void {
    this._router = createRouter({
      db: this._db,
      games: this._games,
      lobbyConfig,
      generateCredentials: this._generateCredentials,
    });
  }

  get app(): Koa {
    return this._app;
  }

  get db(): DB {
    return this._db;
  }

  get router(): Router {
    return this._router;
  }

  async run(
    portOrConfig: number | ServerConfig,
    callback?: () => void
  ): Promise<Servers> {
    const serverRunConfig = createServerRunConfig(portOrConfig, callback);

    // DB
    await this.db.connect();

    // Lobby API
    const lobbyConfig = serverRunConfig.lobbyConfig;
    if (lobbyConfig) this.setRouter(lobbyConfig);
    let apiServer: KoaServer | undefined;
    if (!lobbyConfig || !lobbyConfig.apiPort) {
      configureApp(this.app, this.router);
    } else {
      // Run API in a separate Koa app.
      const api = new Koa();
      configureApp(api, this.router);
      await new Promise(resolve => {
        apiServer = api.listen(lobbyConfig.apiPort, resolve);
      });
      if (lobbyConfig.apiCallback) lobbyConfig.apiCallback();
      logger.info(`API serving on ${getPortFromServer(apiServer)}...`);
    }

    // Run Game Server (+ API, if necessary).
    let appServer: KoaServer;
    await new Promise(resolve => {
      appServer = this.app.listen(serverRunConfig.port, resolve);
    });
    if (serverRunConfig.callback) serverRunConfig.callback();
    logger.info(`App serving on ${getPortFromServer(appServer)}...`);

    return { apiServer, appServer };
  }

  kill(servers: Servers): void {
    if (servers.apiServer) {
      servers.apiServer.close();
    }
    servers.appServer.close();
  }
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
 * @param lobbyConfig - Configuration options for the Lobby API server.
 */
export function Server(opts: ServerOpts): ServerInstance {
  return new ServerInstance(opts);
}
