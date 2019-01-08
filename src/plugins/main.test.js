/*
 * Copyright 2019 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import Game from '../core/game';
import { CreateGameReducer } from '../core/reducer';
import { makeMove } from '../core/action-creators';

describe('plugins', () => {
  let game;
  let reducer;

  beforeAll(() => {
    game = Game({
      moves: {
        A: (G, ctx) => ({ ...G, ctx }),
        B: G => {
          G.immer = true;
        },
      },

      plugins: [
        {
          fnWrap: fn => (G, ctx) => {
            G = fn(G, ctx);
            return { ...G, fnWrap: true };
          },
          G: {
            setup: G => ({ ...G, initG: true }),
            preMove: G => ({ ...G, addToG: true }),
            postMove: G => ({ ...G, removeFromG: true }),
          },
          ctx: {
            setup: ctx => ({ ...ctx, initCtx: true }),
            preMove: ctx => ({ ...ctx, addToCtx: true }),
            postMove: ctx => ({ ...ctx, removeFromCtx: true }),
          },
        },
      ],
    });

    reducer = CreateGameReducer({ game });
  });

  test('immer works', () => {
    let state = reducer(undefined, { type: 'init' });
    state = reducer(state, makeMove('B'));
    expect(state.G).toMatchObject({ immer: true });
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

  test('addToG / addToCtx', () => {
    let state = reducer(undefined, { type: 'init' });
    state = reducer(state, makeMove('A'));
    expect(state.G).toMatchObject({ addToG: true, ctx: { addToCtx: true } });
  });
});
