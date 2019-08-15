/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { createStore } from 'redux';
import { InitializeGame, CreateGameReducer } from '../core/reducer';
import { Client, createMoveDispatchers } from './client';
import { Local } from './transport/local';
import { SocketIO } from './transport/socketio';
import { update, sync, makeMove, gameEvent } from '../core/action-creators';
import Game from '../core/game';
import { RandomBot } from '../ai/bot';
import { error } from '../core/logger';

jest.mock('../core/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
}));

test('move api', () => {
  const client = Client({
    game: Game({
      moves: {
        A: (G, ctx, arg) => ({ arg }),
      },
    }),
  });

  expect(client.getState().G).toEqual({});
  client.moves.A(42);
  expect(client.getState().G).toEqual({ arg: 42 });
});

test('isActive', () => {
  const client = Client({
    game: Game({
      moves: {
        A: (G, ctx, arg) => ({ arg }),
      },

      flow: {
        endGameIf: G => G.arg == 42,
      },
    }),
  });

  expect(client.getState().G).toEqual({});
  expect(client.getState().isActive).toBe(true);
  client.moves.A(42);
  expect(client.getState().G).toEqual({ arg: 42 });
  expect(client.getState().isActive).toBe(false);
});

describe('step', () => {
  const client = Client({
    game: Game({
      setup: () => ({ moved: false }),

      moves: {
        clickCell(G) {
          return { moved: !G.moved };
        },
      },

      flow: {
        endGameIf(G) {
          if (G.moved) return true;
        },
      },
    }),

    ai: {
      bot: RandomBot,
      enumerate: () => [{ move: 'clickCell' }],
    },
  });

  test('advances game state', async () => {
    expect(client.getState().G).toEqual({ moved: false });
    await client.step();
    expect(client.getState().G).toEqual({ moved: true });
  });

  test('does not crash on empty action', () => {
    const client = Client({
      game: Game({}),

      ai: {
        bot: RandomBot,
        enumerate: () => [],
      },
    });
    client.step();
  });
});

describe('multiplayer', () => {
  describe('socket.io master', () => {
    let host = 'host';
    let port = '4321';
    let client;

    beforeAll(() => {
      client = Client({
        game: Game({ moves: { A: () => {} } }),
        multiplayer: { server: host + ':' + port },
      });
      client.connect();
    });

    afterAll(() => {
      jest.restoreAllMocks();
    });

    test('correct transport used', () => {
      expect(client.transport instanceof SocketIO).toBe(true);
    });

    test('server set when provided', () => {
      expect(client.transport.socket.io.engine.hostname).toEqual(host);
      expect(client.transport.socket.io.engine.port).toEqual(port);
    });

    test('onAction called', () => {
      jest.spyOn(client.transport, 'onAction');
      client.store.dispatch(sync({ G: {}, ctx: { phase: 'default' } }, []));
      client.moves.A();
      expect(client.transport.onAction).toHaveBeenCalled();
    });
  });

  describe('multiplayer: true', () => {
    let client;

    beforeAll(() => {
      client = Client({
        game: Game({}),
        multiplayer: true,
      });
      client.connect();
    });

    test('correct transport used', () => {
      expect(client.transport instanceof SocketIO).toBe(true);
    });
  });

  describe('local master', () => {
    let client0;
    let client1;
    let spec;

    beforeAll(() => {
      spec = {
        game: Game({ moves: { A: (G, ctx) => ({ A: ctx.playerID }) } }),
        multiplayer: { local: true },
      };

      client0 = Client({ ...spec, playerID: '0' });
      client1 = Client({ ...spec, playerID: '1' });

      client0.connect();
      client1.connect();
    });

    test('correct transport used', () => {
      expect(client0.transport instanceof Local).toBe(true);
      expect(client1.transport instanceof Local).toBe(true);
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
    });
  });

  describe('custom transport', () => {
    class CustomTransport {
      constructor() {
        this.callback = null;
      }

      subscribeGameMetadata(fn) {
        this.callback = fn;
      }
    }

    let client;

    beforeAll(() => {
      client = Client({
        game: Game({ moves: { A: () => {} } }),
        multiplayer: { transport: CustomTransport },
      });
    });

    test('correct transport used', () => {
      expect(client.transport).toBeInstanceOf(CustomTransport);
    });

    test('metadata callback', () => {
      const metadata = { m: true };
      client.transport.callback(metadata);
      expect(client.gameMetadata).toEqual(metadata);
    });
  });

  describe('invalid spec', () => {
    test('logs error', () => {
      Client({
        game: Game({ moves: { A: () => {} } }),
        multiplayer: { blah: true },
      });
      expect(error).toHaveBeenCalledWith('invalid multiplayer spec');
    });
  });
});

