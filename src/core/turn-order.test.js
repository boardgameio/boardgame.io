/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { FlowWithPhases } from './flow';
import { UpdateTurnOrderState, TurnOrder, Pass } from './turn-order';
import Game from './game';
import { makeMove, gameEvent } from './action-creators';
import { InitializeGame, CreateGameReducer } from './reducer';

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
    const flow = FlowWithPhases({
      startingPhase: 'A',
      phases: { A: {}, B: {} },
    });

    let state = { ctx: flow.ctx(2) };
    state = flow.init(state);
    expect(state.ctx.currentPlayer).toBe('0');
    expect(state.ctx.actionPlayers).toEqual(['0']);
    expect(state.ctx).not.toHaveUndefinedProperties();

    state = flow.processGameEvent(state, gameEvent('endTurn'));
    expect(state.ctx.currentPlayer).toBe('1');
    expect(state.ctx.actionPlayers).toEqual(['1']);
    state = flow.processGameEvent(state, gameEvent('endTurn'));
    expect(state.ctx.currentPlayer).toBe('0');
    expect(state.ctx.actionPlayers).toEqual(['0']);
    expect(state.ctx.phase).toBe('A');
  });

  test('ONCE', () => {
    const flow = FlowWithPhases({
      turn: { order: TurnOrder.ONCE },
      startingPhase: 'A',
      phases: { A: { next: 'B' }, B: {} },
    });

    let state = { ctx: flow.ctx(2) };
    state = flow.init(state);
    expect(state.ctx.currentPlayer).toBe('0');
    expect(state.ctx.actionPlayers).toEqual(['0']);
    expect(state.ctx).not.toHaveUndefinedProperties();

    state = flow.processGameEvent(state, gameEvent('endTurn'));
    expect(state.ctx.currentPlayer).toBe('1');
    expect(state.ctx.actionPlayers).toEqual(['1']);
    state = flow.processGameEvent(state, gameEvent('endTurn'));
    expect(state.ctx.currentPlayer).toBe('0');
    expect(state.ctx.actionPlayers).toEqual(['0']);
    expect(state.ctx.phase).toBe('B');
  });

  test('ANY', () => {
    const flow = FlowWithPhases({
      turn: { order: TurnOrder.ANY },
    });

    let state = { ctx: flow.ctx(2) };
    state = flow.init(state);
    expect(state.ctx.currentPlayer).toBe('0');
    expect(state.ctx.actionPlayers).toEqual(['0', '1']);
    expect(state.ctx).not.toHaveUndefinedProperties();

    state = flow.processGameEvent(state, gameEvent('endTurn'));
    expect(state.ctx.currentPlayer).toBe('0');
    expect(state.ctx.actionPlayers).toEqual(['0', '1']);
  });

  test('ANY_ONCE', () => {
    const flow = FlowWithPhases({
      turn: { order: TurnOrder.ANY_ONCE },
      startingPhase: 'A',
      phases: { A: {} },
    });

    let state = { ctx: flow.ctx(2) };
    state = flow.init(state);

    expect(state.ctx.phase).toBe('A');
    expect(state.ctx.currentPlayer).toBe('0');
    expect(state.ctx.actionPlayers).toEqual(['0', '1']);
    expect(state.ctx).not.toHaveUndefinedProperties();

    state = flow.processGameEvent(state, gameEvent('endTurn'));

    expect(state.ctx.phase).toBe('A');
    expect(state.ctx.currentPlayer).toBe('0');
    expect(state.ctx.actionPlayers).toEqual(['0', '1']);

    state = flow.processMove(state, makeMove('', null, '0').payload);

    expect(state.ctx.phase).toBe('A');
    expect(state.ctx.currentPlayer).toBe('0');
    expect(state.ctx.actionPlayers).toEqual(['1']);

    state = flow.processMove(state, makeMove('', null, '1').payload);

    expect(state.ctx.phase).toBe('default');
    expect(state.ctx.currentPlayer).toBe('0');
    expect(state.ctx.actionPlayers).toEqual(['0', '1']);
  });

  test('OTHERS', () => {
    const flow = FlowWithPhases({
      turn: { order: TurnOrder.OTHERS },
    });

    let state = { ctx: flow.ctx(3) };
    state = flow.init(state);
    expect(state.ctx.currentPlayer).toBe('0');
    expect(state.ctx.actionPlayers).toEqual(['1', '2']);
    expect(state.ctx).not.toHaveUndefinedProperties();

    state = flow.processGameEvent(state, gameEvent('endTurn'));
    expect(state.ctx.currentPlayer).toBe('0');
    expect(state.ctx.actionPlayers).toEqual(['1', '2']);
  });

  test('OTHERS_ONCE', () => {
    const flow = FlowWithPhases({
      turn: { order: TurnOrder.OTHERS_ONCE },
      startingPhase: 'A',
      phases: { A: {} },
    });

    let state = { ctx: flow.ctx(3) };
    state = flow.init(state);

    expect(state.ctx.phase).toBe('A');
    expect(state.ctx.currentPlayer).toBe('0');
    expect(state.ctx.actionPlayers).toEqual(['1', '2']);
    expect(state.ctx).not.toHaveUndefinedProperties();

    state = flow.processGameEvent(state, gameEvent('endTurn'));

    expect(state.ctx.phase).toBe('A');
    expect(state.ctx.currentPlayer).toBe('0');
    expect(state.ctx.actionPlayers).toEqual(['1', '2']);

    state = flow.processMove(state, makeMove('', null, '1').payload);

    expect(state.ctx.phase).toBe('A');
    expect(state.ctx.currentPlayer).toBe('0');
    expect(state.ctx.actionPlayers).toEqual(['2']);

    state = flow.processMove(state, makeMove('', null, '2').payload);

    expect(state.ctx.phase).toBe('default');
    expect(state.ctx.currentPlayer).toBe('0');
    expect(state.ctx.actionPlayers).toEqual(['1', '2']);
  });

  test('CUSTOM', () => {
    const flow = FlowWithPhases({
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
    const flow = FlowWithPhases({
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
    const flow = FlowWithPhases({
      startingPhase: 'A',
      phases: {
        A: {
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
    expect(state.ctx.actionPlayers).toEqual(['9']);
    expect(state.ctx).not.toHaveUndefinedProperties();

    state = flow.processGameEvent(state, gameEvent('endTurn'));
    expect(state.ctx.currentPlayer).toBe('3');
    expect(state.ctx.actionPlayers).toEqual(['3']);
  });
});

test('passing', () => {
  const flow = FlowWithPhases({
    startingPhase: 'A',
    phases: { A: { turn: { order: TurnOrder.SKIP } } },
  });
  const game = Game({
    flow,
    moves: { pass: Pass },
  });
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
  const flow = FlowWithPhases({
    startingPhase: 'A',
    phases: {
      A: { turn: { order: TurnOrder.ANY }, endGameIf: G => G.allPassed },
    },
  });
  const game = Game({
    flow,
    moves: { pass: Pass },
  });

  const reducer = CreateGameReducer({ game });
  let state = InitializeGame({ game, numPlayers: 3 });

  expect(state.ctx.actionPlayers).toEqual(['0', '1', '2']);

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

  let flow = FlowWithPhases({
    turn: { order: even },
    phases: { A: { next: 'B' }, B: { turn: { order: odd } } },
    startingPhase: 'A',
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
  const game = Game({});
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

describe('SetActionPlayers', () => {
  const flow = FlowWithPhases({});
  const state = { ctx: flow.ctx(2) };

  test('basic', () => {
    const newState = flow.processGameEvent(
      state,
      gameEvent('setActionPlayers', [['1']])
    );
    expect(newState.ctx.actionPlayers).toMatchObject(['1']);
  });

  test('all', () => {
    const newState = flow.processGameEvent(
      state,
      gameEvent('setActionPlayers', [{ all: true }])
    );
    expect(newState.ctx.actionPlayers).toMatchObject(['0', '1']);
  });

  test('once', () => {
    const game = Game({
      moves: {
        B: (G, ctx) => {
          ctx.events.setActionPlayers({ value: () => ['0', '1'], once: true });
          return G;
        },
        A: G => G,
      },
    });

    const reducer = CreateGameReducer({ game });

    let state = InitializeGame({ game });
    state = reducer(state, makeMove('B', null, '0'));
    expect(state.ctx.actionPlayers).toEqual(['0', '1']);
    state = reducer(state, makeMove('A', null, '0'));
    expect(state.ctx.actionPlayers).toEqual(['1']);
    state = reducer(state, makeMove('A', null, '1'));
    expect(state.ctx.actionPlayers).toEqual([]);
  });

  test('others', () => {
    const game = Game({
      moves: {
        B: (G, ctx) => {
          ctx.events.setActionPlayers({
            value: () => ['0', '1', '2'],
            once: true,
            others: true,
          });
          return G;
        },
        A: G => G,
      },
    });

    const reducer = CreateGameReducer({ game });

    let state = InitializeGame({ game, numPlayers: 3 });

    // on move B, control switches from player 0 to players 1 and 2
    state = reducer(state, makeMove('B', null, '0'));
    expect(state.ctx.actionPlayers).toEqual(['1', '2']);

    // player 1 makes move
    state = reducer(state, makeMove('A', null, '1'));
    expect(state.ctx.actionPlayers).toEqual(['2']);

    // player 2 makes move
    state = reducer(state, makeMove('A', null, '2'));
    expect(state.ctx.actionPlayers).toEqual([]);
  });

  test('militia', () => {
    const game = Game({
      startingPhase: 'A',

      phases: {
        A: {
          moves: {
            playMilitia: (G, ctx) => {
              ctx.events.endPhase({ next: 'B' });
              return G;
            },
          },
        },

        B: {
          turn: {
            order: TurnOrder.OTHERS_ONCE,
          },

          moves: {
            dropCards: G => {
              return G;
            },
          },
        },
      },
    });

    const reducer = CreateGameReducer({ game });

    let state = InitializeGame({ game, numPlayers: 4 });
    state = reducer(state, makeMove('A.playMilitia'));
    expect(state.ctx.actionPlayers).toMatchObject(['1', '2', '3']);

    state = reducer(state, makeMove('B.dropCards', undefined, '1'));
    expect(state.ctx.actionPlayers).toMatchObject(['2', '3']);
    state = reducer(state, makeMove('B.dropCards', undefined, '3'));
    expect(state.ctx.actionPlayers).toMatchObject(['2']);
    state = reducer(state, makeMove('B.dropCards', undefined, '2'));
    expect(state.ctx.actionPlayers).toMatchObject(['0']);
  });
});

describe('UpdateTurnOrderState', () => {
  const G = {};
  const ctx = {
    currentPlayer: '0',
    playOrder: ['0', '1', '2'],
    playOrderPos: 0,
    actionPlayers: ['0', '1', '2'],
  };
  const t1 = { order: TurnOrder.DEFAULT };
  const t2 = { order: TurnOrder.ANY };

  test('without next player', () => {
    const { ctx: t } = UpdateTurnOrderState(G, ctx, t1);
    expect(t).toMatchObject({ currentPlayer: '1' });
  });

  test('with next player', () => {
    const { ctx: t } = UpdateTurnOrderState(G, ctx, t1, {
      next: '2',
    });
    expect(t).toMatchObject({ currentPlayer: '2' });
  });

  test('with actionPlayers', () => {
    const { ctx: t } = UpdateTurnOrderState(G, ctx, t2);
    expect(t).toMatchObject({
      currentPlayer: '0',
      actionPlayers: ['0', '1', '2'],
    });
  });
});
