/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { Flow } from './flow';
import { UpdateTurnOrderState, TurnOrder, Pass } from './turn-order';
import { makeMove, gameEvent } from './action-creators';
import { CreateGameReducer } from './reducer';
import { InitializeGame } from './initialize';
import { error } from '../core/logger';

jest.mock('../core/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
}));

describe('turn orders', () => {
  // Defines a matcher for testing that ctx has no undefined properties.
  // Identifies which property is undefined.
  expect.extend({
    toHaveUndefinedProperties(ctx) {
      const undefinedEntry = Object.entries(ctx).find(entry => {
        const [, value] = entry;
        return value === undefined;
      });
      if (undefinedEntry === undefined) {
        return {
          message: () => `expected some properties of ctx to be undefined`,
          pass: false,
        };
      } else {
        const [k] = undefinedEntry;
        return {
          message: () => `expected ctx.${k} to be defined`,
          pass: true,
        };
      }
    },
  });

  test('DEFAULT', () => {
    const flow = Flow({
      phases: { A: { start: true }, B: {} },
    });

    let state = { ctx: flow.ctx(2) };
    state = flow.init(state);
    expect(state.ctx.currentPlayer).toBe('0');
    expect(state.ctx).not.toHaveUndefinedProperties();

    state = flow.processGameEvent(state, gameEvent('endTurn'));
    expect(state.ctx.currentPlayer).toBe('1');
    state = flow.processGameEvent(state, gameEvent('endTurn'));
    expect(state.ctx.currentPlayer).toBe('0');
    expect(state.ctx.phase).toBe('A');
  });

  test('ONCE', () => {
    const flow = Flow({
      turn: { order: TurnOrder.ONCE },
      phases: { A: { start: true, next: 'B' }, B: {} },
    });

    let state = { ctx: flow.ctx(2) };
    state = flow.init(state);
    expect(state.ctx.currentPlayer).toBe('0');
    expect(state.ctx).not.toHaveUndefinedProperties();

    state = flow.processGameEvent(state, gameEvent('endTurn'));
    expect(state.ctx.currentPlayer).toBe('1');
    state = flow.processGameEvent(state, gameEvent('endTurn'));
    expect(state.ctx.currentPlayer).toBe('0');
    expect(state.ctx.phase).toBe('B');
  });

  test('ANY', () => {
    const flow = Flow({
      turn: { order: TurnOrder.ANY },
    });

    let state = { ctx: flow.ctx(2) };
    state = flow.init(state);
    expect(state.ctx.currentPlayer).toBe('0');
    expect(state.ctx.stage).toEqual({ '0': '', '1': '' });
    expect(state.ctx).not.toHaveUndefinedProperties();

    state = flow.processGameEvent(state, gameEvent('endTurn'));
    expect(state.ctx.currentPlayer).toBe('0');
    expect(state.ctx.stage).toEqual({ '0': '', '1': '' });
  });

  test('ANY_ONCE', () => {
    const flow = Flow({
      phases: { A: { start: true, turn: { order: TurnOrder.ANY_ONCE } } },
    });

    let state = { ctx: flow.ctx(2) };
    state = flow.init(state);

    expect(state.ctx.phase).toBe('A');
    expect(state.ctx.currentPlayer).toBe('0');
    expect(Object.keys(state.ctx.stage)).toEqual(['0', '1']);
    expect(state.ctx).not.toHaveUndefinedProperties();

    state = flow.processGameEvent(state, gameEvent('endTurn'));

    expect(state.ctx.phase).toBe('A');
    expect(state.ctx.currentPlayer).toBe('0');
    expect(Object.keys(state.ctx.stage)).toEqual(['0', '1']);

    state = flow.processMove(state, makeMove('', null, '0').payload);

    expect(state.ctx.phase).toBe('A');
    expect(state.ctx.currentPlayer).toBe('0');
    expect(Object.keys(state.ctx.stage)).toEqual(['1']);

    state = flow.processMove(state, makeMove('', null, '1').payload);

    expect(state.ctx.phase).toBe('');
    expect(state.ctx.currentPlayer).toBe('0');
    expect(state.ctx.stage).toBe(null);
  });

  test('OTHERS', () => {
    const flow = Flow({
      turn: { order: TurnOrder.OTHERS },
    });

    let state = { ctx: flow.ctx(3) };
    state = flow.init(state);
    expect(state.ctx.currentPlayer).toBe('0');
    expect(Object.keys(state.ctx.stage)).toEqual(['1', '2']);
    expect(state.ctx).not.toHaveUndefinedProperties();

    state = flow.processGameEvent(state, gameEvent('endTurn'));
    expect(state.ctx.currentPlayer).toBe('0');
    expect(Object.keys(state.ctx.stage)).toEqual(['1', '2']);
  });

  test('OTHERS_ONCE', () => {
    const flow = Flow({
      turn: { order: TurnOrder.OTHERS_ONCE },
      phases: { A: { start: true } },
    });

    let state = { ctx: flow.ctx(3) };
    state = flow.init(state);

    expect(state.ctx.phase).toBe('A');
    expect(state.ctx.currentPlayer).toBe('0');
    expect(Object.keys(state.ctx.stage)).toEqual(['1', '2']);
    expect(state.ctx).not.toHaveUndefinedProperties();

    state = flow.processGameEvent(state, gameEvent('endTurn'));

    expect(state.ctx.phase).toBe('A');
    expect(state.ctx.currentPlayer).toBe('0');
    expect(Object.keys(state.ctx.stage)).toEqual(['1', '2']);

    state = flow.processMove(state, makeMove('', null, '1').payload);

    expect(state.ctx.phase).toBe('A');
    expect(state.ctx.currentPlayer).toBe('0');
    expect(Object.keys(state.ctx.stage)).toEqual(['2']);

    state = flow.processMove(state, makeMove('', null, '2').payload);

    expect(state.ctx.phase).toBe('');
    expect(state.ctx.currentPlayer).toBe('0');
    expect(Object.keys(state.ctx.stage)).toEqual(['1', '2']);
  });

  test('CUSTOM', () => {
    const flow = Flow({
      turn: { order: TurnOrder.CUSTOM(['1', '0']) },
    });

    let state = { ctx: flow.ctx(2) };
    state = flow.init(state);

    expect(state.ctx.currentPlayer).toBe('1');
    expect(state.ctx).not.toHaveUndefinedProperties();

    state = flow.processGameEvent(state, gameEvent('endTurn'));
    expect(state.ctx.currentPlayer).toBe('0');
  });

  test('CUSTOM_FROM', () => {
    const flow = Flow({
      turn: { order: TurnOrder.CUSTOM_FROM('order') },
    });

    let state = { G: { order: ['2', '1', '0'] }, ctx: flow.ctx(3) };
    state = flow.init(state);

    expect(state.ctx.currentPlayer).toBe('2');
    expect(state.ctx).not.toHaveUndefinedProperties();

    state = flow.processGameEvent(state, gameEvent('endTurn'));
    expect(state.ctx.currentPlayer).toBe('1');
    state = flow.processGameEvent(state, gameEvent('endTurn'));
    expect(state.ctx.currentPlayer).toBe('0');
  });

  test('manual', () => {
    const flow = Flow({
      phases: {
        A: {
          start: true,
          turn: {
            order: {
              first: () => 9,
              next: () => 3,
            },
          },
        },
      },
    });

    let state = { ctx: flow.ctx(10) };
    state = flow.init(state);
    expect(state.ctx.currentPlayer).toBe('9');
    expect(state.ctx).not.toHaveUndefinedProperties();

    state = flow.processGameEvent(state, gameEvent('endTurn'));
    expect(state.ctx.currentPlayer).toBe('3');
  });
});

