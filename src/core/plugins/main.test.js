/*
 * Copyright 2019 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import Game from '../game';
import { CreateGameReducer } from '../reducer';
import { makeMove } from '../action-creators';

describe('plugins', () => {
  let game;
  beforeAll(() => {
    game = Game({
      moves: {
        A: G => G,
      },

      plugins: [{ fnWrap: () => () => ({ plugin: true }) }],
    });
  });

  test('plugin is invoked', () => {
    const reducer = CreateGameReducer({ game });
    let state = reducer(undefined, { type: 'init' });
    state = reducer(state, makeMove('A'));
    expect(state.G).toEqual({ plugin: true });
  });
});
