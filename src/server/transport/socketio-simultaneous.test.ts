/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import type { SocketOpts } from './socketio';
import { SocketIO } from './socketio';
import { Auth } from '../auth';
import { InMemory } from '../db';
import { Async } from '../db/base';
import { createMetadata } from '../util';
import { ProcessGameConfig } from '../../core/game';
import * as ActionCreators from '../../core/action-creators';
import { InitializeGame } from '../../core/initialize';
import { PlayerView } from '../../core/player-view';
import type { Master } from '../../master/master';
import type { Game, LogEntry, Server, State, StorageAPI } from '../../types';

type SyncArgs = Parameters<Master['onSync']>;
type UpdateArgs = Parameters<Master['onUpdate']>;

type SocketIOTestAdapterOpts = SocketOpts & {
  clientInfo?: Map<any, any>;
  roomInfo?: Map<any, any>;
};

class InMemoryAsync extends Async {
  db: InMemory;
  delays: number[];

  constructor() {
    super();
    this.db = new InMemory();
    this.delays = [];
  }

  async connect() {
    await this.sleep();
  }

  private sleep(): Promise<void> {
    const interval =
      this.delays.length > 0
        ? this.delays.shift()
        : Math.round(Math.random() * 50 + 50);
    return new Promise((resolve) => void setTimeout(resolve, interval));
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
    super(Object.keys(args).length > 0 ? args : undefined);
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
    callbacks: Record<string, (...args: any[]) => Promise<void>>;
    emit: jest.Mock<any, any>;
    broadcast: { emit: jest.Mock<any, any> };

    constructor({ id }: { id: string }) {
      this.id = id;
      this.callbacks = {};
      this.emit = jest.fn();
      this.broadcast = { emit: jest.fn() };
    }

    async receive(type, ...args) {
      await this.callbacks[type](...args);
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
    sockets: Map<string, MockSocket>;
    socketAdapter: any;

    constructor() {
      this.sockets = new Map(
        ['0', '1'].map((id) => [id, new MockSocket({ id })])
      );
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

    on(_event, callback) {
      this.sockets.forEach((socket) => void callback(socket));
    }
  }

  return MockIO;
});

describe('simultaneous moves on server game', () => {
  const game: Game = {
    name: 'test',
    setup: () => ({
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
    }),
    playerView: PlayerView.STRIP_SECRETS,
    turn: {
      activePlayers: { currentPlayer: { stage: 'A' } },
      stages: {
        A: {
          moves: {
            A: {
              client: false,
              move: ({ G, playerID }) => {
                const card = G.players[playerID].cards.shift();
                G.discardedCards.push(card);
              },
            },
            B: {
              client: false,
              ignoreStaleStateID: true,
              move: ({ G, playerID }) => {
                const card = G.cards.pop();
                G.players[playerID].cards.push(card);
              },
            },
          },
        },
      },
    },
  };

  let app;
  let transport: SocketIOTestAdapter;
  let clientInfo;
  let roomInfo;
  let io;

  beforeEach(async () => {
    clientInfo = new Map();
    roomInfo = new Map();
  });

  test('two clients playing using sync storage', async () => {
    const db = new InMemory();
    const auth = new Auth();
    app = { context: { db, auth } };
    transport = new SocketIOTestAdapter({
      clientInfo,
      roomInfo,
    });
    transport.init(app, [ProcessGameConfig(game)]);
    io = app.context.io;
    const socket0 = io.sockets.get('0');
    const socket1 = io.sockets.get('1');

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
        const args0: SyncArgs = ['matchID', '0', undefined, 2];
        await socket0.receive('sync', ...args0);
      })(),
      (async () => {
        const args1: SyncArgs = ['matchID', '1', undefined, 2];
        await socket1.receive('sync', ...args1);
      })(),
    ]);

    const moveAArgs: UpdateArgs = [
      ActionCreators.makeMove('A', null, '0'),
      0,
      'matchID',
      '0',
    ];

