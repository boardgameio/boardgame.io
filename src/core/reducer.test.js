/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import Game from './game';
import { createStore } from 'redux';
import { createGameReducer, createMoveDispatchers } from './reducer';
import { makeMove, gameEvent, restore } from './action-creators';

const game = Game({
  moves: {
    'A': G => G,
    'B': () => ({ moved: true }),
    'C': () => ({ victory: true })
  },
  victory: (G, ctx) => G.victory ? ctx.currentPlayer : null
});

const endTurn = () => gameEvent({ type: 'endTurn' });

test('_id is incremented', () => {
  const reducer = createGameReducer({game});

  let state = undefined;

  state = reducer(state, makeMove({ type: 'unknown' }));
  expect(state._id).toBe(1);
  state = reducer(state, endTurn());
  expect(state._id).toBe(2);
});

test('makeMove', () => {
  const reducer = createGameReducer({game});

  let state;

  state = reducer(undefined, makeMove({ type: 'unknown' }));
  expect(state.G).toEqual({});

  state = reducer(undefined, makeMove({ type: 'A' }));
  expect(state.G).toEqual({});

  state = reducer(undefined, makeMove({ type: 'B' }));
  expect(state.G).toEqual({ moved: true });
});

test('restore', () => {
  const reducer = createGameReducer({game});
  const state = reducer(undefined, restore({ G: 'restored' }));
  expect(state).toEqual({G: 'restored'});
});

test('move dispatchers', () => {
  const reducer = createGameReducer({game});
  const store = createStore(reducer);
  const api = createMoveDispatchers(game.moveNames, store);

  expect(Object.getOwnPropertyNames(api)).toEqual(['A', 'B', 'C']);
  expect(api.unknown).toBe(undefined);

  api.A();
  expect(store.getState().G).toEqual({});

  api.B();
  expect(store.getState().G).toEqual({ moved: true });

  api.C();
  expect(store.getState().G).toEqual({ victory: true });
});

test('victory', () => {
  const reducer = createGameReducer({game});

  let state = reducer(undefined, makeMove({ type: 'A' }));
  state = reducer(state, endTurn());
  expect(state.ctx.winner).toEqual(null);
  state = reducer(state, makeMove({ type: 'B' }));
  state = reducer(state, endTurn());
  expect(state.ctx.winner).toEqual(null);
  state = reducer(state, makeMove({ type: 'C' }));
  state = reducer(state, endTurn());
  expect(state.ctx.winner).toEqual('0');
});

test('endTurn', () => {
  const reducer = createGameReducer({game});
  const state = reducer(undefined, endTurn());
  expect(state.ctx.turn).toBe(1);
});

test('numPlayers', () => {
  const numPlayers = 4;
  const reducer = createGameReducer({game, numPlayers});
  const state = reducer(undefined, endTurn());
  expect(state.ctx.numPlayers).toBe(4);
});

test('log', () => {
  const reducer = createGameReducer({game});

  let state = undefined;

  const actionA = makeMove({ type: 'moveA' });
  const actionB = makeMove({ type: 'moveB' });
  const actionC = endTurn();

  state = reducer(state, actionA);
  expect(state.log).toEqual([actionA]);
  state = reducer(state, actionB);
  expect(state.log).toEqual([actionA, actionB]);
  state = reducer(state, actionC);
  expect(state.log).toEqual([actionA, actionB, actionC]);
});
