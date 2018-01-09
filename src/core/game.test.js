/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import Game from './game';

const game = Game({
  moves: {
    'A': G => G,
    'B': () => null,
  }
});

test('basic', () => {
  expect(game.moveNames).toEqual(['A', 'B']);
  expect(typeof game.processMove).toEqual('function');
});

test('processMove', () => {
  const testObj = { test: true };
  expect(game.processMove(testObj, { type: 'A' })).toEqual(testObj);
  expect(game.processMove(testObj, { type: 'B' })).toEqual(null);
});

test('playerID from context', () => {
  const g = Game({
    moves: {
      A() {
        return { playerID: this.playerID };
      }
    },
  });

  const state = g.processMove({}, { type: 'A', playerID: 'player' });
  expect(state.playerID).toBe('player');
});

test('flow override', () => {
  const f = { processGameEvent: () => {} };
  const game = Game({
    flow: f
  });
  expect(game.flow).toBe(f);
});