test('passing', () => {
  const game = {
    moves: { pass: Pass },
    phases: { A: { start: true, turn: { order: TurnOrder.SKIP } } },
  };
  const reducer = CreateGameReducer({ game });
  let state = InitializeGame({ game, numPlayers: 3 });

  expect(state.ctx.currentPlayer).toBe('0');
  state = reducer(state, makeMove('pass', null, '0'));
  state = reducer(state, gameEvent('endTurn'));
  expect(state.G.allPassed).toBe(undefined);
  expect(state.G.passOrder).toEqual(['0']);

  expect(state.ctx.currentPlayer).toBe('1');
  state = reducer(state, gameEvent('endTurn'));
  expect(state.G.allPassed).toBe(undefined);
  expect(state.G.passOrder).toEqual(['0']);

  expect(state.ctx.currentPlayer).toBe('2');
  state = reducer(state, gameEvent('endTurn'));
  expect(state.G.allPassed).toBe(undefined);

  expect(state.ctx.currentPlayer).toBe('1');
  state = reducer(state, makeMove('pass', null, '1'));
  state = reducer(state, gameEvent('endTurn'));
  expect(state.G.allPassed).toBe(undefined);
  expect(state.G.passOrder).toEqual(['0', '1']);

  expect(state.ctx.currentPlayer).toBe('2');
  state = reducer(state, gameEvent('endTurn'));
  expect(state.G.allPassed).toBe(undefined);

  expect(state.ctx.currentPlayer).toBe('2');
  state = reducer(state, makeMove('pass', null, '2'));
  expect(state.G.allPassed).toBe(true);
  expect(state.ctx.currentPlayer).toBe('2');
  state = reducer(state, gameEvent('endTurn'));
  expect(state.G.allPassed).toBe(true);
  expect(state.G.passOrder).toEqual(['0', '1', '2']);
});

