/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import PluginPlayer from './plugin-player';
import Game from '../core/game';
import { InitializeGame, CreateGameReducer } from '../core/reducer';
import { makeMove, gameEvent } from '../core/action-creators';

describe('default values', () => {
  test('playerState is not passed', () => {
    const game = Game({
      plugins: [PluginPlayer],
    });
    const state = InitializeGame({ game });
    expect(state.G).toEqual({ players: { '0': {}, '1': {} } });
  });

  test('playerState is passed', () => {
    const game = Game({
      playerSetup: () => ({ A: 1 }),
      plugins: [PluginPlayer],
    });
    const state = InitializeGame({ game });
    expect(state.G).toEqual({ players: { '0': { A: 1 }, '1': { A: 1 } } });
  });
});

describe('2 player game', () => {
  let game;
  let state;
  let reducer;

  beforeAll(() => {
    game = Game({
      moves: {
        A: G => {
          G.player.field = 'A1';
          G.opponent.field = 'A2';
        },
      },

      plugins: [PluginPlayer],
    });

    reducer = CreateGameReducer({ game });
    state = InitializeGame({ game });
  });

  test('player 0 turn', () => {
    state = reducer(state, makeMove('A'));
    expect(state.G).toEqual({
      players: {
        '0': { field: 'A1' },
        '1': { field: 'A2' },
      },
    });
  });

  test('player 1 turn', () => {
    state = reducer(state, gameEvent('endTurn'));
    state = reducer(state, makeMove('A'));
    expect(state.G).toEqual({
      players: {
        '0': { field: 'A2' },
        '1': { field: 'A1' },
      },
    });
  });
});

describe('3 player game', () => {
  let game;
  let state;
  let reducer;

  beforeAll(() => {
    game = Game({
      moves: {
        A: G => {
          G.player.field = 'A';
          G.fields = Object.keys(G);
        },
      },

      plugins: [PluginPlayer],
    });

    reducer = CreateGameReducer({ game });
    state = InitializeGame({ game, numPlayers: 3 });
  });

  test('G.opponent is not created', () => {
    state = reducer(state, makeMove('A'));
    expect(state.G).toEqual({
      players: {
        '0': { field: 'A' },
        '1': {},
        '2': {},
      },
      fields: ['players', 'player'],
    });
  });
});
