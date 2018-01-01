/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import Game from './game';
import { createStore } from 'redux';
import { createGameReducer } from './reducer';
import { makeMove, gameEvent } from './action-creators';
import { Flow, SimpleFlow, FlowWithPhases, TurnOrder, createEventDispatchers } from './flow';

test('Flow', () => {
  const flow = Flow({});
  const state = {};
  expect(flow.reducer(state, { type: 'unknown' })).toBe(state);
});

test('SimpleFlow', () => {
  const flow = SimpleFlow({});

  expect(flow.eventNames).toEqual(['endTurn']);
  let state = { ctx: flow.setup(2) };
  expect(state.ctx.turn).toBe(0);
  state = flow.reducer(state, { type: 'endTurn' });
  expect(state.ctx.turn).toBe(1);
});

test('FlowWithPhases', () => {
  const flow = FlowWithPhases({
    phases: [
      { name: 'A' },
      { name: 'B' },
    ],
  });

  let state = { ctx: flow.setup(2) };
  expect(state.ctx.turn).toBe(0);
  state = flow.reducer(state, { type: 'endTurn' });
  expect(state.ctx.turn).toBe(1);

  expect(state.ctx.phase).toBe('A');
  state = flow.reducer(state, { type: 'endPhase' });
  expect(state.ctx.phase).toBe('B');
  state = flow.reducer(state, { type: 'endPhase' });
  expect(state.ctx.phase).toBe('A');
});

test('init', () => {
  let flow = FlowWithPhases({
    phases: [
      { name: 'A', cleanup: () => ({ done: true }) },
    ],
  });

  const orig = flow.setup(2);
  let state = { ctx: orig };
  state = flow.reducer(state, { type: 'init' });
  expect(state).toEqual({ ctx: orig });

  flow = FlowWithPhases({
    phases: [
      { name: 'A', setup: () => ({ done: true }) },
    ],
  });

  state = { ctx: orig };
  state = flow.reducer(state, { type: 'init' });
  expect(state.G).toEqual({ done: true });
});

test('setup / cleanup', () => {
  const flow = FlowWithPhases({
    phases: [
      {
        name: 'A',
        setup: s => ({ ...s, 'setupA': true }),
        cleanup: s => ({ ...s, 'cleanupA': true }),
      },
      {
        name: 'B',
        setup: s => ({ ...s, 'setupB': true }),
        cleanup: s => ({ ...s, 'cleanupB': true }),
      },
    ],
  });

  let state = { G: {}, ctx: flow.setup(2) };
  state = flow.reducer(state, { type: 'init' });
  expect(state.G).toEqual({ 'setupA': true });
  state = flow.reducer(state, { type: 'endPhase' });
  expect(state.G).toEqual({ 'setupA': true, 'cleanupA': true, 'setupB': true });
  state = flow.reducer(state, { type: 'endPhase' });
  expect(state.G).toEqual({
    'setupA': true,
    'cleanupA': true,
    'setupB': true,
    'cleanupB': true,
  });
});

test('phaseEndCondition', () => {
  const flow = FlowWithPhases({
    phases: [
      { name: 'A', phaseEndCondition: (G, ctx) => (ctx.turn > 1) },
      { name: 'B' },
    ],
  });

  let state = { ctx: flow.setup(2) };
  state = flow.reducer(state, { type: 'endTurn' });
  expect(state.ctx.phase).toBe('A');
  state = flow.reducer(state, { type: 'endTurn' });
  expect(state.ctx.phase).toBe('B');
});

test('turnOrder', () => {
  let flow = FlowWithPhases({
    phases: [{ name: 'A' }],
  });

  let state = { ctx: flow.setup(10) };
  state = flow.reducer(state, { type: 'init' });
  expect(state.ctx.currentPlayer).toBe('0');
  state = flow.reducer(state, { type: 'endTurn' });
  expect(state.ctx.currentPlayer).toBe('1');

  flow = FlowWithPhases({
    phases: [
      { name: 'A', turnOrder: TurnOrder.ANY },
    ],
  });

  state = { ctx: flow.setup(10) };
  state = flow.reducer(state, { type: 'init' });
  expect(state.ctx.currentPlayer).toBe('any');
  state = flow.reducer(state, { type: 'endTurn' });
  expect(state.ctx.currentPlayer).toBe('any');

  flow = FlowWithPhases({
    phases: [
      { name: 'A', turnOrder: { first: () => '10', next: () => '3' } }
    ],
  });

  state = { ctx: flow.setup(10) };
  state = flow.reducer(state, { type: 'init' });
  expect(state.ctx.currentPlayer).toBe('10');
  state = flow.reducer(state, { type: 'endTurn' });
  expect(state.ctx.currentPlayer).toBe('3');
});

test('validator', () => {
  let flow;
  flow = Flow({});
  expect(flow.validator()).toBe(true);
  flow = Flow({ validator: () => false });
  expect(flow.validator()).toBe(false);

  let game = Game({
    moves: {
      'A': () => ({ A: true }),
      'B': () => ({ B: true }),
    },

    flow: {
      phases: [
        { name: 'A', allowedMoves: 'A' },
        { name: 'B', allowedMoves: 'B' },
        { name: 'C' },
      ]
    }
  });

  const reducer = createGameReducer({game, numPlayers: 2});
  let state = reducer(undefined, { type: 'init' });
  expect(state.ctx.phase).toBe('A');

  // B is disallowed in phase A.
  state = reducer(state, makeMove({ type: 'B' }));
  expect(state.G).toEqual({});
  state = reducer(state, makeMove({ type: 'A' }));
  expect(state.G).toEqual({ A: true });

  state = reducer(state, gameEvent({ type: 'endPhase' }));
  state.G = {};
  expect(state.ctx.phase).toBe('B');

  // A is disallowed in phase B.
  state = reducer(state, makeMove({ type: 'A' }));
  expect(state.G).toEqual({});
  state = reducer(state, makeMove({ type: 'B' }));
  expect(state.G).toEqual({ B: true });

  state = reducer(state, gameEvent({ type: 'endPhase' }));
  state.G = {};
  expect(state.ctx.phase).toBe('C');

  // All moves are allowed in phase C.
  state = reducer(state, makeMove({ type: 'A' }));
  expect(state.G).toEqual({ A: true });
  state = reducer(state, makeMove({ type: 'B' }));
  expect(state.G).toEqual({ B: true });
});

test('victory', () => {
  const flow = FlowWithPhases({ victory: G => G.win });

  let state = { G: {}, ctx: flow.setup(2) };
  state = flow.reducer(state, { type: 'endTurn' });
  expect(state.ctx.winner).toBe(undefined);

  state.G.win = 'A';
  state = flow.reducer(state, { type: 'endTurn' });
  expect(state.ctx.winner).toBe('A');
});

test('dispatchers', () => {
  const game = Game({});
  const reducer = createGameReducer({game, numPlayers: 2});
  const store = createStore(reducer);
  const api = createEventDispatchers(game.flow.eventNames, store);
  expect(Object.getOwnPropertyNames(api)).toEqual(['endTurn']);

  expect(store.getState().ctx.turn).toBe(0);
  api.endTurn();
  expect(store.getState().ctx.turn).toBe(1);
});
