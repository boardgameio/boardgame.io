/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import request from 'supertest';

import { Server, createServerRunConfig, getPortFromServer } from '.';
import type { KoaServer } from '.';
import type { SocketIO } from './transport/socketio';
import type { Game, StorageAPI } from '../types';

const game: Game = { seed: 0 };

const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
beforeEach(warn.mockReset);
afterAll(warn.mockRestore);

jest.mock('../core/logger', () => ({
  info: () => {},
  error: () => {},
}));

jest.mock('koa-socket-2', () => {
  class MockSocket {
    on() {}
  }

  return class {
    constructor() {
      (this as any).socket = new MockSocket();
    }
    attach(app) {
      app.io = app._io = this;
    }
    of() {
      return this;
    }
    on(type, callback) {
      callback((this as any).socket);
    }
    adapter() {
      return this;
    }
  };
});

describe('new', () => {
  test('custom db implementation', () => {
    const game: Game = {};
    const db = {} as StorageAPI.Sync;
    const server = Server({ games: [game], db });
    expect(server.db).toBe(db);
  });

  test('custom transport implementation', () => {
    const game: Game = {};
    const transport = { init: jest.fn() } as unknown as SocketIO;
    Server({ games: [game], transport });
    expect(transport.init).toBeCalled();
  });

  test('custom auth implementation', () => {
    const game: Game = {};
    const authenticateCredentials = () => true;
    const server = Server({ games: [game], authenticateCredentials });
    expect(server.db).not.toBeNull();
  });

  test('logs a warning if origins not set', () => {
    Server({ games: [{}] });
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('Server `origins` option is not set.')
    );
  });

  test('does not log a warning if origins set', () => {
    Server({ games: [{}], origins: [] });
    expect(warn).not.toHaveBeenCalled();
  });
});

describe('run', () => {
  let server: ReturnType<typeof Server> | null;
  let runningServer: { appServer: KoaServer; apiServer?: KoaServer } | null;

  beforeEach(() => {
    server = null;
    runningServer = null;
  });

  afterEach(() => {
    if (server && runningServer) {
      const { apiServer, appServer } = runningServer;
      server.kill({ apiServer, appServer });
    }
  });

  test('single server running', async () => {
    server = Server({ games: [game] });
    runningServer = await server.run(undefined);

    expect(server).not.toBeUndefined();
    expect(runningServer.appServer).not.toBeUndefined();
    expect(runningServer.apiServer).toBeUndefined();
  });

  test('multiple servers running', async () => {
    server = Server({ games: [game] });
    runningServer = await server.run({
      port: 57890,
      lobbyConfig: { apiPort: 57891 },
    });

    expect(server).not.toBeUndefined();
    expect(runningServer.appServer).not.toBeUndefined();
    expect(runningServer.apiServer).not.toBeUndefined();
  });

  test('calls app callback', async () => {
    const callback = jest.fn();
    server = Server({ games: [game] });
    runningServer = await server.run({ callback });
    expect(callback).toHaveBeenCalled();
  });

  test('calls API callback', async () => {
    const apiCallback = jest.fn();
    server = Server({ games: [game] });
    runningServer = await server.run({
      lobbyConfig: { apiPort: 9999, apiCallback },
    });
    expect(apiCallback).toHaveBeenCalled();
  });

  test('runs route middleware', async () => {
    const usedMiddleware = jest.fn(async (_ctx, next) => {
      await next;
    });
    const unusedMiddleware = jest.fn(async (_ctx, next) => {
      await next;
    });
    server = Server({ games: [game] });
    server.router.use('/games', usedMiddleware);
    server.router.use('/games/unused', unusedMiddleware);
    runningServer = await server.run(8888);

    await request(runningServer.appServer).get('/games');
    expect(usedMiddleware).toHaveBeenCalled();
    expect(unusedMiddleware).not.toHaveBeenCalled();
  });
});

describe('kill', () => {
  test('call close on both servers', async () => {
    const apiServer = {
      close: jest.fn(),
    } as unknown as KoaServer;
    const appServer = {
      close: jest.fn(),
    } as unknown as KoaServer;
    const server = Server({ games: [game] });

    server.kill({ appServer, apiServer });

    expect(apiServer.close).toBeCalled();
    expect(appServer.close).toBeCalled();
  });

  test('do not fail if api server is not defined', async () => {
    const appServer = {
      close: jest.fn(),
    } as unknown as KoaServer;
    const server = Server({ games: [game] });

    expect(() => server.kill({ appServer })).not.toThrowError();
    expect(appServer.close).toBeCalled();
  });
});

describe('createServerRunConfig', () => {
  // TODO use data-driven-test here after upgrading to Jest 23+.
  test('should return valid config with different server run arguments', () => {
    const mockCallback = () => {};
    const mockApiCallback = () => {};

    expect(createServerRunConfig(8000)).toEqual({
      port: 8000,
      callback: undefined,
    });
    expect(createServerRunConfig(8000, mockCallback)).toEqual({
      port: 8000,
      callback: mockCallback,
    });

    expect(createServerRunConfig({})).toEqual({
      port: undefined,
      callback: undefined,
    });
    expect(createServerRunConfig({ port: 1234 })).toEqual({
      port: 1234,
      callback: undefined,
    });
    expect(
      createServerRunConfig({ port: 1234, callback: mockCallback })
    ).toEqual({
      port: 1234,
      callback: mockCallback,
    });

    expect(
      createServerRunConfig({ port: 1234, lobbyConfig: { apiPort: 5467 } })
    ).toEqual({
      port: 1234,
      callback: undefined,
      lobbyConfig: { apiPort: 5467 },
    });
    expect(
      createServerRunConfig({
        port: 1234,
        callback: mockCallback,
        lobbyConfig: {
          apiPort: 5467,
          apiCallback: mockApiCallback,
        },
      })
    ).toEqual({
      port: 1234,
      callback: mockCallback,
      lobbyConfig: {
        apiPort: 5467,
        apiCallback: mockApiCallback,
      },
    });
  });
});

describe('getPortFromServer', () => {
  test('returns null', () => {
    expect(
      getPortFromServer({
        address: () => null,
      } as KoaServer)
    ).toBeNull();
  });

  test('returns port', () => {
    expect(
      getPortFromServer({
        address: () => '8000',
      } as KoaServer)
    ).toBe('8000');
  });

  test('returns port from address object', () => {
    expect(
      getPortFromServer({
        address: () => ({ port: '8000' }),
      } as unknown as KoaServer)
    ).toBe('8000');
  });
});
