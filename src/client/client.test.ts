/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { createStore } from 'redux';
import { CreateGameReducer } from '../core/reducer';
import { InitializeGame } from '../core/initialize';
import { Client, createMoveDispatchers } from './client';
import { ProcessGameConfig } from '../core/game';
import type { Transport } from './transport/transport';
import { LocalTransport, Local } from './transport/local';
import { SocketIOTransport, SocketIO } from './transport/socketio';
import { update, sync, makeMove, gameEvent } from '../core/action-creators';
import Debug from './debug/Debug.svelte';
import { error } from '../core/logger';
import type { LogEntry, State, SyncInfo } from '../types';

jest.mock('../core/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
}));

describe('basic', () => {
  let client;
  const initial = { initial: true };

  const game = {
    setup: () => initial,
  };

  beforeAll(() => {
    client = Client({ game });
  });

  test('getState', () => {
    expect(client.getState().G).toEqual(initial);
  });

  test('getInitialState', () => {
    expect(client.getInitialState().G).toEqual(initial);
  });
});

test('move api', () => {
  const client = Client({
    game: {
      moves: {
        A: (G, ctx, arg) => ({ arg }),
      },
    },
  });

  expect(client.getState().G).toEqual({});
  client.moves.A(42);
  expect(client.getState().G).toEqual({ arg: 42 });
});

describe('namespaced moves', () => {
  let client;
  beforeAll(() => {
    client = Client({
      game: {
        moves: {
          A: () => 'A',
        },

        phases: {
          PA: {
            moves: {
              B: () => 'B',
              C: () => 'C',
            },
          },
        },
      },
    });
  });

  test('top-level moves', () => {
    expect(client.moves.A).toBeInstanceOf(Function);
  });

  test('phase-level moves', () => {
    expect(client.moves.B).toBeInstanceOf(Function);
    expect(client.moves.C).toBeInstanceOf(Function);
  });

  test('moves are allowed only when phase is active', () => {
    client.moves.A();
    expect(client.getState().G).toEqual('A');

    client.moves.B();
    expect(error).toHaveBeenCalledWith('disallowed move: B');
    client.moves.C();
    expect(error).toHaveBeenCalledWith('disallowed move: C');

    client.events.setPhase('PA');
    expect(client.getState().ctx.phase).toBe('PA');

    client.moves.A();
    expect(error).toHaveBeenCalledWith('disallowed move: A');
    client.moves.B();
    expect(client.getState().G).toEqual('B');
    client.moves.C();
    expect(client.getState().G).toEqual('C');
  });
});

test('isActive', () => {
  const client = Client({
    game: {
      moves: {
        A: (G, ctx, arg) => ({ arg }),
      },

      endIf: (G) => G.arg == 42,
    },
  });

  expect(client.getState().G).toEqual({});
  expect(client.getState().isActive).toBe(true);
  client.moves.A(42);
  expect(client.getState().G).toEqual({ arg: 42 });
  expect(client.getState().isActive).toBe(false);
});

