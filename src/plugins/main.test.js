/*
 * Copyright 2019 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { Client } from '../client/client';
import { Local } from '../client/transport/local';

describe('basic', () => {
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

describe('default values', () => {
  const pluginData = { value: true };

  const plugin = {
    name: 'test',
    flush: () => pluginData,
  };

  const anotherPlugin = {
    name: 'test2',
    noClient: () => false,
  };

  const game = { moves: { A: () => {} }, plugins: [plugin, anotherPlugin] };

  test('are used if no setup is present', () => {
    const client = Client({ game, playerID: '0', multiplayer: Local() });
    client.start();
    client.moves.A();
    expect(client.getState().plugins.test.data).toEqual(pluginData);
  });
});

describe('actions', () => {
  let client;

  beforeAll(() => {
    const game = {
      plugins: [
        {
          name: 'test',

          setup: () => ({
            initial: true,
          }),

          action: (_, payload) => {
            return payload.args[0];
          },
        },
        {
          name: 'nosetup',
          action: () => ({ action: true }),
        },
      ],
    };

    client = Client({ game });
  });

  test('setup', () => {
    expect(client.getState().plugins.test.data).toEqual({
      initial: true,
    });
    expect(client.getState().plugins.nosetup).toBeUndefined();
  });

  test('take action', () => {
    const payload = { payload: true };

    client.plugins.test(payload);
    client.plugins.nosetup(payload);

    expect(client.getState().plugins.test.data).toEqual(payload);
    expect(client.getState().plugins.nosetup.data).toEqual({ action: true });
  });
});

describe('plugins are accessible in events triggered from moves', () => {
  test('turn/onBegin', () => {
    const game = {
      moves: {
        stop: (G, ctx) => ctx.events.endTurn(),
      },
      turn: {
        onBegin: (G, ctx) => {
          G.onBegin = ctx.random.Die(1);
        },
      },
    };

    const client = Client({ game });
    client.moves.stop();
    expect(client.getState().G).toEqual({
      onBegin: 1,
    });
  });

  test('turn/onEnd', () => {
    const game = {
      moves: {
        stop: (G, ctx) => ctx.events.endTurn(),
      },
      turn: {
        onEnd: (G, ctx) => {
          G.onEnd = ctx.random.Die(1);
        },
      },
    };

    const client = Client({ game });
    client.moves.stop();
    expect(client.getState().G).toEqual({
      onEnd: 1,
    });
  });

  test('phase/onBegin', () => {
    const game = {
      moves: {
        stop: (G, ctx) => ctx.events.setPhase('second'),
      },
      phases: {
        first: {
          start: true,
        },
        second: {
          onBegin: (G, ctx) => {
            G.onEnd = ctx.random.Die(1);
          },
        },
      },
    };

    const client = Client({ game });
    client.moves.stop();
    expect(client.getState().G).toEqual({
      onEnd: 1,
    });
  });

  test('phase/onEnd', () => {
    const game = {
      moves: {
        stop: (G, ctx) => ctx.events.endPhase(),
      },
      phases: {
        first: {
          start: true,
          onEnd: (G, ctx) => {
            G.onEnd = ctx.random.Die(1);
          },
        },
      },
    };

    const client = Client({ game });
    client.moves.stop();
    expect(client.getState().G).toEqual({
      onEnd: 1,
    });
  });
});
