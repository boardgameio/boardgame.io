/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import IO from 'koa-socket-2';
import { SocketIO, SocketOpts } from './socketio';
import { InMemory } from '../db';
import { createMetadata } from '../util';
import { ProcessGameConfig } from '../../core/game';
import * as ActionCreators from '../../core/action-creators';
import { InitializeGame } from '../../core/initialize';
import { PlayerView } from '../../core/player-view';
import { _ClientImpl } from '../../client/client';
import { Ctx, LogEntry, Server, State, StorageAPI } from '../../types';

type SocketIOTestAdapterOpts = SocketOpts & {
  clientInfo?: Map<any, any>;
  roomInfo?: Map<any, any>;
};

class InMemoryAsync extends StorageAPI.Async {
  db: InMemory;

  constructor() {
    super();
    this.db = new InMemory();
  }

  async connect() {
    await this.sleep();
  }

  private sleep(): Promise<void> {
    const interval = Math.round(Math.random() * 50 + 50);
    return new Promise(resolve => void setTimeout(resolve, interval));
  }

  async createMatch(id: string, opts: StorageAPI.CreateMatchOpts) {
    await this.sleep();
    this.db.createMatch(id, opts);
  }

  async setMetadata(matchID: string, metadata: Server.MatchData) {
    await this.sleep();
    this.db.setMetadata(matchID, metadata);
  }

  async setState(matchID: string, state: State, deltalog?: LogEntry[]) {
    await this.sleep();
    this.db.setState(matchID, state, deltalog);
  }

  async fetch<O extends StorageAPI.FetchOpts>(
    matchID: string,
    opts: O
  ): Promise<StorageAPI.FetchResult<O>> {
    await this.sleep();
    return this.db.fetch(matchID, opts);
  }

  async wipe(matchID: string) {
    await this.sleep();
    this.db.wipe(matchID);
  }

  async listMatches(opts?: StorageAPI.ListMatchesOpts): Promise<string[]> {
    await this.sleep();
    return this.db.listMatches(opts);
  }
}

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