    // Call normal move
    await socket0.receive('update', ...moveAArgs);

    // Assertions for match queue creation
    expect(spyGetMatchQueue).toHaveBeenCalledWith('matchID');

    const activePlayersArgs: UpdateArgs = [
      ActionCreators.gameEvent('setActivePlayers', [{ all: 'A' }], '0'),
      1,
      'matchID',
      '0',
    ];

    // Set all players active
    await socket0.receive('update', ...activePlayersArgs);

    // Call actions simultaeously
    await Promise.all([
      (async () => {
        const moveBArgs: UpdateArgs = [
          ActionCreators.makeMove('B', null, '1'),
          2,
          'matchID',
          '1',
        ];
        await socket1.receive('update', ...moveBArgs);
      })(),
      (async () => {
        const moveBArgs: UpdateArgs = [
          ActionCreators.makeMove('B', null, '0'),
          2,
          'matchID',
          '0',
        ];
        await socket0.receive('update', ...moveBArgs);
      })(),
    ]);

    const fetchResult = db.fetch('matchID', {
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
        await socket0.receive('disconnect');
      })(),
      (async () => {
        await socket1.receive('disconnect');
      })(),
    ]);

    expect(spyDeleteMatchQueue).toHaveBeenCalledWith('matchID');

    db.wipe('matchID');
  });

  test('two clients playing using async storage', async () => {
    const db = new InMemoryAsync();
    await db.connect();
    const auth = new Auth();

    app = { context: { db, auth } };
    transport = new SocketIOTestAdapter({
      clientInfo,
      roomInfo,
    });
    transport.init(app, [ProcessGameConfig(game)]);
    io = app.context.io;
    const socket0 = io.sockets.get('0');
    const socket1 = io.sockets.get('1');

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
        await socket0.receive('sync', 'matchID', '0', 2);
      })(),
      (async () => {
        await socket1.receive('sync', 'matchID', '1', 2);
      })(),
    ]);

    const moveAArgs: UpdateArgs = [
      ActionCreators.makeMove('A', null, '0'),
      0,
      'matchID',
      '0',
    ];

    // Call normal move
    await socket0.receive('update', ...moveAArgs);

    // Assertions for match queue creation
    expect(spyGetMatchQueue).toHaveBeenCalledWith('matchID');

    const activePlayersArgs: UpdateArgs = [
      ActionCreators.gameEvent('setActivePlayers', [{ all: 'A' }], '0'),
      1,
      'matchID',
      '0',
    ];

    // Set all players active
    await socket0.receive('update', ...activePlayersArgs);

    // Call actions simultaeously
    await Promise.all([
      (async () => {
        const moveBArgs: UpdateArgs = [
          ActionCreators.makeMove('B', null, '1'),
          2,
          'matchID',
          '1',
        ];
        await socket1.receive('update', ...moveBArgs);
      })(),
      (async () => {
        const moveBArgs: UpdateArgs = [
          ActionCreators.makeMove('B', null, '0'),
          2,
          'matchID',
          '0',
        ];
        await socket0.receive('update', ...moveBArgs);
      })(),
    ]);

    const fetchResult = await db.fetch('matchID', {
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
        await socket0.receive('disconnect');
      })(),
      (async () => {
        await socket1.receive('disconnect');
      })(),
    ]);

    expect(spyDeleteMatchQueue).toHaveBeenCalledWith('matchID');

    await db.wipe('matchID');
  });
});

