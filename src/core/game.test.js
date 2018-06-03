/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import Game from './game';
import { CreateGameReducer } from './reducer';
import { gameEvent } from './action-creators';

const game = Game({
  moves: {
    A: G => G,
    B: () => null,
  },
});

test('basic', () => {
  expect(game.moveNames).toEqual(['A', 'B']);
  expect(typeof game.processMove).toEqual('function');
});

test('processMove', () => {
  const testObj = { test: true };
  expect(game.processMove(testObj, { type: 'A' })).toEqual(testObj);
  expect(game.processMove(testObj, { type: 'C' })).toEqual(testObj);
  expect(game.processMove(testObj, { type: 'B' })).toEqual(null);
});

test('playerID from context', () => {
  const g = Game({
    moves: {
      A() {
        return { playerID: this.playerID };
      },
    },
  });

  const state = g.processMove({}, { type: 'A', playerID: 'player' });
  expect(state.playerID).toBe('player');
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
      phases: [
        {
          name: 'main',
          turnOrder: {
            first: G => G.startingPlayerToken,
            next: (G, ctx) => (+ctx.playOrderPos + 1) % ctx.playOrder.length,
          },
        },
      ],
    },
  });

  const numPlayers = 4;
  const reducer = CreateGameReducer({ game, numPlayers: numPlayers });
  let state = reducer(undefined, { type: 'init' });

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
  state = reducer(state, gameEvent('endPhase'));
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
      phases: [
        {
          name: 'first setup round',
          turnOrder: {
            first: () => 0,
            next: (G, ctx) => (+ctx.playOrderPos + 1) % ctx.playOrder.length,
          },
        },
        {
          name: 'second setup round',
          turnOrder: {
            first: (G, ctx) => ctx.playOrder.length - 1,
            next: (G, ctx) => (+ctx.playOrderPos - 1) % ctx.playOrder.length,
          },
        },
        {
          name: 'main phase',
          turnOrder: {
            first: () => 0,
            next: (G, ctx) => (+ctx.playOrderPos + 1) % ctx.playOrder.length,
          },
        },
      ],
    },
  });

  const numPlayers = 4;
  const reducer = CreateGameReducer({ game, numPlayers: numPlayers });
  let state = reducer(undefined, { type: 'init' });

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