test('end game after everyone passes', () => {
  const game = {
    endIf: G => G.allPassed,
    turn: { order: TurnOrder.ANY },
    moves: { pass: Pass },
  };

  const reducer = CreateGameReducer({ game });
  let state = InitializeGame({ game, numPlayers: 3 });

  expect(Object.keys(state.ctx.stage)).toEqual(['0', '1', '2']);

  // Passes can be make in any order with TurnOrder.ANY.

  state = reducer(state, makeMove('pass', null, '1'));
  expect(state.ctx.gameover).toBe(undefined);
  state = reducer(state, makeMove('pass', null, '0'));
  expect(state.ctx.gameover).toBe(undefined);
  state = reducer(state, makeMove('pass', null, '2'));
  expect(state.ctx.gameover).toBe(true);
});

test('override', () => {
  const even = {
    first: () => '0',
    next: (G, ctx) => ((+ctx.currentPlayer + 2) % ctx.numPlayers) + '',
  };

  const odd = {
    first: () => '1',
    next: (G, ctx) => ((+ctx.currentPlayer + 2) % ctx.numPlayers) + '',
  };

  let flow = Flow({
    turn: { order: even },
    phases: { A: { start: true, next: 'B' }, B: { turn: { order: odd } } },
  });

  let state = { ctx: flow.ctx(10) };
  state = flow.init(state);

  expect(state.ctx.currentPlayer).toBe('0');
  state = flow.processGameEvent(state, gameEvent('endTurn'));
  expect(state.ctx.currentPlayer).toBe('2');
  state = flow.processGameEvent(state, gameEvent('endTurn'));
  expect(state.ctx.currentPlayer).toBe('4');

  state = flow.processGameEvent(state, gameEvent('endPhase'));

  expect(state.ctx.currentPlayer).toBe('1');
  state = flow.processGameEvent(state, gameEvent('endTurn'));
  expect(state.ctx.currentPlayer).toBe('3');
  state = flow.processGameEvent(state, gameEvent('endTurn'));
  expect(state.ctx.currentPlayer).toBe('5');
});

test('playOrder', () => {
  const game = {};
  const reducer = CreateGameReducer({ game });

  let state = InitializeGame({ game, numPlayers: 3 });

  state.ctx = {
    ...state.ctx,
    currentPlayer: '2',
    playOrder: [2, 0, 1],
  };

  state = reducer(state, gameEvent('endTurn'));
  expect(state.ctx.currentPlayer).toBe('0');
  state = reducer(state, gameEvent('endTurn'));
  expect(state.ctx.currentPlayer).toBe('1');
  state = reducer(state, gameEvent('endTurn'));
  expect(state.ctx.currentPlayer).toBe('2');
});

