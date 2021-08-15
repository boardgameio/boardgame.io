/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import type { SocketOpts } from './socketio';
import { TransportAPI, SocketIO } from './socketio';
import { Auth } from '../auth';
import { ProcessGameConfig } from '../../core/game';
import type { Master } from '../../master/master';
import { error } from '../../core/logger';
import { getFilterPlayerView } from '../../master/filter-player-view';

jest.mock('../../core/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
}));

type SyncArgs = Parameters<Master['onSync']>;

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
    super(Object.keys(args).length > 0 ? args : undefined);
    this.clientInfo = clientInfo;
    this.roomInfo = roomInfo;
  }

  public getPubSub() {
    return this.pubSub;
  }
}

jest.mock('../../master/master', () => {
  class Master {
    onUpdate: jest.Mock<any, any>;
    onSync: jest.Mock<any, any>;
    onConnectionChange: jest.Mock<any, any>;
    onChatMessage: jest.Mock<any, any>;

    constructor() {
      this.onUpdate = jest.fn();
      this.onSync = jest.fn();
      this.onConnectionChange = jest.fn();
      this.onChatMessage = jest.fn();
    }
  }

  return { Master };
});

jest.mock('koa-socket-2', () => {
  class MockSocket {
    id: string;
    callbacks: Record<string, (...args: any[]) => any>;
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
  const auth = new Auth({ authenticateCredentials: () => true });
  const app: any = { context: { auth } };
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
  const auth = new Auth({ authenticateCredentials: () => true });
  const app: any = { context: { auth } };
  const games = [ProcessGameConfig({ seed: 0 })];

  const socketAdapter = jest.fn();

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
  const matchID = 'matchID';

  beforeAll(() => {
    const auth = new Auth({ authenticateCredentials: () => true });
    const app: any = { context: { auth } };
    const games = [ProcessGameConfig({ seed: 0 })];
    const clientInfo = new Map();
    const roomInfo = new Map();
    const transport = new SocketIOTestAdapter({ clientInfo, roomInfo });
    transport.init(app, games);
    io = app.context.io;
    const socket = io.socket;
    const filterPlayerView = getFilterPlayerView(games[0]);
    api = TransportAPI(
      matchID,
      socket,
      filterPlayerView,
      transport.getPubSub()
    );
  });

  beforeEach(async () => {
    io.socket.emit = jest.fn();
    io.socket.id = '0';
    const args0: SyncArgs = [matchID, '0', undefined];
    await io.socket.receive('sync', ...args0);
    io.socket.id = '1';
    const args1: SyncArgs = [matchID, '1', undefined];
    await io.socket.receive('sync', ...args1);
  });

  test('send', () => {
    io.socket.id = '0';
    api.send({ type: 'A', playerID: '0', args: [] });
    expect(io.socket.emit).toHaveBeenCalledWith('A');
  });

  test('sendAll - function', () => {
    api.sendAll({ type: 'A', args: [] });
    expect(io.socket.emit).toHaveBeenCalledTimes(2);
    expect(io.socket.emit).toHaveBeenCalledWith('A');
  });
});

describe('sync / update', () => {
  const auth = new Auth({ authenticateCredentials: () => true });
  const app: any = { context: { auth } };
  const games = [ProcessGameConfig({ seed: 0 })];
  const transport = new SocketIOTestAdapter();
  transport.init(app, games);
  const io = app.context.io;

  test('sync', () => {
    io.socket.receive('sync', 'matchID', '0');
    expect(error).not.toBeCalled();
  });

  test('update', () => {
    io.socket.receive('update');
    expect(error).not.toBeCalled();
  });
});

describe('chat', () => {
  const app: any = { context: {} };
  const games = [ProcessGameConfig({ seed: 0 })];
  const transport = new SocketIOTestAdapter();
  transport.init(app, games);
  const io = app.context.io;

  test('chat message', async () => {
    await io.socket.receive('chat', 'matchID', { message: 'foo' });
    expect(error).not.toBeCalled();
  });
});

describe('connect / disconnect', () => {
  const auth = new Auth({ authenticateCredentials: () => true });
  const app: any = { context: { auth } };
  const games = [ProcessGameConfig({ seed: 0 })];
  let clientInfo;
  let roomInfo;
  let io;

  beforeAll(() => {
    clientInfo = new Map();
    roomInfo = new Map();
    const transport = new SocketIOTestAdapter({ clientInfo, roomInfo });
    transport.init(app, games);
    io = app.context.io;
  });

  test('0 and 1 connect', async () => {
    io.socket.id = '0';
    const args0: SyncArgs = ['matchID', '0', undefined, 2];
    await io.socket.receive('sync', ...args0);
    io.socket.id = '1';
    const args1: SyncArgs = ['matchID', '1', undefined, 2];
    await io.socket.receive('sync', ...args1);

    expect(clientInfo.get('0')).toMatchObject({
      matchID: 'matchID',
      playerID: '0',
    });
    expect(clientInfo.get('1')).toMatchObject({
      matchID: 'matchID',
      playerID: '1',
    });
  });

  test('0 disconnects', async () => {
    io.socket.id = '0';
    await io.socket.receive('disconnect');

    expect(clientInfo.get('0')).toBeUndefined();
    expect(clientInfo.get('1')).toMatchObject({
      matchID: 'matchID',
      playerID: '1',
    });
    expect([...roomInfo.get('matchID')]).toEqual(['1']);
  });

  test('unknown player disconnects', async () => {
    io.socket.id = 'unknown';
    await io.socket.receive('disconnect');

    expect(clientInfo.get('0')).toBeUndefined();
    expect(clientInfo.get('1')).toMatchObject({
      matchID: 'matchID',
      playerID: '1',
    });
    expect([...roomInfo.get('matchID')]).toEqual(['1']);
  });

  test('1 disconnects', async () => {
    io.socket.id = '1';
    await io.socket.receive('disconnect');
    expect([...clientInfo.keys()]).toHaveLength(0);
    expect(roomInfo.get('matchID')).toBeUndefined();
  });
});
