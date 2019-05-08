/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import Game from './game';
import { InitializeGame, CreateGameReducer } from './reducer';
import { gameEvent } from './action-creators';

const game = Game({
  moves: {
    A: G => G,
    B: () => null,
  },

  flow: {
    phases: {
      PA: {
        moves: {
          A: () => 'PA.A',
        },
      },
    },
  },
});

test('basic', () => {
  expect(game.moveNames).toEqual(['A', 'B', 'PA.A']);
  expect(typeof game.processMove).toEqual('function');
});

test('processMove', () => {
  const testObj = { test: true };
  expect(game.processMove(testObj, { type: 'A' })).toEqual(testObj);
  expect(game.processMove(testObj, { type: 'C' })).toEqual(testObj);
  expect(game.processMove(testObj, { type: 'B' })).toEqual(null);
  expect(game.processMove(testObj, { type: 'PA.A' })).toEqual('PA.A');
});

test('flow override', () => {
  const f = { processGameEvent: () => {} };
  const game = Game({
    flow: f,
  });
  expect(game.flow).toBe(f);
});

// Following turn order is often used in worker placement games like Agricola and Viticulture.
test('rounds with starting player token', () => {
  let game = Game({
    setup: () => ({ startingPlayerToken: 0 }),
    flow: {
      startingPhase: 'main',
      phases: {
        main: {
          turn: {
            order: {
              first: G => G.startingPlayerToken,
              next: (G, ctx) => (+ctx.playOrderPos + 1) % ctx.playOrder.length,
            },
          },
        },
      },
    },
  });

  const numPlayers = 4;
  const reducer = CreateGameReducer({ game });
  let state = InitializeGame({ game, numPlayers });

  expect(state.ctx.currentPlayer).toBe('0');

  state = reducer(state, gameEvent('endTurn'));
  expect(state.ctx.currentPlayer).toBe('1');

  state = reducer(state, gameEvent('endTurn'));
  expect(state.ctx.currentPlayer).toBe('2');
  // a player took starting player token
  state = { ...state, G: { startingPlayerToken: 2 } };
  state = reducer(state, gameEvent('endTurn'));
  expect(state.ctx.currentPlayer).toBe('3');

  state = reducer(state, gameEvent('endTurn'));
  state = reducer(state, gameEvent('endPhase', { next: 'main' }));
  expect(state.ctx.currentPlayer).toBe('2');

  state = reducer(state, gameEvent('endTurn'));
  expect(state.ctx.currentPlayer).toBe('3');

  state = reducer(state, gameEvent('endTurn'));
  expect(state.ctx.currentPlayer).toBe('0');
});

// The following pattern is used in Catan, Twilight Imperium, and (sort of) Powergrid.
test('serpentine setup phases', () => {
  let game = Game({
    flow: {
      startingPhase: 'first setup round',
      phases: {
        'first setup round': {
          turn: {
            order: {
              first: () => 0,
              next: (G, ctx) => (+ctx.playOrderPos + 1) % ctx.playOrder.length,
            },
          },
          next: 'second setup round',
        },
        'second setup round': {
          turn: {
            order: {
              first: (G, ctx) => ctx.playOrder.length - 1,
              next: (G, ctx) => (+ctx.playOrderPos - 1) % ctx.playOrder.length,
            },
          },
          next: 'main phase',
        },
        'main phase': {
          turn: {
            order: {
              first: () => 0,
              next: (G, ctx) => (+ctx.playOrderPos + 1) % ctx.playOrder.length,
            },
          },
        },
      },
    },
  });

  const numPlayers = 4;
  const reducer = CreateGameReducer({ game });
  let state = InitializeGame({ game, numPlayers });

  expect(state.ctx.currentPlayer).toBe('0');
  expect(state.ctx.phase).toBe('first setup round');

  state = reducer(state, gameEvent('endTurn'));
  expect(state.ctx.currentPlayer).toBe('1');
  expect(state.ctx.phase).toBe('first setup round');

  state = reducer(state, gameEvent('endTurn'));
  expect(state.ctx.currentPlayer).toBe('2');
  expect(state.ctx.phase).toBe('first setup round');

  state = reducer(state, gameEvent('endTurn'));
  expect(state.ctx.currentPlayer).toBe('3');
  expect(state.ctx.phase).toBe('first setup round');

  state = reducer(state, gameEvent('endTurn'));
  state = reducer(state, gameEvent('endPhase'));
  expect(state.ctx.currentPlayer).toBe('3');
  expect(state.ctx.phase).toBe('second setup round');

  state = reducer(state, gameEvent('endTurn'));
  expect(state.ctx.currentPlayer).toBe('2');
  expect(state.ctx.phase).toBe('second setup round');

  state = reducer(state, gameEvent('endTurn'));
  expect(state.ctx.currentPlayer).toBe('1');
  expect(state.ctx.phase).toBe('second setup round');

  state = reducer(state, gameEvent('endTurn'));
  expect(state.ctx.currentPlayer).toBe('0');
  expect(state.ctx.phase).toBe('second setup round');

  state = reducer(state, gameEvent('endTurn'));
  state = reducer(state, gameEvent('endPhase'));
  expect(state.ctx.currentPlayer).toBe('0');
  expect(state.ctx.phase).toBe('main phase');

  state = reducer(state, gameEvent('endTurn'));
  expect(state.ctx.currentPlayer).toBe('1');
  expect(state.ctx.phase).toBe('main phase');

  state = reducer(state, gameEvent('endTurn'));
  expect(state.ctx.currentPlayer).toBe('2');
  expect(state.ctx.phase).toBe('main phase');

  state = reducer(state, gameEvent('endTurn'));
  expect(state.ctx.currentPlayer).toBe('3');
  expect(state.ctx.phase).toBe('main phase');

  state = reducer(state, gameEvent('endTurn'));
  expect(state.ctx.currentPlayer).toBe('0');
  expect(state.ctx.phase).toBe('main phase');

  state = reducer(state, gameEvent('endTurn'));
  expect(state.ctx.currentPlayer).toBe('1');
  expect(state.ctx.phase).toBe('main phase');

  state = reducer(state, gameEvent('endTurn'));
  expect(state.ctx.currentPlayer).toBe('2');
  expect(state.ctx.phase).toBe('main phase');

  state = reducer(state, gameEvent('endTurn'));
  expect(state.ctx.currentPlayer).toBe('3');
  expect(state.ctx.phase).toBe('main phase');

  state = reducer(state, gameEvent('endTurn'));
  expect(state.ctx.currentPlayer).toBe('0');
  expect(state.ctx.phase).toBe('main phase');

  state = reducer(state, gameEvent('endTurn'));
  expect(state.ctx.currentPlayer).toBe('1');
  expect(state.ctx.phase).toBe('main phase');
});
