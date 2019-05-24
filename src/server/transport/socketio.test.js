/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { TransportAPI, SocketIO } from './socketio';
import { Game } from '../../core/game';

jest.mock('../../master/master', () => {
  class Master {
    constructor() {
      this.onUpdate = jest.fn();
      this.onSync = jest.fn();
    }
  }

  return { Master };
});

jest.mock('koa-socket-2', () => {
  class MockSocket {
    constructor() {
      this.id = 'id';
      this.callbacks = {};
      this.emit = jest.fn();
      this.broadcast = { emit: jest.fn() };
    }

    async receive(type, ...args) {
      await this.callbacks[type](args[0], args[1], args[2], args[3], args[4]);
      return;
    }

    on(type, callback) {
      this.callbacks[type] = callback;
    }

    to() {
      return {
        broadcast: this.broadcast,
        emit: this.emit,
      };
    }

    join() {}
  }

  class MockIO {
    constructor() {
      this.socket = new MockSocket();
    }
    attach(app) {
      app.io = app._io = this;
    }
    of() {
      return this;
    }
    on(type, callback) {
      callback(this.socket);
    }
  }

  return MockIO;
});

describe('basic', () => {
  const app = { context: {} };
  const games = [Game({ seed: 0 })];
  let _clientInfo;
  let _roomInfo;

  beforeEach(() => {
    _clientInfo = new Map();
    _roomInfo = new Map();
    const transport = SocketIO(_clientInfo, _roomInfo);
    transport.init(app, games);
  });

  test('is attached to app', () => {
    expect(app.context.io).toBeDefined();
  });
});

describe('TransportAPI', () => {
  let io;
  let api;

  beforeAll(() => {
    const app = { context: {} };
    const games = [Game({ seed: 0 })];
    const clientInfo = new Map();
    const roomInfo = new Map();
    const transport = SocketIO(clientInfo, roomInfo);
    transport.init(app, games);
    io = app.context.io;
    api = TransportAPI('gameID', io.socket, clientInfo, roomInfo);
  });

  beforeEach(async () => {
    io.socket.emit = jest.fn();
    io.socket.id = '0';
    await io.socket.receive('sync', 'gameID', '0', 2);
    io.socket.id = '1';
    await io.socket.receive('sync', 'gameID', '1', 2);
  });

  test('send', () => {
    io.socket.id = '0';
    api.send({ type: 'A', playerID: '0', args: [] });
    expect(io.socket.emit).toHaveBeenCalledWith('A');
  });

  test('send to another player', () => {
    io.socket.id = '0';
    api.send({ type: 'A', playerID: '1', args: [] });
    expect(io.socket.emit).toHaveBeenCalledWith('A');
  });

  test('sendAll - object', () => {
    api.sendAll({ type: 'A', args: [] });
    expect(io.socket.emit).toHaveBeenCalledWith('A');
  });

  test('sendAll - function', () => {
    api.sendAll(playerID => ({ type: 'A', args: [playerID] }));
    expect(io.socket.emit).toHaveBeenCalledWith('A', '0');
    expect(io.socket.emit).toHaveBeenCalledWith('A', '1');
  });
});

describe('sync / update', () => {
  const app = { context: {} };
  const games = [Game({ seed: 0 })];
  const transport = SocketIO();
  transport.init(app, games);
  const io = app.context.io;

  test('sync', () => {
    io.socket.receive('sync', 'gameID', '0');
  });

  test('update', () => {
    io.socket.receive('update');
  });
});

describe('connect / disconnect', () => {
  const app = { context: {} };
  const games = [Game({ seed: 0 })];
  let _clientInfo;
  let _roomInfo;
  let io;

  const toObj = m => {
    let o = {};
    m.forEach((value, key) => {
      o[key] = value;
    });
    return o;
  };

  beforeAll(() => {
    _clientInfo = new Map();
    _roomInfo = new Map();
    const transport = SocketIO(_clientInfo, _roomInfo);
    transport.init(app, games);
    io = app.context.io;
  });

  test('0 and 1 connect', async () => {
    io.socket.id = '0';
    await io.socket.receive('sync', 'gameID', '0', 2);
    io.socket.id = '1';
    await io.socket.receive('sync', 'gameID', '1', 2);

    expect(toObj(_clientInfo)['0']).toMatchObject({
      gameID: 'gameID',
      playerID: '0',
    });
    expect(toObj(_clientInfo)['1']).toMatchObject({
      gameID: 'gameID',
      playerID: '1',
    });
  });

  test('0 disconnects', async () => {
    io.socket.id = '0';
    await io.socket.receive('disconnect');

    expect(toObj(_clientInfo)['0']).toBeUndefined();
    expect(toObj(_clientInfo)['1']).toMatchObject({
      gameID: 'gameID',
      playerID: '1',
    });
    expect(toObj(_roomInfo.get('gameID'))).toEqual({ '1': '1' });
  });

  test('unknown player disconnects', async () => {
    io.socket.id = 'unknown';
    await io.socket.receive('disconnect');

    expect(toObj(_clientInfo)['0']).toBeUndefined();
    expect(toObj(_clientInfo)['1']).toMatchObject({
      gameID: 'gameID',
      playerID: '1',
    });
    expect(toObj(_roomInfo.get('gameID'))).toEqual({ '1': '1' });
  });

  test('1 disconnects', async () => {
    io.socket.id = '1';
    await io.socket.receive('disconnect');
    expect(toObj(_clientInfo)).toEqual({});
    expect(toObj(_roomInfo.get('gameID'))).toEqual({});
  });
});
