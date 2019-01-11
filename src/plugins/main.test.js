/*
 * Copyright 2019 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import Game from '../core/game';
import { InitializeGame, CreateGameReducer } from '../core/reducer';
import { makeMove } from '../core/action-creators';

describe('plugins', () => {
  let game;
  let reducer;
  let initialState;

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
            setup: G => ({ ...G, setup: true }),
            preMove: G => ({ ...G, preMove: true }),
            postMove: G => ({ ...G, postMove: true }),
            onPhaseBegin: G => ({ ...G, onPhaseBegin: true }),
          },
          ctx: {
            setup: ctx => ({ ...ctx, setup: true }),
            preMove: ctx => ({ ...ctx, preMove: true }),
            onPhaseBegin: ctx => ({ ...ctx, onPhaseBegin: true }),
          },
        },
      ],
    });

    reducer = CreateGameReducer({ game });
    initialState = InitializeGame({ game });
  });

  test('immer works', () => {
    let state = initialState;
    state = reducer(state, makeMove('B'));
    expect(state.G).toMatchObject({ immer: true });
  });

  test('setupG', () => {
    let state = initialState;
    expect(state.G).toMatchObject({ setup: true });
  });

  test('setupCtx', () => {
    let state = initialState;
    expect(state.ctx).toMatchObject({ setup: true });
  });

  test('onPhaseBegin', () => {
    let state = initialState;
    expect(state.G).toMatchObject({ onPhaseBegin: true });
    expect(state.ctx).toMatchObject({ onPhaseBegin: true });
  });

  test('fnWrap', () => {
    let state = initialState;
    state = reducer(state, makeMove('A'));
    expect(state.G).toMatchObject({ fnWrap: true });
  });

  test('preMove', () => {
    let state = initialState;
    state = reducer(state, makeMove('A'));
    expect(state.G).toMatchObject({ preMove: true });
    expect(state.G.ctx).toMatchObject({ preMove: true });
  });

  test('postMove', () => {
    let state = initialState;
    state = reducer(state, makeMove('A'));
    expect(state.G).toMatchObject({ postMove: true });
  });
});
