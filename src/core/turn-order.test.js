/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { FlowWithPhases } from './flow';
import { TurnOrder, Pass } from './turn-order';
import Game from './game';
import { makeMove, gameEvent } from './action-creators';
import { createGameReducer } from './reducer';

test('turnOrder', () => {
  let flow = FlowWithPhases({
    phases: [{ name: 'A' }],
  });

  let state = { ctx: flow.ctx(10) };
  state = flow.init(state);
  expect(state.ctx.currentPlayer).toBe('0');
  state = flow.processGameEvent(state, { type: 'endTurn' });
  expect(state.ctx.currentPlayer).toBe('1');

  flow = FlowWithPhases({
    phases: [{ name: 'A', turnOrder: TurnOrder.ANY }],
  });

  state = { ctx: flow.ctx(10) };
  state = flow.init(state);
  expect(state.ctx.currentPlayer).toBe('any');
  state = flow.processGameEvent(state, { type: 'endTurn' });
  expect(state.ctx.currentPlayer).toBe('any');

  flow = FlowWithPhases({
    phases: [{ name: 'A', turnOrder: { first: () => 9, next: () => 3 } }],
  });

  state = { ctx: flow.ctx(10) };
  state = flow.init(state);
  expect(state.ctx.currentPlayer).toBe('9');
  state = flow.processGameEvent(state, { type: 'endTurn' });
  expect(state.ctx.currentPlayer).toBe('3');
});

test('passing', () => {
  const flow = FlowWithPhases({
    phases: [{ name: 'A', turnOrder: TurnOrder.SKIP }],
  });
  const game = Game({
    flow,
    moves: { pass: Pass },
  });
  const reducer = createGameReducer({ game, numPlayers: 3 });
  let state = reducer(undefined, { type: 'init' });

  expect(state.ctx.currentPlayer).toBe('0');
  state = reducer(state, makeMove('pass'));
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
  state = reducer(state, makeMove('pass'));
  state = reducer(state, gameEvent('endTurn'));
  expect(state.G.allPassed).toBe(undefined);
  expect(state.G.passOrder).toEqual(['0', '1']);

  expect(state.ctx.currentPlayer).toBe('2');
  state = reducer(state, gameEvent('endTurn'));
  expect(state.G.allPassed).toBe(undefined);

  expect(state.ctx.currentPlayer).toBe('2');
  state = reducer(state, makeMove('pass'));
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
  const reducer = createGameReducer({ game, numPlayers: 3 });

  let state = reducer(undefined, { type: 'init' });
  expect(state.ctx.currentPlayer).toBe('any');

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
  state = flow.processGameEvent(state, { type: 'endTurn' });
  expect(state.ctx.currentPlayer).toBe('2');
  state = flow.processGameEvent(state, { type: 'endTurn' });
  expect(state.ctx.currentPlayer).toBe('4');

  state = flow.processGameEvent(state, { type: 'endPhase' });

  expect(state.ctx.currentPlayer).toBe('1');
  state = flow.processGameEvent(state, { type: 'endTurn' });
  expect(state.ctx.currentPlayer).toBe('3');
  state = flow.processGameEvent(state, { type: 'endTurn' });
  expect(state.ctx.currentPlayer).toBe('5');
});

test('custom order', () => {
  const game = Game({});
  const reducer = createGameReducer({ game, numPlayers: 3 });

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