describe('multiplayer', () => {
  describe('socket.io master', () => {
    const host = 'host';
    const port = '4321';
    let client;

    beforeAll(() => {
      client = Client({
        game: { moves: { A: () => {} } },
        multiplayer: SocketIO({ server: host + ':' + port }),
      });
      client.start();
    });

    afterAll(() => {
      client.stop();
      jest.restoreAllMocks();
    });

    test('correct transport used', () => {
      expect(client.transport instanceof SocketIOTransport).toBe(true);
    });

    test('server set when provided', () => {
      expect(client.transport.socket.io.engine.hostname).toEqual(host);
      expect(client.transport.socket.io.engine.port).toEqual(port);
    });

    test('onAction called', () => {
      jest.spyOn(client.transport, 'onAction');
      const state = { G: {}, ctx: { phase: '' }, plugins: {} };
      const filteredMetadata = [];
      client.store.dispatch(sync({ state, filteredMetadata } as SyncInfo));
      client.moves.A();
      expect(client.transport.onAction).toHaveBeenCalled();
    });

    test('Sends and receives chat messages', () => {
      jest.spyOn(client.transport, 'onAction');
      client.updatePlayerID('0');
      client.updateMatchID('matchID');
      jest.spyOn(client.transport, 'onChatMessage');

      client.sendChatMessage({ message: 'foo' });

      expect(client.transport.onChatMessage).toHaveBeenCalledWith(
        'matchID',
        expect.objectContaining({ payload: { message: 'foo' }, sender: '0' })
      );
    });
  });

  describe('multiplayer: SocketIO()', () => {
    let client;

    beforeAll(() => {
      client = Client({
        game: {},
        multiplayer: SocketIO(),
      });
      client.start();
    });

    afterAll(() => {
      client.stop();
    });

    test('correct transport used', () => {
      expect(client.transport instanceof SocketIOTransport).toBe(true);
    });
  });

  describe('local master', () => {
    let client0;
    let client1;
    let spec;

    beforeAll(() => {
      spec = {
        game: { moves: { A: (G, ctx) => ({ A: ctx.playerID }) } },
        multiplayer: Local(),
      };

      client0 = Client({ ...spec, playerID: '0' });
      client1 = Client({ ...spec, playerID: '1' });

      client0.start();
      client1.start();
    });

    afterAll(() => {
      client0.stop();
      client1.stop();
    });

    test('correct transport used', () => {
      expect(client0.transport instanceof LocalTransport).toBe(true);
      expect(client1.transport instanceof LocalTransport).toBe(true);
    });

    test('multiplayer interactions', () => {
      expect(client0.getState().ctx.currentPlayer).toBe('0');
      expect(client1.getState().ctx.currentPlayer).toBe('0');

      client0.moves.A();

      expect(client0.getState().G).toEqual({ A: '0' });
      expect(client1.getState().G).toEqual({ A: '0' });

      client0.events.endTurn();

      expect(client0.getState().ctx.currentPlayer).toBe('1');
      expect(client1.getState().ctx.currentPlayer).toBe('1');

      client1.moves.A();

      expect(client0.getState().G).toEqual({ A: '1' });
      expect(client1.getState().G).toEqual({ A: '1' });

      client0.sendChatMessage({ message: 'foo' });

      expect(client0.chatMessages).toEqual([
        expect.objectContaining({ sender: '0', payload: { message: 'foo' } }),
      ]);
      expect(client1.chatMessages).toEqual([
        expect.objectContaining({ sender: '0', payload: { message: 'foo' } }),
      ]);

      client1.sendChatMessage({ message: 'bar' });
      expect(client0.chatMessages).toEqual([
        expect.objectContaining({ sender: '0', payload: { message: 'foo' } }),
        expect.objectContaining({ sender: '1', payload: { message: 'bar' } }),
      ]);
      expect(client1.chatMessages).toEqual([
        expect.objectContaining({ sender: '0', payload: { message: 'foo' } }),
        expect.objectContaining({ sender: '1', payload: { message: 'bar' } }),
      ]);
    });
  });

  describe('custom transport', () => {
    class CustomTransport {
      callback;

      constructor() {
        this.callback = null;
      }

      subscribeMatchData(fn) {
        this.callback = fn;
      }

      subscribeChatMessage() {}
    }
    const customTransport = () =>
      (new CustomTransport() as unknown) as Transport;

    let client;

    beforeAll(() => {
      client = Client({
        game: { moves: { A: () => {} } },
        multiplayer: customTransport,
      });
    });

    test('correct transport used', () => {
      expect(client.transport).toBeInstanceOf(CustomTransport);
    });

    test('metadata callback', () => {
      const metadata = { m: true };
      client.transport.callback(metadata);
      expect(client.matchData).toEqual(metadata);
    });
  });
});

describe('strip secret only on server', () => {
  let client0;
  let client1;
  let spec;
  const initial = { secret: [1, 2, 3, 4], sum: 0 };
  beforeAll(() => {
    spec = {
      game: {
        setup: () => initial,
        playerView: (G) => {
          const r = { ...G };
          r.sum = r.secret.reduce((prev, curr) => {
            return prev + curr;
          });
          delete r.secret;
          return r;
        },
        moves: { A: (G, ctx) => ({ A: ctx.playerID }) },
      },
      multiplayer: Local(),
    };

    client0 = Client({ ...spec, playerID: '0' });
    client1 = Client({ ...spec, playerID: '1' });

    client0.start();
    client1.start();
  });

  test('secret stripped', () => {
    expect(client0.getState().G).toEqual({ sum: 10 });
    expect(client1.getState().G).toEqual({ sum: 10 });
  });

  afterAll(() => {
    client0.stop();
    client1.stop();
  });
});

test('accepts enhancer for store', () => {
  let spyDispatcher;
  const spyEnhancer = (vanillaCreateStore) => (...args) => {
    const vanillaStore = vanillaCreateStore(...args);
    return {
      ...vanillaStore,
      dispatch: (spyDispatcher = jest.fn(vanillaStore.dispatch)),
    };
  };
  const client = Client({
    game: {
      moves: {
        A: (G, ctx, arg) => ({ arg }),
      },
    },
    enhancer: spyEnhancer,
  });

  expect(spyDispatcher.mock.calls).toHaveLength(0);
  client.moves.A(42);
  expect(spyDispatcher.mock.calls).toHaveLength(1);
});

