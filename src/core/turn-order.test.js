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
import { CreateGameReducer } from './reducer';

describe('turnOrder', () => {
  test('default', () => {
    const flow = FlowWithPhases({
      phases: [{ name: 'A' }, { name: 'B' }],
    });

    let state = { ctx: flow.ctx(2) };
    state = flow.init(state);
    expect(state.ctx.currentPlayer).toBe('0');
    expect(state.ctx.actionPlayers).toEqual(['0']);
    state = flow.processGameEvent(state, gameEvent('endTurn'));
    expect(state.ctx.currentPlayer).toBe('1');
    expect(state.ctx.actionPlayers).toEqual(['1']);
    state = flow.processGameEvent(state, gameEvent('endTurn'));
    expect(state.ctx.currentPlayer).toBe('0');
    expect(state.ctx.actionPlayers).toEqual(['0']);
    expect(state.ctx.phase).toBe('A');
  });

  test('once', () => {
    const flow = FlowWithPhases({
      turnOrder: TurnOrder.ONCE,
      phases: [{ name: 'A' }, { name: 'B' }],
    });

    let state = { ctx: flow.ctx(2) };
    state = flow.init(state);
    expect(state.ctx.currentPlayer).toBe('0');
    expect(state.ctx.actionPlayers).toEqual(['0']);
    state = flow.processGameEvent(state, gameEvent('endTurn'));
    expect(state.ctx.currentPlayer).toBe('1');
    expect(state.ctx.actionPlayers).toEqual(['1']);
    state = flow.processGameEvent(state, gameEvent('endTurn'));
    expect(state.ctx.currentPlayer).toBe('0');
    expect(state.ctx.actionPlayers).toEqual(['0']);
    expect(state.ctx.phase).toBe('B');
  });

  test('custom', () => {
    const flow = FlowWithPhases({
      phases: [{ name: 'A', turnOrder: { first: () => 9, next: () => 3 } }],
    });

    let state = { ctx: flow.ctx(10) };
    state = flow.init(state);
    expect(state.ctx.currentPlayer).toBe('9');
    expect(state.ctx.actionPlayers).toEqual(['9']);
    state = flow.processGameEvent(state, gameEvent('endTurn'));
    expect(state.ctx.currentPlayer).toBe('3');
    expect(state.ctx.actionPlayers).toEqual(['3']);
  });
});