describe('simultaneous moves on server game', () => {
  let app;
  let transport: SocketIOTestAdapter;
  let clientInfo;
  let roomInfo;
  let io: IO;

  beforeEach(async () => {
    clientInfo = new Map();
    roomInfo = new Map();
  });

  test('two clients playing using sync storage', async () => {
    let db = new InMemory();
    app = { context: { db: db } };
    transport = new SocketIOTestAdapter({
      clientInfo,
      roomInfo,
      auth: () => true,
    });
    transport.init(app, [ProcessGameConfig(game)]);
    io = app.context.io;
    let fetchResult;

    const spyGetMatchQueue = jest.spyOn(
      SocketIOTestAdapter.prototype,
      'getMatchQueue'
    );
    const spyDeleteMatchQueue = jest.spyOn(
      SocketIOTestAdapter.prototype,
      'deleteMatchQueue'
    );

    db.createMatch('matchID', {
      initialState: InitializeGame({ game, numPlayers: 2 }),
      metadata: createMetadata({
        game: game,
        unlisted: false,
        numPlayers: 2,
      }),
    });

    // Call sync for both players
    await Promise.all([
      (async () => {
        io.socket.id = '0';
        await io.socket.receive('sync', 'matchID', '0', 2);
      })(),
      (async () => {
        io.socket.id = '1';
        await io.socket.receive('sync', 'matchID', '1', 2);
      })(),
    ]);

    // Call normal move
    io.socket.id = '0';
    await io.socket.receive(
      'update',
      ActionCreators.makeMove('A', null, '0'),
      0,
      'matchID',
      '0'
    );

    // Assertions for match queue creation
    expect(spyGetMatchQueue).toHaveBeenCalledWith('matchID');

    // Set all players active
    await io.socket.receive(
      'update',
      ActionCreators.gameEvent('setActivePlayers', [{ all: 'A' }], '0'),
      1,
      'matchID',
      '0'
    );

    // Call actions simultaeously
    await Promise.all([
      (async () => {
        io.socket.id = '1';
        await io.socket.receive(
          'update',
          ActionCreators.makeMove('B', null, '1'),
          2,
          'matchID',
          '1'
        );
      })(),
      (async () => {
        io.socket.id = '0';
        await io.socket.receive(
          'update',
          ActionCreators.makeMove('B', null, '0'),
          2,
          'matchID',
          '0'
        );
      })(),
    ]);

    fetchResult = db.fetch('matchID', {
      state: true,
      metadata: true,
      log: true,
    });

    expect(fetchResult.state.G).toMatchObject({
      players: {
        '0': {
          cards: ['card1'],
        },
        '1': {
          cards: ['card2'],
        },
      },
      cards: ['card0'],
      discardedCards: ['card3'],
    });

    // Call disconnect for both players
    await Promise.all([
      (async () => {
        io.socket.id = '0';
        await io.socket.receive('disconnect', 'matchID', '0', 2);
      })(),
      (async () => {
        io.socket.id = '1';
        await io.socket.receive('disconnect', 'matchID', '1', 2);
      })(),
    ]);

    expect(spyDeleteMatchQueue).toHaveBeenCalledWith('matchID');

    db.wipe('matchID');
  });

  test('two clients playing using async storage', async () => {
    let db = new InMemoryAsync();
    await db.connect();

    app = { context: { db: db } };
    transport = new SocketIOTestAdapter({
      clientInfo,
      roomInfo,
      auth: () => true,
    });
    transport.init(app, [ProcessGameConfig(game)]);
    io = app.context.io;
    let fetchResult;

    const spyGetMatchQueue = jest.spyOn(
      SocketIOTestAdapter.prototype,
      'getMatchQueue'
    );
    const spyDeleteMatchQueue = jest.spyOn(
      SocketIOTestAdapter.prototype,
      'deleteMatchQueue'
    );

    await db.createMatch('matchID', {
      initialState: InitializeGame({ game, numPlayers: 2 }),
      metadata: createMetadata({
        game: game,
        unlisted: false,
        numPlayers: 2,
      }),
    });

    // Call sync for both players
    await Promise.all([
      (async () => {
        io.socket.id = '0';
        await io.socket.receive('sync', 'matchID', '0', 2);
      })(),
      (async () => {
        io.socket.id = '1';
        await io.socket.receive('sync', 'matchID', '1', 2);
      })(),
    ]);

    // Call normal move
    io.socket.id = '0';
    await io.socket.receive(
      'update',
      ActionCreators.makeMove('A', null, '0'),
      0,
      'matchID',
      '0'
    );

    // Assertions for match queue creation
    expect(spyGetMatchQueue).toHaveBeenCalledWith('matchID');

    // Set all players active
    await io.socket.receive(
      'update',
      ActionCreators.gameEvent('setActivePlayers', [{ all: 'A' }], '0'),
      1,
      'matchID',
      '0'
    );

    // Call actions simultaeously
    await Promise.all([
      (async () => {
        io.socket.id = '1';
        await io.socket.receive(
          'update',
          ActionCreators.makeMove('B', null, '1'),
          2,
          'matchID',
          '1'
        );
      })(),
      (async () => {
        io.socket.id = '0';
        await io.socket.receive(
          'update',
          ActionCreators.makeMove('B', null, '0'),
          2,
          'matchID',
          '0'
        );
      })(),
    ]);

    fetchResult = await db.fetch('matchID', {
      state: true,
      metadata: true,
      log: true,
    });

    expect(fetchResult.state.G).toMatchObject({
      players: {
        '0': {
          cards: ['card1'],
        },
        '1': {
          cards: ['card2'],
        },
      },
      cards: ['card0'],
      discardedCards: ['card3'],
    });

    // Call disconnect for both players
    await Promise.all([
      (async () => {
        io.socket.id = '0';
        await io.socket.receive('disconnect', 'matchID', '0', 2);
      })(),
      (async () => {
        io.socket.id = '1';
        await io.socket.receive('disconnect', 'matchID', '1', 2);
      })(),
    ]);

    expect(spyDeleteMatchQueue).toHaveBeenCalledWith('matchID');

    await db.wipe('matchID');
  });
});
