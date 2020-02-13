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
          beforeMove: state => {
            return { ...state, G: { ...state.G, beforeMove: true } };
          },
          beforeEvent: state => {
            return { ...state, G: { ...state.G, beforeEvent: true } };
          },
          afterMove: state => {
            return { ...state, G: { ...state.G, afterMove: true } };
          },
          afterEvent: state => {
            return { ...state, G: { ...state.G, afterEvent: true } };
          },
          fnWrap: fn => (G, ctx) => {
            G = fn(G, ctx);
            return { ...G, fnWrap: true };
          },
          setup: {
            G: G => ({ ...G, setup: true }),
            ctx: ctx => ({ ...ctx, setup: true }),
          },
        },
      ],
    };

    client = Client({ game });
  });

  test('setupG', () => {
    expect(client.getState().G).toMatchObject({ setup: true });
  });

  test('setupCtx', () => {
    expect(client.getState().ctx).toMatchObject({ setup: true });
  });

  test('fnWrap', () => {
    client.moves.A();
    expect(client.getState().G).toMatchObject({ fnWrap: true });
    expect(client.getState().G).toMatchObject({ beforeMove: true });
    expect(client.getState().G).toMatchObject({ afterMove: true });
  });

  test('immer works', () => {
    client.moves.B();
    expect(client.getState().G).toMatchObject({ immer: true });
  });

  test('event', () => {
    client.events.endTurn();
    expect(client.getState().G).toMatchObject({ beforeEvent: true });
    expect(client.getState().G).toMatchObject({ afterEvent: true });
  });
});
