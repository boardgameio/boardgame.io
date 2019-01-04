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
  let reducer;

  beforeAll(() => {
    game = Game({
      moves: {
        A: G => G,
      },

      plugins: [
        {
          fnWrap: () => G => ({ ...G, fnWrap: true }),
          setupG: G => ({ ...G, initG: true }),
          setupCtx: ctx => ({ ...ctx, initCtx: true }),
        },
      ],
    });

    reducer = CreateGameReducer({ game });
  });

  test('setupG', () => {
    const state = reducer(undefined, { type: 'init' });
    expect(state.G).toMatchObject({ initG: true });
  });

  test('setupCtx', () => {
    const state = reducer(undefined, { type: 'init' });
    expect(state.ctx).toMatchObject({ initCtx: true });
  });

  test('fnWrap', () => {
    let state = reducer(undefined, { type: 'init' });
    state = reducer(state, makeMove('A'));
    expect(state.G).toMatchObject({ fnWrap: true });
  });
});