describe('SetStage', () => {
  const flow = Flow({});
  const state = { ctx: flow.ctx(2) };

  test('basic', () => {
    const newState = flow.processGameEvent(
      state,
      gameEvent('setStage', [{ value: { '1': '' } }])
    );
    expect(newState.ctx.stage).toMatchObject({ '1': '' });
  });

  test('all', () => {
    const newState = flow.processGameEvent(
      state,
      gameEvent('setStage', [{ all: '' }])
    );
    expect(newState.ctx.stage).toMatchObject({ '0': '', '1': '' });
  });

  test('once', () => {
    const game = {
      moves: {
        B: (G, ctx) => {
          ctx.events.setStage({ value: { '0': '', '1': '' }, once: true });
          return G;
        },
        A: G => G,
      },
    };

    const reducer = CreateGameReducer({ game });

    let state = InitializeGame({ game });
    state = reducer(state, makeMove('B', null, '0'));
    expect(Object.keys(state.ctx.stage)).toEqual(['0', '1']);
    state = reducer(state, makeMove('A', null, '0'));
    expect(Object.keys(state.ctx.stage)).toEqual(['1']);
    state = reducer(state, makeMove('A', null, '1'));
    expect(state.ctx.stage).toBeNull();
  });

  test('others', () => {
    const game = {
      moves: {
        B: (G, ctx) => {
          ctx.events.setStage({
            once: true,
            others: '',
          });
          return G;
        },
        A: G => G,
      },
    };

    const reducer = CreateGameReducer({ game });

    let state = InitializeGame({ game, numPlayers: 3 });

    // on move B, control switches from player 0 to players 1 and 2
    state = reducer(state, makeMove('B', null, '0'));
    expect(Object.keys(state.ctx.stage)).toEqual(['1', '2']);

    // player 1 makes move
    state = reducer(state, makeMove('A', null, '1'));
    expect(Object.keys(state.ctx.stage)).toEqual(['2']);

    // player 2 makes move
    state = reducer(state, makeMove('A', null, '2'));
    expect(state.ctx.stage).toBeNull();
  });

  describe('militia', () => {
    let state;
    let reducer;
    beforeAll(() => {
      const game = {
        turn: {
          onBegin: (G, ctx) => {
            ctx.events.setStage({ currentPlayer: 'A' });
          },

          stages: {
            A: {
              moves: {
                militia: (G, ctx) => {
                  ctx.events.setStage({
                    currentPlayer: '',
                    others: 'B',
                    once: true,
                  });
                },
              },
            },

            B: {
              moves: {
                discard: G => G,
              },
            },
          },
        },
      };

      reducer = CreateGameReducer({ game });
      state = InitializeGame({ game, numPlayers: 3 });
    });

    beforeEach(() => {
      error.mockClear();
    });

    test('sanity', () => {
      expect(state.ctx.stage).toEqual({ '0': 'A' });
    });

    test('player 1 cannot play the militia card', () => {
      state = reducer(state, makeMove('militia', undefined, '1'));
      expect(error).toHaveBeenCalledWith('disallowed move: militia');
    });

    test('player 2 cannot play the militia card', () => {
      state = reducer(state, makeMove('militia', undefined, '2'));
      expect(error).toHaveBeenCalledWith('disallowed move: militia');
    });

    test('player 0 cannot discard', () => {
      state = reducer(state, makeMove('discard', undefined, '0'));
      expect(error).toHaveBeenCalledWith('disallowed move: discard');
    });

    test('player 1 cannot discard', () => {
      state = reducer(state, makeMove('discard', undefined, '1'));
      expect(error).toHaveBeenCalledWith('disallowed move: discard');
    });

    test('player 2 cannot discard', () => {
      state = reducer(state, makeMove('discard', undefined, '2'));
      expect(error).toHaveBeenCalledWith('disallowed move: discard');
    });

    test('player 0 plays militia', () => {
      state = reducer(state, makeMove('militia', undefined, '0'));
      expect(state.ctx.stage).toEqual({
        '0': '',
        '1': 'B',
        '2': 'B',
      });
    });

    test('player 0 still cannot discard', () => {
      state = reducer(state, makeMove('discard', undefined, '0'));
    });

    test('everyone else discards', () => {
      state = reducer(state, makeMove('discard', undefined, '1'));
      expect(state.ctx.stage).toEqual({ '0': '', '2': 'B' });
      state = reducer(state, makeMove('discard', undefined, '2'));
      expect(state.ctx.stage).toEqual({ '0': '' });
    });
  });
});

describe('UpdateTurnOrderState', () => {
  const G = {};
  const ctx = {
    currentPlayer: '0',
    playOrder: ['0', '1', '2'],
    playOrderPos: 0,
  };
  const turn = { order: TurnOrder.DEFAULT };

  test('without next player', () => {
    const { ctx: t } = UpdateTurnOrderState(G, ctx, turn);
    expect(t).toMatchObject({ currentPlayer: '1' });
  });

  test('with next player', () => {
    const { ctx: t } = UpdateTurnOrderState(G, ctx, turn, {
      next: '2',
    });
    expect(t).toMatchObject({ currentPlayer: '2' });
  });
});
