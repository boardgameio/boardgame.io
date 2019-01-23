/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { Server } from '.';
import Game from '../core/game';
import * as api from './api';

const game = Game({ seed: 0 });

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

// TODO fix external module mock cause it is not really working in tests..
// i.e. listen method is called from real koa dependency, but not from mock
// you can see real koa ports in logs if you delete logger mock
jest.mock('koa', () => {
  return class {
    constructor() {
      this.context = {};
    }

    callback() {}
    async listen() {}
  };
});

describe('new', () => {
  test('custom db implementation', () => {
    const game = Game({});
    const db = {};
    const server = Server({ games: [game], db });
    expect(server.db).toBe(db);
  });

  test('custom transport implementation', () => {
    const game = Game({});
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
    api.createApiServer.mockClear();
    api.addApiToServer.mockClear();
    mockApiServerListen.mockClear();
  });

  afterEach(() => {
    if (server && runningServer) {
      const { apiServer, appServer } = runningServer;
      server.kill({ apiServer, appServer });
    }
  });

  test('single server running', async () => {
    server = Server({ games: [game], singlePort: true });
    runningServer = await server.run();

    expect(server).not.toBeUndefined();
    expect(api.addApiToServer).toBeCalled();
    expect(api.createApiServer).not.toBeCalled();
    expect(mockApiServerListen).not.toBeCalled();
  });

  test('multiple servers running', async () => {
    server = Server({ games: [game] });
    runningServer = await server.run();

    expect(server).not.toBeUndefined();
    expect(api.addApiToServer).not.toBeCalled();
    expect(api.createApiServer).toBeCalled();
    expect(mockApiServerListen).toBeCalled();
  });

  test('run api server with random port', async () => {
    server = Server({ games: [game] });
    runningServer = await server.run();

    expect(mockApiServerListen).toBeCalledWith(null);
  });

  test('run api server with websocket port + 1', async () => {
    server = Server({ games: [game] });
    runningServer = await server.run(63488);

    expect(mockApiServerListen).toBeCalledWith(63489);
  });

  test('run api server with custom port', async () => {
    server = Server({ games: [game] });
    runningServer = await server.run(null, null, 51345);

    expect(mockApiServerListen).toBeCalledWith(51345);
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
