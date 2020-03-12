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
        A: (G, ctx) => {
          G.beginA = ctx.test.get();
          ctx.test.increment();
          G.endA = ctx.test.get();
        },
      },

      endIf: (_, ctx) => {
        if (ctx.test === undefined) {
          throw new Error('API is not defined');
        }
      },

      turn: {
        onMove: (G, ctx) => {
          G.onMove = ctx.test.get();
          ctx.test.increment();
        },

        onEnd: (G, ctx) => {
          G.onTurnEnd = ctx.test.get();
          ctx.test.increment();
        },
      },

      pluginRelated: 10,

      plugins: [
        {
          name: 'test',

          setup: ({ game }) => ({
            n: game.pluginRelated,
          }),

          api: ({ data }) => {
            let state = { value: data.n };
            const increment = () => state.value++;
            const get = () => state.value;
            return { increment, get };
          },

          flush: ({ api }) => ({ n: api.get() }),

          fnWrap: fn => (G, ctx) => {
            G = fn(G, ctx);
            return { ...G, wrap: true };
          },
        },
      ],
    };

    client = Client({ game });
  });

  test('setup', () => {
    expect(client.getState().plugins.test.data).toEqual({
      n: 10,
    });
  });

  test('make move', () => {
    client.moves.A();
    expect(client.getState().G).toEqual({
      beginA: 10,
      endA: 11,
      onMove: 11,
      wrap: true,
    });
    expect(client.getState().plugins.test.data).toEqual({ n: 12 });
  });

  test('make another move', () => {
    client.moves.A();
    expect(client.getState().G).toEqual({
      beginA: 12,
      endA: 13,
      onMove: 13,
      wrap: true,
    });
    expect(client.getState().plugins.test.data).toEqual({ n: 14 });
  });

  test('event', () => {
    client.events.endTurn();
    expect(client.getState().G).toMatchObject({ onTurnEnd: 14 });
    expect(client.getState().plugins.test.data).toEqual({ n: 15 });
  });

  test('does not make it into undo state', () => {
    client.moves.A();
    client.undo();
    expect(Object.keys(client.getState()._undo[0].ctx)).not.toContain('test');
  });
});
