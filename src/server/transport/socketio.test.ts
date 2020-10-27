/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { TransportAPI, SocketIO, SocketOpts } from './socketio';
import { CreateMatch } from '../api';
import { KoaServer, Server } from '../index';
import { InMemory } from '../db/inmemory';
import { ProcessGameConfig } from '../../core/game';
import * as ActionCreators from '../../core/action-creators';
import { PlayerView } from '../../core/player-view';
import { Client, _ClientImpl } from '../../client/client';
import { SocketIO as SocketIOClient } from '../../client/transport/socketio';
import { Ctx, StorageAPI, SyncInfo } from '../../types';
import { InitializeGame } from '../../core/initialize';
import { createMetadata } from '../util';
import { Transport } from '../../client/transport/transport';
import IO from 'koa-socket-2';

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

  public get getPerMatchQueue() {
    return this.perMatchQueue;
  }
}

jest.mock('../../master/master', () => {
  function IsSynchronous(
    storageAPI: StorageAPI.Sync | StorageAPI.Async
  ): storageAPI is StorageAPI.Sync {
    return storageAPI.type() === StorageAPI.Type.SYNC;
  }

  class Master {
    onUpdate: jest.Mock<any, any>;
    onSync: jest.Mock<any, any>;

    constructor() {
      this.onUpdate = jest.fn();
      this.onSync = jest.fn();
    }
  }

  return { Master, IsSynchronous };
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
  let transport;

  beforeAll(() => {
    const app: any = { context: {} };
    const games = [ProcessGameConfig({ seed: 0 })];
    const clientInfo = new Map();
    const roomInfo = new Map();
    transport = new SocketIOTestAdapter({ clientInfo, roomInfo });
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
  let transport: SocketIOTestAdapter;
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
    transport = new SocketIOTestAdapter({ clientInfo, roomInfo });
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
    expect(transport.getPerMatchQueue.get('matchID')).toBeUndefined();
  });
});

describe('simultaneous moves on server game', () => {
  const game = {
    name: 'test',
    setup: ctx => {
      const G = {
        players: {
          '0': {
            cards: ['card3'],
          },
          '1': {
            cards: [],
          },
        },
        cards: ['card0', 'card1', 'card2'],
        discardedCards: [],
      };
      return G;
    },
    playerView: PlayerView.STRIP_SECRETS,
    turn: {
      activePlayers: { currentPlayer: { stage: 'A' } },
      stages: {
        A: {
          moves: {
            A: {
              client: false,
              move: (G, ctx: Ctx) => {
                const card = G.players[ctx.playerID].cards.shift();
                G.discardedCards.push(card);
              },
            },
            B: {
              client: false,
              ignoreStaleStateID: true,
              move: (G, ctx: Ctx) => {
                const card = G.cards.pop();
                G.players[ctx.playerID].cards.push(card);
              },
            },
          },
        },
      },
    },
  };
  let db = new InMemory();
  const app: any = { context: { db: db } };
  let transport: SocketIOTestAdapter;
  let clientInfo;
  let roomInfo;
  let io: IO;

  beforeEach(async () => {
    clientInfo = new Map();
    roomInfo = new Map();
    transport = new SocketIOTestAdapter({
      clientInfo,
      roomInfo,
      auth: () => true,
    });
    transport.init(app, [ProcessGameConfig(game)]);
    io = app.context.io;
  });

  test('two clients playing', async () => {
    let fetchResult;
    db.createMatch('matchID', {
      initialState: InitializeGame({ game, numPlayers: 2 }),
      metadata: createMetadata({
        game: game,
        unlisted: false,
        numPlayers: 2,
      }),
    });

    // await Promise.all([
    // (async () => {
    io.socket.id = '0';
    await io.socket.receive('sync', 'matchID', '0', 2);
    // })(),
    // (async () => {
    io.socket.id = '1';
    await io.socket.receive('sync', 'matchID', '1', 2);
    // })(),
    // ]);

    io.socket.id = '0';
    await io.socket.receive(
      'update',
      ActionCreators.makeMove('A', null, '0'),
      0,
      'matchID',
      '0'
    );
    await io.socket.receive(
      'update',
      ActionCreators.gameEvent('setActivePlayers', [{ all: 'A' }], '0'),
      1,
      'matchID',
      '0'
    );

    fetchResult = db.fetch('matchID', { state: true, log: true });
    console.log(fetchResult.state);

    // await Promise.all([
    // (async () => {
    io.socket.id = '1';
    await io.socket.receive(
      'update',
      ActionCreators.makeMove('B', null, '1'),
      2,
      'matchID',
      '1'
    );
    // })(),
    // (async () => {
    io.socket.id = '0';
    await io.socket.receive(
      'update',
      ActionCreators.makeMove('B', null, '0'),
      2,
      'matchID',
      '0'
    );
    // })(),
    // ]);

    fetchResult = db.fetch('matchID', {
      state: true,
      metadata: true,
      log: true,
    });

    console.log(fetchResult.state);
    console.log(fetchResult.metadata);
    console.log(fetchResult.log);

    expect(fetchResult.state.G).toMatchObject({
      players: {
        '0': {
          cards: ['card1'],
        },
      },
      cards: ['card0'],
      discardedCards: ['card3'],
    });
  });
});
