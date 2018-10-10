/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { createStore } from 'redux';
import { CreateGameReducer } from '../core/reducer';
import {
  Client,
  GetOpts,
  createEventDispatchers,
  createMoveDispatchers,
} from './client';
import { Local } from './transport/local';
import { SocketIO } from './transport/socketio';
import { update, sync, makeMove, gameEvent } from '../core/action-creators';
import Game from '../core/game';
import { RandomBot } from '../ai/bot';

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

  test('advances game state', () => {
    expect(client.getState().G).toEqual({ moved: false });
    client.step();
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
      client = Client(
        GetOpts({
          game: Game({ moves: { A: () => {} } }),
          multiplayer: { server: host + ':' + port },
        })
      );
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
      client.moves.A();
      expect(client.transport.onAction).toHaveBeenCalled();
    });
  });

  describe('local master', () => {
    let client;

    beforeAll(() => {
      client = Client(
        GetOpts({
          game: Game({ moves: { A: () => {} } }),
          multiplayer: { local: true },
        })
      );
      client.connect();
    });

    test('correct transport used', () => {
      expect(client.transport instanceof Local).toBe(true);
    });
  });

  describe('custom transport', () => {
    const transport = { custom: true };
    let client;

    beforeAll(() => {
      client = Client(
        GetOpts({
          game: Game({ moves: { A: () => {} } }),
          multiplayer: { transport },
        })
      );
    });

    test('correct transport used', () => {
      expect(client.transport).toBe(transport);
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

test('event dispatchers', () => {
  {
    const game = Game({});
    const reducer = CreateGameReducer({ game, numPlayers: 2 });
    const store = createStore(reducer);
    const api = createEventDispatchers(game.flow.eventNames, store);
    expect(Object.getOwnPropertyNames(api)).toEqual(['endTurn']);
    expect(store.getState().ctx.turn).toBe(0);
    api.endTurn();
    expect(store.getState().ctx.turn).toBe(1);
  }

  {
    const game = Game({
      flow: {
        endPhase: true,
        endGame: true,
        setActionPlayers: true,
      },
    });
    const reducer = CreateGameReducer({ game, numPlayers: 2 });
    const store = createStore(reducer);
    const api = createEventDispatchers(game.flow.eventNames, store);
    expect(Object.getOwnPropertyNames(api)).toEqual([
      'endTurn',
      'endPhase',
      'endGame',
      'setActionPlayers',
    ]);
    expect(store.getState().ctx.turn).toBe(0);
    api.endTurn();
    expect(store.getState().ctx.turn).toBe(1);
  }

  {
    const game = Game({
      flow: {
        endPhase: false,
        endTurn: false,
      },

      phases: [{ name: 'default' }],
    });
    const reducer = CreateGameReducer({ game, numPlayers: 2 });
    const store = createStore(reducer);
    const api = createEventDispatchers(game.flow.eventNames, store);
    expect(Object.getOwnPropertyNames(api)).toEqual([]);
  }

  {
    const game = Game({
      flow: {
        endPhase: true,
        undoableMoves: ['A'],
      },
    });
    const reducer = CreateGameReducer({ game, numPlayers: 2 });
    const store = createStore(reducer);
    const api = createEventDispatchers(game.flow.eventNames, store);
    expect(Object.getOwnPropertyNames(api)).toEqual(['endTurn', 'endPhase']);
    expect(store.getState().ctx.turn).toBe(0);
    api.endTurn();
    expect(store.getState().ctx.turn).toBe(1);
  }
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

  test('basic', () => {
    const store = createStore(reducer);
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
    const store = createStore(reducer);
    const api = createMoveDispatchers(game.moveNames, store);
    api.B();
    expect(store.getState().G).toMatchObject({ moved: '0' });
  });

  test('with undefined playerID - multiplayer mode', () => {
    const store = createStore(reducer);
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
    const store = createStore(reducer);
    const api = createMoveDispatchers(game.moveNames, store, null);
    api.B();
    expect(store.getState().G).toMatchObject({ moved: '0' });
  });

  test('with null playerID - multiplayer mode', () => {
    const store = createStore(reducer);
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
      { action: makeMove('A', [], '0') },
      { action: makeMove('A', [], '0') },
    ]);
  });

  test('update', () => {
    const state = { restore: true };
    const deltalog = ['0', '1'];
    const action = update(state, deltalog);

    client.store.dispatch(action);
    client.store.dispatch(action);

    expect(client.log).toEqual([...deltalog, ...deltalog]);
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
