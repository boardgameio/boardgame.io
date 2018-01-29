/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { FlowWithPhases } from './flow';
import { TurnOrder, pass } from './turn-order';
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
    phases: [{ name: 'A', turnOrder: { first: () => '10', next: () => '3' } }],
  });

  state = { ctx: flow.ctx(10) };
  state = flow.init(state);
  expect(state.ctx.currentPlayer).toBe('10');
  state = flow.processGameEvent(state, { type: 'endTurn' });
  expect(state.ctx.currentPlayer).toBe('3');
});

test('passing', () => {
  const flow = FlowWithPhases({
    phases: [{ name: 'A', turnOrder: TurnOrder.SKIP }],
  });
  const game = Game({
    flow,
    moves: { pass },
  });
  const reducer = createGameReducer({ game, numPlayers: 3 });
  let state = reducer(undefined, { type: 'init' });

  expect(state.ctx.currentPlayer).toBe('0');
  state = reducer(state, makeMove('pass'));
  state = reducer(state, gameEvent('endTurn'));
  expect(state.G.allPassed).toBe(undefined);

  expect(state.ctx.currentPlayer).toBe('1');
  state = reducer(state, gameEvent('endTurn'));
  expect(state.G.allPassed).toBe(undefined);

  expect(state.ctx.currentPlayer).toBe('2');
  state = reducer(state, gameEvent('endTurn'));
  expect(state.G.allPassed).toBe(undefined);

  expect(state.ctx.currentPlayer).toBe('1');
  state = reducer(state, makeMove('pass'));
  state = reducer(state, gameEvent('endTurn'));
  expect(state.G.allPassed).toBe(undefined);

  expect(state.ctx.currentPlayer).toBe('2');
  state = reducer(state, gameEvent('endTurn'));
  expect(state.G.allPassed).toBe(undefined);

  expect(state.ctx.currentPlayer).toBe('2');
  state = reducer(state, makeMove('pass'));
  expect(state.G.allPassed).toBe(true);

  expect(state.ctx.currentPlayer).toBe('2');
  state = reducer(state, gameEvent('endTurn'));
  expect(state.G.allPassed).toBe(true);
});

test('end game after everyone passes', () => {
  const flow = FlowWithPhases({
    phases: [
      { name: 'A', turnOrder: TurnOrder.ANY, endGameIf: G => G.allPassed },
    ],
  });
  const game = Game({
    flow,
    moves: { pass },
  });
  const reducer = createGameReducer({ game, numPlayers: 2 });

  let state = reducer(undefined, { type: 'init' });
  expect(state.ctx.currentPlayer).toBe('any');
  state = reducer(state, makeMove('pass', null, '0'));
  expect(state.ctx.gameover).toBe(undefined);
  state = reducer(state, makeMove('pass', null, '1'));
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
