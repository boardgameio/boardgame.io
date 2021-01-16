/*
 * Copyright 2019 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { Client } from '../client/client';
import { Local } from '../client/transport/local';
import type { Game, Plugin } from '../types';

describe('basic', () => {
  let client: ReturnType<typeof Client>;

  beforeAll(() => {
    interface TestPluginAPI {
      get(): number;
      increment(): number;
    }

    const TestPlugin = (init: {
      n: number;
    }): Plugin<TestPluginAPI, { n: number }> => ({
      name: 'test',

      setup: () => init,

      api: ({ data }) => {
        const state = { value: data.n };
        const increment = () => state.value++;
        const get = () => state.value;
        return { increment, get };
      },

      flush: ({ api }) => ({ n: api.get() }),

      fnWrap: (fn) => (context) => {
        const G = fn(context);
        return { ...G, wrap: true };
      },
    });

    const game: Game<
      { beginA: number; endA: number; onMove: number; onTurnEnd: number },
      { test: TestPluginAPI }
    > = {
      moves: {
        A: ({ G, test }) => {
          G.beginA = test.get();
          test.increment();
          G.endA = test.get();
        },
      },

      endIf: ({ test }) => {
        if (test === undefined) {
          throw new Error('API is not defined');
        }
      },

      turn: {
        onMove: ({ G, test }) => {
          G.onMove = test.get();
          test.increment();
        },

        onEnd: ({ G, test }) => {
          G.onTurnEnd = test.get();
          test.increment();
        },
      },

      plugins: [TestPlugin({ n: 10 })],
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

  const game: Game = {
    moves: { A: () => {} },
    plugins: [plugin, anotherPlugin],
  };

  test('are used if no setup is present', () => {
    const client = Client({ game, playerID: '0', multiplayer: Local() });
    client.start();
    client.moves.A();
    expect(client.getState().plugins.test.data).toEqual(pluginData);
  });
});

describe('actions', () => {
  let client: ReturnType<typeof Client>;

  beforeAll(() => {
    const game: Game = {
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
    const game: Game = {
      moves: {
        stop: ({ events }) => events.endTurn(),
      },
      turn: {
        onBegin: ({ G, random }) => {
          G.onBegin = random.Die(1);
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
    const game: Game = {
      moves: {
        stop: ({ events }) => events.endTurn(),
      },
      turn: {
        onEnd: ({ G, random }) => {
          G.onEnd = random.Die(1);
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
    const game: Game = {
      moves: {
        stop: ({ events }) => events.setPhase('second'),
      },
      phases: {
        first: {
          start: true,
        },
        second: {
          onBegin: ({ G, random }) => {
            G.onEnd = random.Die(1);
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
    const game: Game = {
      moves: {
        stop: ({ events }) => events.endPhase(),
      },
      phases: {
        first: {
          start: true,
          onEnd: ({ G, random }) => {
            G.onEnd = random.Die(1);
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