test('accepts enhancer for store', () => {
  let spyDispatcher;
  const spyEnhancer = vanillaCreateStore => (...args) => {
    const vanillaStore = vanillaCreateStore(...args);
    return {
      ...vanillaStore,
      dispatch: (spyDispatcher = jest.fn(vanillaStore.dispatch)),
    };
  };
  const client = Client({
    game: Game({
      moves: {
        A: (G, ctx, arg) => ({ arg }),
      },
    }),
    enhancer: spyEnhancer,
  });

  expect(spyDispatcher.mock.calls).toHaveLength(0);
  client.moves.A(42);
  expect(spyDispatcher.mock.calls).toHaveLength(1);
});

describe('event dispatchers', () => {
  test('default', () => {
    const game = Game({});
    const client = Client({ game });
    expect(Object.keys(client.events)).toEqual(['endTurn']);
    expect(client.getState().ctx.turn).toBe(0);
    client.events.endTurn();
    expect(client.getState().ctx.turn).toBe(1);
  });

  test('all events', () => {
    const game = Game({
      flow: {
        endPhase: true,
        endGame: true,
        setActionPlayers: true,
      },
    });
    const client = Client({ game });
    expect(Object.keys(client.events)).toEqual([
      'endTurn',
      'endPhase',
      'endGame',
      'setActionPlayers',
    ]);
    expect(client.getState().ctx.turn).toBe(0);
    client.events.endTurn();
    expect(client.getState().ctx.turn).toBe(1);
  });

  test('no events', () => {
    const game = Game({
      flow: {
        endPhase: false,
        endTurn: false,
      },
    });
    const client = Client({ game });
    expect(Object.keys(client.events)).toEqual([]);
  });
});

describe('move dispatchers', () => {
  const game = Game({
    moves: {
      A: G => G,
      B: (G, ctx) => ({ moved: ctx.playerID }),
      C: () => ({ victory: true }),
    },
    flow: {
      endGameIf: (G, ctx) => (G.victory ? ctx.currentPlayer : undefined),
    },
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
      game: Game({
        moves: {
          A: () => ({}),
        },
      }),
    });
  });

  test('regular', () => {
    client.moves.A();
    client.moves.A();

    expect(client.log).toEqual([
      {
        action: makeMove('A', [], '0'),
        _stateID: 0,
        phase: 'default',
        turn: 0,
      },
      {
        action: makeMove('A', [], '0'),
        _stateID: 1,
        phase: 'default',
        turn: 0,
      },
    ]);
  });

  test('update', () => {
    const state = { restore: true, _stateID: 0 };
    const deltalog = [
      {
        action: {},
        _stateID: 0,
      },
      {
        action: {},
        _stateID: 1,
      },
    ];
    const action = update(state, deltalog);

    client.store.dispatch(action);
    client.store.dispatch(action);

    expect(client.log).toEqual(deltalog);
  });

  test('sync', () => {
    const state = { restore: true };
    const log = ['0', '1'];
    const action = sync(state, log);

    client.store.dispatch(action);
    client.store.dispatch(action);

    expect(client.log).toEqual(log);
  });

  test('update - log missing', () => {
    const action = update();
    client.store.dispatch(action);
    expect(client.log).toEqual([]);
  });

  test('sync - log missing', () => {
    const action = sync();
    client.store.dispatch(action);
    expect(client.log).toEqual([]);
  });
});

describe('undo / redo', () => {
  let game;
  beforeEach(() => {
    game = Game({
      moves: {
        A: (G, ctx, arg) => ({ arg }),
      },
    });
  });

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
