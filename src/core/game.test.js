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
  expect(typeof game.reducer).toEqual('function');
});

test('reducer', () => {
  const testObj = { test: true };
  expect(game.reducer(testObj, { type: 'A' })).toEqual(testObj);
  expect(game.reducer(testObj, { type: 'B' })).toEqual(null);
});

test('flow override', () => {
  const fn = () => {};
  const game = Game({
    flow: () => fn
  });
  expect(game.flow).toBe(fn);
});