describe('event dispatchers', () => {
  test('default', () => {
    const game = {};
    const client = Client({ game });
    expect(Object.keys(client.events)).toEqual([
      'endTurn',
      'pass',
      'endPhase',
      'setPhase',
      'endGame',
      'setActivePlayers',
      'endStage',
      'setStage',
    ]);
    expect(client.getState().ctx.turn).toBe(1);
    client.events.endTurn();
    expect(client.getState().ctx.turn).toBe(2);
  });

  test('all events', () => {
    const game = {
      events: {
        endPhase: true,
        endGame: true,
      },
    };
    const client = Client({ game });
    expect(Object.keys(client.events)).toEqual([
      'endTurn',
      'pass',
      'endPhase',
      'setPhase',
      'endGame',
      'setActivePlayers',
      'endStage',
      'setStage',
    ]);
    expect(client.getState().ctx.turn).toBe(1);
    client.events.endTurn();
    expect(client.getState().ctx.turn).toBe(2);
  });

  test('no events', () => {
    const game = {
      events: {
        endGame: false,
        endPhase: false,
        setPhase: false,
        endTurn: false,
        pass: false,
        setActivePlayers: false,
        endStage: false,
        setStage: false,
      },
    };
    const client = Client({ game });
    expect(Object.keys(client.events)).toEqual([]);
  });
});

describe('move dispatchers', () => {
  const game = ProcessGameConfig({
    moves: {
      A: (G) => G,
      B: (G, ctx) => ({ moved: ctx.playerID }),
      C: () => ({ victory: true }),
    },
    endIf: (G, ctx) => (G.victory ? ctx.currentPlayer : undefined),
  });
  const reducer = CreateGameReducer({ game });
  const initialState = InitializeGame({ game });

  test('basic', () => {
    const store = createStore(reducer, initialState);
    const api = createMoveDispatchers(game.moveNames, store);

    expect(Object.getOwnPropertyNames(api)).toEqual(['A', 'B', 'C']);
    expect(api.unknown).toBe(undefined);

    api.A();
    expect(store.getState().G).not.toMatchObject({ moved: true });
    expect(store.getState().G).not.toMatchObject({ victory: true });

    api.B();
    expect(store.getState().G).toMatchObject({ moved: '0' });

    store.dispatch(gameEvent('endTurn', null, '0'));

    api.B();
    expect(store.getState().G).toMatchObject({ moved: '1' });

    api.C();
    expect(store.getState().G).toMatchObject({ victory: true });
  });

  test('with undefined playerID - singleplayer mode', () => {
    const store = createStore(reducer, initialState);
    const api = createMoveDispatchers(game.moveNames, store);
    api.B();
    expect(store.getState().G).toMatchObject({ moved: '0' });
  });

  test('with undefined playerID - multiplayer mode', () => {
    const store = createStore(reducer, initialState);
    const api = createMoveDispatchers(
      game.moveNames,
      store,
      undefined,
      null,
      true
    );
    api.B();
    expect(store.getState().G).toMatchObject({ moved: undefined });
  });

  test('with null playerID - singleplayer mode', () => {
    const store = createStore(reducer, initialState);
    const api = createMoveDispatchers(game.moveNames, store, null);
    api.B();
    expect(store.getState().G).toMatchObject({ moved: '0' });
  });

  test('with null playerID - multiplayer mode', () => {
    const store = createStore(reducer, initialState);
    const api = createMoveDispatchers(game.moveNames, store, null, null, true);
    api.B();
    expect(store.getState().G).toMatchObject({ moved: null });
  });
});

describe('log handling', () => {
  let client = null;

  beforeEach(() => {
    client = Client({
      game: {
        moves: {
          A: () => ({}),
        },
      },
    });
  });

  test('regular', () => {
    client.moves.A();
    client.moves.A();

    expect(client.log).toEqual([
      {
        action: makeMove('A', [], '0'),
        _stateID: 0,
        phase: null,
        turn: 1,
      },
      {
        action: makeMove('A', [], '0'),
        _stateID: 1,
        phase: null,
        turn: 1,
      },
    ]);
  });

  test('update', () => {
    const state = ({ restore: true, _stateID: 0 } as unknown) as State;
    const deltalog = [
      {
        action: {},
        _stateID: 0,
      },
      {
        action: {},
        _stateID: 1,
      },
    ] as LogEntry[];
    const action = update(state, deltalog);

    client.store.dispatch(action);
    client.store.dispatch(action);

    expect(client.log).toEqual(deltalog);
  });

  test('sync', () => {
    const state = { restore: true };
    const log = ['0', '1'];
    const action = sync(({ state, log } as unknown) as SyncInfo);

    client.store.dispatch(action);
    client.store.dispatch(action);

    expect(client.log).toEqual(log);
  });

  test('update - log missing', () => {
    const action = update(undefined, undefined);
    client.store.dispatch(action);
    expect(client.log).toEqual([]);
  });

  test('sync - log missing', () => {
    const action = sync({} as SyncInfo);
    client.store.dispatch(action);
    expect(client.log).toEqual([]);
  });
});

