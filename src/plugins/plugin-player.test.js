/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import PluginPlayer from './plugin-player';
import { Client } from '../client/client';

describe('default values', () => {
  test('playerState is not passed', () => {
    const game = {
      plugins: [PluginPlayer],
    };
    const client = Client({ game });
    expect(client.getState().plugins[PluginPlayer.name].data).toEqual({
      players: { '0': {}, '1': {} },
    });
  });

  test('playerState is passed', () => {
    const game = {
      playerSetup: () => ({ A: 1 }),
      plugins: [PluginPlayer],
    };
    const client = Client({ game });
    expect(client.getState().plugins[PluginPlayer.name].data).toEqual({
      players: { '0': { A: 1 }, '1': { A: 1 } },
    });
  });
});

describe('2 player game', () => {
  let client;

  beforeAll(() => {
    const game = {
      moves: {
        A: (_, ctx) => {
          ctx.player.set({ field: 'A1' });
          ctx.player.opponent.set({ field: 'A2' });
        },

        B: (G, ctx) => {
          G.playerValue = ctx.player.get().field;
          G.opponentValue = ctx.player.opponent.get().field;
        },
      },

      plugins: [PluginPlayer],
    };

    client = Client({ game });
  });

  test('player 0 turn', () => {
    client.moves.A();
    expect(client.getState().plugins[PluginPlayer.name].data).toEqual({
      players: {
        '0': { field: 'A1' },
        '1': { field: 'A2' },
      },
    });
  });

  test('player 1 turn', () => {
    client.events.endTurn();
    client.moves.A();
    expect(client.getState().plugins[PluginPlayer.name].data).toEqual({
      players: {
        '0': { field: 'A2' },
        '1': { field: 'A1' },
      },
    });
  });

  test('player 1 makes move B', () => {
    client.moves.B();
    expect(client.getState().G).toEqual({
      playerValue: 'A1',
      opponentValue: 'A2',
    });
  });
});

describe('3 player game', () => {
  let client;

  beforeAll(() => {
    const game = {
      moves: {
        A: (_, ctx) => {
          ctx.player.set({ field: 'A' });
        },
      },

      plugins: [PluginPlayer],
    };

    client = Client({ game, numPlayers: 3 });
  });

  test('G.opponent is not created', () => {
    client.moves.A();
    expect(client.getState().plugins[PluginPlayer.name].data).toEqual({
      players: {
        '0': { field: 'A' },
        '1': {},
        '2': {},
      },
    });
  });
});

describe('game with phases', () => {
  let client;

  beforeAll(() => {
    const game = {
      playerSetup: id => ({ id }),
      plugins: [PluginPlayer],
      phases: {
        phase: {},
      },
    };

    client = Client({ game });
  });

  test('includes playerSetup state', () => {
    expect(client.getState().plugins[PluginPlayer.name].data).toEqual({
      players: {
        0: {
          id: '0',
        },
        1: {
          id: '1',
        },
      },
    });
  });
});
