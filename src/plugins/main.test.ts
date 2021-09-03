/*
 * Copyright 2019 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { Client } from '../client/client';
import { Local } from '../client/transport/local';
import type { Game } from '../types';
import { GameMethod } from '../../packages/core';

describe('basic', () => {
  let client: ReturnType<typeof Client>;

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
            const state = { value: data.n };
            const increment = () => state.value++;
            const get = () => state.value;
            return { increment, get };
          },

          flush: ({ api }) => ({ n: api.get() }),

          fnWrap: (fn) => (G, ctx) => {
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

describe('isInvalid method', () => {
  // Silence expected error logging and restore when finished.
  const stderr = console.error;
  beforeAll(() => (console.error = () => {}));
  afterAll(() => (console.error = stderr));

  test('basic plugin', () => {
    const goodG = { good: 'nice' };
    const game: Game = {
      plugins: [
        {
          name: 'test',
          isInvalid: ({ G }) => 'bad' in G && 'not ok',
        },
      ],
      moves: {
        good: () => goodG,
        bad: () => ({ bad: 'not ok' }),
      },
    };

    const client = Client({ game, playerID: '0' });
    client.start();
    client.moves.good();
    expect(client.getState().G).toEqual(goodG);
    client.moves.bad();
    expect(client.getState().G).toEqual(goodG);
  });

  test('plugin with API and data', () => {
    const game: Game<any, any> = {
      plugins: [
        {
          name: 'test',
          setup: () => ({}),
          api: ({ data }) => ({
            set: (key, val) => {
              data[key] = val;
            },
          }),
          isInvalid: ({ data }) => 'bad' in data && 'not ok',
        },
      ],
      moves: {
        good: (_, ctx) => {
          ctx.test.set('good', 'nice');
        },
        bad: (_, ctx) => {
          ctx.test.set('bad', 'not ok');
        },
      },
    };

    const client = Client({ game, playerID: '0' });
    client.start();
    expect(client.getState().ctx.numMoves).toBe(0);
    client.moves.good();
    expect(client.getState().ctx.numMoves).toBe(1);
    client.moves.bad();
    expect(client.getState().ctx.numMoves).toBe(1);
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
  const plugins = [
    {
      name: 'test',

      setup: () => ({
        initial: true,
      }),

      flush: () => ({ initial: true }),

      api: ({ data }) => {
        return {
          get: () => data.initial,
        };
      },
    },
  ];

  test('turn/onBegin', () => {
    const game = {
      plugins,
      moves: {
        stop: (G, ctx) => ctx.events.endTurn(),
      },
      turn: {
        onBegin: (G, ctx) => {
          G.onBegin = ctx.random.Die(1);
          G.test = ctx.test.get();
        },
      },
    };

    const client = Client({ game });
    client.moves.stop();
    expect(client.getState().G).toEqual({
      onBegin: 1,
      test: true,
    });
  });

  test('turn/onEnd', () => {
    const game = {
      plugins,
      moves: {
        stop: (G, ctx) => ctx.events.endTurn(),
      },
      turn: {
        onEnd: (G, ctx) => {
          G.onEnd = ctx.random.Die(1);
          G.test = ctx.test.get();
        },
      },
    };

    const client = Client({ game });
    client.moves.stop();
    expect(client.getState().G).toEqual({
      onEnd: 1,
      test: true,
    });
  });

  test('phase/onBegin', () => {
    const game = {
      plugins,
      moves: {
        stop: (G, ctx) => ctx.events.setPhase('second'),
      },
      phases: {
        first: {
          start: true,
        },
        second: {
          onBegin: (G, ctx) => {
            G.onBegin = ctx.random.Die(1);
            G.test = ctx.test.get();
          },
        },
      },
    };

    const client = Client({ game });
    client.moves.stop();
    expect(client.getState().G).toEqual({
      onBegin: 1,
      test: true,
    });
  });

  test('phase/onEnd', () => {
    const game = {
      plugins,
      moves: {
        stop: (G, ctx) => ctx.events.endPhase(),
      },
      phases: {
        first: {
          start: true,
          onEnd: (G, ctx) => {
            G.onEnd = ctx.random.Die(1);
            G.test = ctx.test.get();
          },
        },
      },
    };

    const client = Client({ game });
    client.moves.stop();
    expect(client.getState().G).toEqual({
      onEnd: 1,
      test: true,
    });
  });
});

describe('plugins can use events in fnWrap', () => {
  const game: Game = {
    plugins: [
      {
        name: 'test',
        fnWrap:
          (fn, type) =>
          (G, ctx, ...args) => {
            G = fn(G, ctx, ...args);
            if (G.endTurn && type === GameMethod.MOVE) {
              ctx.events.endTurn();
            }
            if (G.endGame) {
              ctx.events.endGame(G.endGame);
            }
            return G;
          },
      },
    ],
    moves: {
      endGame: () => ({ endGame: true }),
      endTurn: () => ({ endTurn: true }),
    },
  };

  test('plugin can end turn', () => {
    const client = Client({ game });
    client.moves.endTurn();
    expect(client.getState().ctx.turn).toBe(2);
    expect(client.getState().ctx.currentPlayer).toBe('1');
  });

  test('plugin can end game', () => {
    const client = Client({ game });
    client.moves.endGame();
    expect(client.getState().ctx.gameover).toBe(true);
  });
});