describe('undo / redo', () => {
  const game = {
    moves: {
      A: (G, ctx, arg) => ({ arg }),
    },
  };

  test('basic', () => {
    const client = Client({ game });

    expect(client.getState().G).toEqual({});
    client.moves.A(42);
    expect(client.getState().G).toEqual({ arg: 42 });

    client.undo();
    expect(client.getState().G).toEqual({});

    client.redo();
    expect(client.getState().G).toEqual({ arg: 42 });
  });
});

describe('subscribe', () => {
  let client;
  let fn;
  beforeAll(() => {
    const game = {
      moves: {
        A: (G) => {
          G.moved = true;
        },
      },
    };
    client = Client({ game });
    fn = jest.fn();
    client.subscribe(fn);
  });

  test('called at the beginning', () => {
    expect(fn).toBeCalledWith(
      expect.objectContaining({
        G: {},
        ctx: expect.objectContaining({ turn: 1 }),
      })
    );
  });

  test('called after a move', () => {
    fn.mockClear();
    client.moves.A();
    expect(fn).toBeCalledWith(
      expect.objectContaining({
        G: { moved: true },
      })
    );
  });

  test('called after an event', () => {
    fn.mockClear();
    client.events.endTurn();
    expect(fn).toBeCalledWith(
      expect.objectContaining({
        ctx: expect.objectContaining({ turn: 2 }),
      })
    );
  });

  test('multiple subscriptions', () => {
    fn.mockClear();

    const fn2 = jest.fn();
    const unsubscribe = client.subscribe(fn2);

    // The subscriber that just subscribed is notified.
    expect(fn).not.toBeCalled();
    expect(fn2).toBeCalledWith(
      expect.objectContaining({
        G: { moved: true },
      })
    );

    fn.mockClear();
    fn2.mockClear();

    client.moves.A();

    // Both subscribers are notified.
    expect(fn).toBeCalledWith(
      expect.objectContaining({
        G: { moved: true },
      })
    );
    expect(fn2).toBeCalledWith(
      expect.objectContaining({
        G: { moved: true },
      })
    );

    unsubscribe();

    fn.mockClear();
    fn2.mockClear();

    // The subscriber the unsubscribed is not notified.
    client.moves.A();
    expect(fn).toBeCalledWith(
      expect.objectContaining({
        G: { moved: true },
      })
    );
    expect(fn2).not.toBeCalled();
  });

  test('transport notifies subscribers', () => {
    let transport: ReturnType<ReturnType<typeof SocketIO>>;
    const multiplayer = (opts: any) => {
      transport = SocketIO()(opts);
      return transport;
    };
    const client = Client({ game: {}, multiplayer });
    const fn = jest.fn();
    client.subscribe(fn);
    client.start();
    fn.mockClear();
    transport.callback();
    expect(fn).toHaveBeenCalled();
    client.stop();
  });

  describe('multiplayer', () => {
    test('subscribe before start', () => {
      const fn = jest.fn();
      const client = Client({
        game: {},
        multiplayer: Local(),
      });
      client.subscribe(fn);
      expect(fn).not.toBeCalled();
      client.start();
      expect(fn).toBeCalled();
      client.stop();
    });

    test('subscribe after start', () => {
      const fn = jest.fn();
      const client = Client({
        game: {},
        multiplayer: Local(),
      });
      client.start();
      client.subscribe(fn);
      expect(fn).toBeCalled();
      client.stop();
    });
  });
});

test('override game state', () => {
  const game = {
    moves: {
      A: (G) => {
        G.moved = true;
      },
    },
  };
  const client = Client({ game });
  client.moves.A();
  expect(client.getState().G).toEqual({ moved: true });
  client.overrideGameState({ G: { override: true }, ctx: {} });
  expect(client.getState().G).toEqual({ override: true });
  client.overrideGameState(null);
  expect(client.getState().G).toEqual({ moved: true });
});

describe('start / stop', () => {
  test('mount on custom element', () => {
    const el = document.createElement('div');
    const client = Client({ game: {}, debug: { target: el } });
    client.start();
    client.stop();
  });

  test('no error when mounting on null element', () => {
    const client = Client({ game: {}, debug: { target: null } }) as any;
    client.start();
    client.stop();
    expect(client.manager.debugPanel).toBe(null);
  });

  test('override debug implementation', () => {
    const client = Client({ game: {}, debug: { impl: Debug } });
    client.start();
    client.stop();
  });

  test('production mode', () => {
    process.env.NODE_ENV = 'production';
    const client = Client({ game: {} });
    client.start();
    client.stop();
  });

  test('try to stop without starting', () => {
    const client = Client({ game: {} });
    client.stop();
  });
});
