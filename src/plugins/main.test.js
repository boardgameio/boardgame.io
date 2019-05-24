/*
 * Copyright 2019 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { Client } from '../client/client';

describe('plugins', () => {
  let client;

  beforeAll(() => {
    const game = {
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
    };

    client = Client({ game });
  });

  test('immer works', () => {
    client.moves.B();
    expect(client.getState().G).toMatchObject({ immer: true });
  });

  test('setupG', () => {
    expect(client.getState().G).toMatchObject({ setup: true });
  });

  test('setupCtx', () => {
    expect(client.getState().ctx).toMatchObject({ setup: true });
  });

  test('onPhaseBegin', () => {
    expect(client.getState().G).toMatchObject({ onPhaseBegin: true });
    expect(client.getState().ctx).toMatchObject({ onPhaseBegin: true });
  });

  test('fnWrap', () => {
    client.moves.A();
    expect(client.getState().G).toMatchObject({ fnWrap: true });
  });

  test('preMove', () => {
    client.moves.A();
    expect(client.getState().G).toMatchObject({ preMove: true });
    expect(client.getState().G.ctx).toMatchObject({ preMove: true });
  });

  test('postMove', () => {
    client.moves.A();
    expect(client.getState().G).toMatchObject({ postMove: true });
  });
});