describe('inauthentic clients', () => {
  const game: Game = {
    setup: () => ({
      0: 'foo',
      1: 'bar',
    }),
    playerView: ({ G, playerID }) => ({ [playerID]: G[playerID] }),
  };

  let app;
  let db: InMemoryAsync;
  let transport: SocketIOTestAdapter;
  let clientInfo: Map<string, Record<string, any>>;
  let roomInfo: Map<string, Set<string>>;
  let io;
  const matchID = 'matchID';
  const cred0 = 'password-0';
  const cred1 = 'password-1';

  beforeEach(async () => {
    clientInfo = new Map();
    roomInfo = new Map();

    db = new InMemoryAsync();
    await db.connect();

    app = { context: { db, auth: new Auth() } };
    transport = new SocketIOTestAdapter({ clientInfo, roomInfo });
    transport.init(app, [ProcessGameConfig(game)]);
    io = app.context.io;

    // Create credentialed match.
    const metadata = createMetadata({ game, unlisted: false, numPlayers: 2 });
    metadata.players[0].credentials = cred0;
    metadata.players[1].credentials = cred1;
    const initialState = InitializeGame({ game, numPlayers: 2 });
    await db.createMatch(matchID, { initialState, metadata });
  });

  afterEach(async () => {
    await db.wipe(matchID);
  });

  test('inauthentic client is not added to clientInfo', async () => {
    const inauthenticID = '0';
    const socket = io.sockets.get(inauthenticID);

    const args: Parameters<Master['onSync']> = ['matchID', '0', undefined];
    const doneReceiving = socket.receive('sync', ...args);
    // Is not added before awaiting the game master.
    expect(clientInfo.get(inauthenticID)).toBeUndefined();
    await doneReceiving;
    // Is not added after awaiting the game master.
    expect(clientInfo.get(inauthenticID)).toBeUndefined();
  });

  test('connected inauthentic client doesn’t receive authentic client’s sync', async () => {
    const inauthenticID = '0';
    const authenticID = '1';
    const inauthenticSocket = io.sockets.get(inauthenticID);
    const authenticSocket = io.sockets.get(authenticID);

    // Call sync for both players
    {
      const args: Parameters<Master['onSync']> = ['matchID', '0', undefined];
      await inauthenticSocket.receive('sync', ...args);
    }
    {
      const args: Parameters<Master['onSync']> = ['matchID', '0', cred0];
      await authenticSocket.receive('sync', ...args);
    }

    expect(clientInfo.get(inauthenticID)).toBeUndefined();

    expect(clientInfo.get(authenticID)).toEqual({
      matchID,
      playerID: '0',
      credentials: cred0,
      socket: authenticSocket,
    });

    expect(inauthenticSocket.emit).not.toHaveBeenCalled();

    expect(authenticSocket.emit).toHaveBeenCalledWith(
      'sync',
      matchID,
      expect.objectContaining({
        state: expect.objectContaining({
          G: {
            0: 'foo',
          },
        }),
      })
    );

    const syncEmits = authenticSocket.emit.mock.calls.filter(
      ([type]) => type === 'sync'
    );
    expect(syncEmits).toHaveLength(1);
  });

  test('inauthentic client doesn’t receive authentic client’s sync while still syncing', async () => {
    const inauthenticID = '0';
    const authenticID = '1';
    const inauthenticSocket = io.sockets.get(inauthenticID);
    const authenticSocket = io.sockets.get(authenticID);

    // Make db#fetch in Master#onSync for first sync resolve after second sync.
    db.delays = [200, 0];

    // Call sync for both players
    await Promise.all([
      (async () => {
        const args: Parameters<Master['onSync']> = ['matchID', '0', undefined];
        await inauthenticSocket.receive('sync', ...args);
      })(),
      (async () => {
        const args: Parameters<Master['onSync']> = ['matchID', '0', cred0];
        await authenticSocket.receive('sync', ...args);
      })(),
    ]);

    expect(clientInfo.get(inauthenticID)).toBeUndefined();

    expect(authenticSocket.emit).toHaveBeenCalledWith(
      'sync',
      matchID,
      expect.objectContaining({
        state: expect.objectContaining({
          G: {
            0: 'foo',
          },
        }),
      })
    );

    const syncEmits = authenticSocket.emit.mock.calls.filter(
      ([type]) => type === 'sync'
    );
    expect(syncEmits).toHaveLength(1);
  });
});
