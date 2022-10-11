/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import PluginPlayer from './plugin-player';
import type { PlayerAPI } from './plugin-player';
import { Client } from '../client/client';
import type { Game } from '../types';

describe('default values', () => {
  test('playerState is not passed', () => {
    const plugin = PluginPlayer();
    const game: Game<any, { player: PlayerAPI }> = {
      plugins: [plugin],
    };
    const client = Client({ game });
    expect(client.getState().plugins[plugin.name].data).toEqual({
      players: { '0': {}, '1': {} },
    });
  });

  test('playerState is passed', () => {
    const plugin = PluginPlayer({ setup: () => ({ A: 1 }) });
    const game: Game<any, { player: PlayerAPI }> = {
      plugins: [plugin],
    };
    const client = Client({ game });
    expect(client.getState().plugins[plugin.name].data).toEqual({
      players: { '0': { A: 1 }, '1': { A: 1 } },
    });
  });
});

describe('2 player game', () => {
  let client;

  beforeAll(() => {
    const game: Game<any, { player: PlayerAPI }> = {
      moves: {
        A: ({ player }) => {
          player.set({ field: 'A1' });
          player.opponent.set({ field: 'A2' });
        },

        B: ({ G, player }) => {
          G.playerValue = player.get().field;
          G.opponentValue = player.opponent.get().field;
        },
      },

      plugins: [PluginPlayer()],
    };

    client = Client({ game });
  });

  test('player 0 turn', () => {
    client.moves.A();
    expect(client.getState().plugins[PluginPlayer().name].data).toEqual({
      players: {
        '0': { field: 'A1' },
        '1': { field: 'A2' },
      },
    });
  });

  test('player 1 turn', () => {
    client.events.endTurn();
    client.moves.A();
    expect(client.getState().plugins[PluginPlayer().name].data).toEqual({
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
    const game: Game<any, { player: PlayerAPI }> = {
      moves: {
        A: ({ player }) => {
          player.set({ field: 'A' });
        },
      },

      plugins: [PluginPlayer()],
    };

    client = Client({ game, numPlayers: 3 });
  });

  test('G.opponent is not created', () => {
    client.moves.A();
    expect(client.getState().plugins[PluginPlayer().name].data).toEqual({
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
    const game: Game<any, { player: PlayerAPI }> = {
      plugins: [PluginPlayer({ setup: (id) => ({ id }) })],
      phases: {
        phase: {},
      },
    };

    client = Client({ game });
  });

  test('includes playerSetup state', () => {
    expect(client.getState().plugins[PluginPlayer().name].data).toEqual({
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

describe('with playerView', () => {
  const plugin = PluginPlayer({
    setup: (id) => ({ id }),
    playerView: (players, playerID) => ({
      [playerID]: players[playerID],
    }),
  });
  const game = {
    plugins: [plugin],
  };

  test('spectator doesn’t see player state', () => {
    const spectator = Client({ game });
    expect(spectator.getState().plugins[plugin.name].data).toEqual({
      players: {},
    });
  });

  test('player only sees own state', () => {
    const client = Client({ game, playerID: '0' });
    expect(client.getState().plugins[plugin.name].data).toEqual({
      players: { '0': { id: '0' } },
    });
  });
});
