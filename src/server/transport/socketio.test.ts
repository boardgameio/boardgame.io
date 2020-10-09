/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { TransportAPI, SocketIO, SocketOpts } from './socketio';
import { ProcessGameConfig } from '../../core/game';

type SocketIOTestAdapterOpts = SocketOpts & {
  clientInfo?: Map<any, any>;
  roomInfo?: Map<any, any>;
};

class SocketIOTestAdapter extends SocketIO {
  constructor({
    clientInfo = new Map(),
    roomInfo = new Map(),
    ...args
  }: SocketIOTestAdapterOpts = {}) {
    super(Object.keys(args).length ? args : undefined);
    this.clientInfo = clientInfo;
    this.roomInfo = roomInfo;
  }
}

jest.mock('../../master/master', () => {
  class Master {
    onUpdate: jest.Mock<any, any>;
    onSync: jest.Mock<any, any>;

    constructor() {
      this.onUpdate = jest.fn();
      this.onSync = jest.fn();
    }
  }

  return { Master };
});

jest.mock('koa-socket-2', () => {
  class MockSocket {
    id: string;
    callbacks: {};
    emit: jest.Mock<any, any>;
    broadcast: { emit: jest.Mock<any, any> };

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
    socket: MockSocket;
    socketAdapter: any;

    constructor() {
      this.socket = new MockSocket();
    }

    adapter(socketAdapter) {
      this.socketAdapter = socketAdapter;
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
  const app: any = { context: {} };
  const games = [ProcessGameConfig({ seed: 0 })];
  let clientInfo;
  let roomInfo;

  beforeEach(() => {
    clientInfo = new Map();
    roomInfo = new Map();
    const transport = new SocketIOTestAdapter({ clientInfo, roomInfo });
    transport.init(app, games);
  });

  test('is attached to app', () => {
    expect(app.context.io).toBeDefined();
  });
});

describe('socketAdapter', () => {
  const app: any = { context: {} };
  const games = [ProcessGameConfig({ seed: 0 })];

  let socketAdapter = jest.fn();

  beforeEach(() => {
    const transport = new SocketIOTestAdapter({ socketAdapter });
    transport.init(app, games);
  });

  test('socketAdapter is passed', () => {
    expect(app.io.socketAdapter).toBe(socketAdapter);
  });
});

describe('TransportAPI', () => {
  let io;
  let api;

  beforeAll(() => {
    const app: any = { context: {} };
    const games = [ProcessGameConfig({ seed: 0 })];
    const clientInfo = new Map();
    const roomInfo = new Map();
    const transport = new SocketIOTestAdapter({ clientInfo, roomInfo });
    transport.init(app, games);
    io = app.context.io;
    api = TransportAPI('matchID', io.socket, clientInfo, roomInfo);
  });

  beforeEach(async () => {
    io.socket.emit = jest.fn();
    io.socket.id = '0';
    await io.socket.receive('sync', 'matchID', '0', 2);
    io.socket.id = '1';
    await io.socket.receive('sync', 'matchID', '1', 2);
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

  test('sendAll - function', () => {
    api.sendAll(playerID => ({ type: 'A', args: [playerID] }));
    expect(io.socket.emit).toHaveBeenCalledWith('A', '0');
    expect(io.socket.emit).toHaveBeenCalledWith('A', '1');
  });
});

describe('sync / update', () => {
  const app: any = { context: {} };
  const games = [ProcessGameConfig({ seed: 0 })];
  const transport = new SocketIOTestAdapter();
  transport.init(app, games);
  const io = app.context.io;

  test('sync', () => {
    io.socket.receive('sync', 'matchID', '0');
  });

  test('update', () => {
    io.socket.receive('update');
  });
});

describe('connect / disconnect', () => {
  const app: any = { context: {} };
  const games = [ProcessGameConfig({ seed: 0 })];
  let clientInfo;
  let roomInfo;
  let io;

  const toObj = m => {
    let o = {};
    m.forEach((value, key) => {
      o[key] = value;
    });
    return o;
  };

  beforeAll(() => {
    clientInfo = new Map();
    roomInfo = new Map();
    const transport = new SocketIOTestAdapter({ clientInfo, roomInfo });
    transport.init(app, games);
    io = app.context.io;
  });

  test('0 and 1 connect', async () => {
    io.socket.id = '0';
    await io.socket.receive('sync', 'matchID', '0', 2);
    io.socket.id = '1';
    await io.socket.receive('sync', 'matchID', '1', 2);

    expect(toObj(clientInfo)['0']).toMatchObject({
      matchID: 'matchID',
      playerID: '0',
    });
    expect(toObj(clientInfo)['1']).toMatchObject({
      matchID: 'matchID',
      playerID: '1',
    });
  });

  test('0 disconnects', async () => {
    io.socket.id = '0';
    await io.socket.receive('disconnect');

    expect(toObj(clientInfo)['0']).toBeUndefined();
    expect(toObj(clientInfo)['1']).toMatchObject({
      matchID: 'matchID',
      playerID: '1',
    });
    expect(toObj(roomInfo.get('matchID'))).toEqual({ '1': '1' });
  });

  test('unknown player disconnects', async () => {
    io.socket.id = 'unknown';
    await io.socket.receive('disconnect');

    expect(toObj(clientInfo)['0']).toBeUndefined();
    expect(toObj(clientInfo)['1']).toMatchObject({
      matchID: 'matchID',
      playerID: '1',
    });
    expect(toObj(roomInfo.get('matchID'))).toEqual({ '1': '1' });
  });

  test('1 disconnects', async () => {
    io.socket.id = '1';
    await io.socket.receive('disconnect');
    expect(toObj(clientInfo)).toEqual({});
    expect(toObj(roomInfo.get('matchID'))).toEqual({});
  });
});