test('passing', () => {
  const flow = FlowWithPhases({
    phases: [{ name: 'A', turnOrder: TurnOrder.SKIP }],
  });
  const game = Game({
    flow,
    moves: { pass: Pass },
  });
  const reducer = CreateGameReducer({ game, numPlayers: 3 });
  let state = reducer(undefined, { type: 'init' });

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
    phases: [
      { name: 'A', turnOrder: TurnOrder.ANY, endGameIf: G => G.allPassed },
    ],
  });
  const game = Game({
    flow,
    moves: { pass: Pass },
  });
  const reducer = CreateGameReducer({ game, numPlayers: 3 });

  let state = reducer(undefined, { type: 'init' });
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
    next: (G, ctx) => (+ctx.currentPlayer + 2) % ctx.numPlayers + '',
  };

  const odd = {
    first: () => '1',
    next: (G, ctx) => (+ctx.currentPlayer + 2) % ctx.numPlayers + '',
  };

  let flow = FlowWithPhases({
    turnOrder: even,
    phases: [{ name: 'A' }, { name: 'B', turnOrder: odd }],
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
  const reducer = CreateGameReducer({ game, numPlayers: 3 });

  let state = reducer(undefined, { type: 'init' });

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
  const flow = FlowWithPhases({ setActionPlayers: true });
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
      flow: {
        setActionPlayers: true,
      },

      moves: {
        B: (G, ctx) => {
          ctx.events.setActionPlayers({ value: ['0', '1'], once: true });
          return G;
        },
        A: G => G,
      },
    });

    const reducer = CreateGameReducer({ game, numPlayers: 2 });

    let state = reducer(undefined, { type: 'init' });
    state = reducer(state, makeMove('B', null, '0'));
    expect(state.ctx.actionPlayers).toEqual(['0', '1']);
    state = reducer(state, makeMove('A', null, '0'));
    expect(state.ctx.actionPlayers).toEqual(['1']);
    state = reducer(state, makeMove('A', null, '1'));
    expect(state.ctx.actionPlayers).toEqual([]);
  });

  test('allOthers', () => {
    const game = Game({
      flow: {
        setActionPlayers: true,
      },

      moves: {
        B: (G, ctx) => {
          ctx.events.setActionPlayers({
            value: ['0', '1', '2'],
            allOthers: true,
          });
          return G;
        },
        A: G => G,
      },
    });

    const reducer = CreateGameReducer({ game, numPlayers: 3 });

    let state = reducer(undefined, { type: 'init' });

    // on move B, control switches from player 0 to players 1 and 2
    state = reducer(state, makeMove('B', null, '0'));
    expect(state.ctx.actionPlayers).toEqual(['1', '2']);

    // player 1 makes move
    state = reducer(state, makeMove('A', null, '1'));
    expect(state.ctx.actionPlayers).toEqual(['2']);

    // player 1 makes move - after that, control should return to player 0
    state = reducer(state, makeMove('A', null, '2'));
    expect(state.ctx.actionPlayers).toEqual(['0']);
  });

  test('militia', () => {
    const game = Game({
      flow: { setActionPlayers: true },

      moves: {
        playMilitia: (G, ctx) => {
          // change which players need to act
          ctx.events.setActionPlayers([1, 2, 3]);
          return { ...G, playedCard: 'Militia' };
        },
        dropCards: (G, ctx) => {
          if (G.playedCard === 'Militia') {
            let actedOnMilitia = G.actedOnMilitia || [];
            actedOnMilitia.push(ctx.playerID);

            // this player did drop and must not take another action.
            var newActionPlayers = [...ctx.actionPlayers].filter(
              pn => pn !== ctx.playerID
            );
            ctx.events.setActionPlayers(newActionPlayers);

            let playedCard = G.playedCard;
            if (actedOnMilitia.length === 3) {
              ctx.events.setActionPlayers([0]);
              actedOnMilitia = undefined;
              playedCard = undefined;
            }
            return { ...G, actedOnMilitia, playedCard };
          } else {
            return G;
          }
        },
      },
    });

    const reducer = CreateGameReducer({ game, numPlayers: 4 });

    let state = reducer(undefined, { type: 'init' });
    state = reducer(state, makeMove('playMilitia'));
    expect(state.ctx.actionPlayers).toMatchObject([1, 2, 3]);

    state = reducer(state, makeMove('dropCards', undefined, 1));
    expect(state.ctx.actionPlayers).toMatchObject([2, 3]);
    state = reducer(state, makeMove('dropCards', undefined, 3));
    expect(state.ctx.actionPlayers).toMatchObject([2]);
    state = reducer(state, makeMove('dropCards', undefined, 2));
    expect(state.ctx.actionPlayers).toMatchObject([0]);
    expect(state.G).toMatchObject({});
  });
});

describe('UpdateTurnOrderState', () => {
  const G = {};
  const ctx = {
    currentPlayer: '0',
    playOrder: ['0', '1', '2'],
    playOrderPos: 0,
    actionPlayers: ['0'],
  };

  test('without nextPlayer', () => {
    const { ctx: t } = UpdateTurnOrderState(G, ctx, TurnOrder.DEFAULT);
    expect(t).toMatchObject({ currentPlayer: '1' });
  });

  test('with nextPlayer', () => {
    const { ctx: t } = UpdateTurnOrderState(G, ctx, TurnOrder.DEFAULT, '2');
    expect(t).toMatchObject({ currentPlayer: '2' });
  });

  test('with actionPlayers', () => {
    const { ctx: t } = UpdateTurnOrderState(G, ctx, TurnOrder.ANY);
    expect(t).toMatchObject({
      currentPlayer: '1',
      actionPlayers: ['0', '1', '2'],
    });
  });
});
