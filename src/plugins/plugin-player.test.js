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
    expect(client.getState().G).toEqual({ players: { '0': {}, '1': {} } });
  });

  test('playerState is passed', () => {
    const game = {
      playerSetup: () => ({ A: 1 }),
      plugins: [PluginPlayer],
    };
    const client = Client({ game });
    expect(client.getState().G).toEqual({
      players: { '0': { A: 1 }, '1': { A: 1 } },
    });
  });
});

describe('2 player game', () => {
  let client;

  beforeAll(() => {
    const game = {
      moves: {
        A: G => {
          G.player.field = 'A1';
          G.opponent.field = 'A2';
        },
      },

      plugins: [PluginPlayer],
    };

    client = Client({ game });
  });

  test('player 0 turn', () => {
    client.moves.A();
    expect(client.getState().G).toEqual({
      players: {
        '0': { field: 'A1' },
        '1': { field: 'A2' },
      },
    });
  });

  test('player 1 turn', () => {
    client.events.endTurn();
    client.moves.A();
    expect(client.getState().G).toEqual({
      players: {
        '0': { field: 'A2' },
        '1': { field: 'A1' },
      },
    });
  });
});

describe('3 player game', () => {
  let client;

  beforeAll(() => {
    const game = {
      moves: {
        A: G => {
          G.player.field = 'A';
          G.fields = Object.keys(G);
        },
      },

      plugins: [PluginPlayer],
    };

    client = Client({ game, numPlayers: 3 });
  });

  test('G.opponent is not created', () => {
    client.moves.A();
    expect(client.getState().G).toEqual({
      players: {
        '0': { field: 'A' },
        '1': {},
        '2': {},
      },
      fields: ['players', 'player'],
    });
  });
});
