/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { Server, createServerRunConfig } from '.';
import * as api from './api';

const game = { seed: 0 };

jest.mock('../core/logger', () => ({
  info: () => {},
  error: () => {},
}));

const mockApiServerListen = jest.fn(async () => ({
  address: () => ({ port: 'mock-api-port' }),
  close: () => {},
}));
jest.mock('./api', () => ({
  createApiServer: jest.fn(() => ({
    listen: mockApiServerListen,
  })),
  addApiToServer: jest.fn(),
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
  };
});

jest.mock('koa', () => {
  return class {
    constructor() {
      (this as any).context = {};
      (this as any).callback = () => {};
      (this as any).listen = async () => ({
        address: () => ({ port: 'mock-api-port' }),
        close: () => {},
      });
    }
  };
});

describe('new', () => {
  test('custom db implementation', () => {
    const game = {};
    const db = {};
    const server = Server({ games: [game], db });
    expect(server.db).toBe(db);
  });

  test('custom transport implementation', () => {
    const game = {};
    const transport = { init: jest.fn() };
    Server({ games: [game], transport });
    expect(transport.init).toBeCalled();
  });
});

describe('run', () => {
  let server, runningServer;

  beforeEach(() => {
    server = null;
    runningServer = null;
    (api.createApiServer as any).mockClear();
    (api.addApiToServer as any).mockClear();
    (mockApiServerListen as any).mockClear();
  });

  afterEach(() => {
    if (server && runningServer) {
      const { apiServer, appServer } = runningServer;
      server.kill({ apiServer, appServer });
    }
  });

  test('single server running', async () => {
    server = Server({ games: [game] });
    runningServer = await server.run();

    expect(server).not.toBeUndefined();
    expect(api.addApiToServer).toBeCalled();
    expect(api.createApiServer).not.toBeCalled();
    expect(mockApiServerListen).not.toBeCalled();
  });

  test('multiple servers running', async () => {
    server = Server({ games: [game] });
    runningServer = await server.run({
      port: 57890,
      lobbyConfig: { apiPort: 57891 },
    });

    expect(server).not.toBeUndefined();
    expect(api.addApiToServer).not.toBeCalled();
    expect(api.createApiServer).toBeCalled();
    expect(mockApiServerListen).toBeCalled();
  });
});

describe('kill', () => {
  test('call close on both servers', async () => {
    const apiServer = {
      close: jest.fn(),
    };
    const appServer = {
      close: jest.fn(),
    };
    const server = Server({ games: [game], singlePort: true });

    server.kill({ appServer, apiServer });

    expect(apiServer.close).toBeCalled();
    expect(appServer.close).toBeCalled();
  });

  test('do not fail if api server is not defined', async () => {
    const appServer = {
      close: jest.fn(),
    };
    const server = Server({ games: [game], singlePort: true });

    expect(() => server.kill({ appServer })).not.toThrowError();
    expect(appServer.close).toBeCalled();
  });
});

describe('createServerRunConfig', () => {
  // TODO use data-driven-test here after upgrading to Jest 23+.
  test('should return valid config with different server run arguments', () => {
    const mockCallback = () => {};
    const mockApiCallback = () => {};

    expect(createServerRunConfig()).toEqual({
      port: undefined,
      callback: undefined,
    });
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
