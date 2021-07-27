/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { ProcessGameConfig } from './game';
import { Client } from '../client/client';
import { error } from '../core/logger';
import { InitializeGame } from './initialize';
import type { Game } from '../types';

jest.mock('../core/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
}));

describe('basic', () => {
  let game;
  beforeAll(() => {
    game = ProcessGameConfig({
      moves: {
        A: ({ G }) => G,
        B: () => null,
        C: {
          move: () => 'C',
        },
      },

      phases: {
        PA: {
          moves: {
            A: () => 'PA.A',
          },
        },
      },
    });
  });

  test('sanity', () => {
    expect(game.moveNames).toEqual(['A', 'B', 'C']);
    expect(typeof game.processMove).toEqual('function');
  });

  test('processMove', () => {
    const G = { test: true };
    const ctx = { phase: '' };
    const state = { G, ctx, plugins: {} };

    expect(game.processMove(state, { type: 'A' })).toEqual(G);
    expect(game.processMove(state, { type: 'D' })).toEqual(G);
    expect(game.processMove(state, { type: 'B' })).toEqual(null);

    state.ctx.phase = 'PA';
    expect(game.processMove(state, { type: 'A' })).toEqual('PA.A');
  });

  test('long-form move syntax', () => {
    expect(
      game.processMove({ ctx: { phase: '' }, plugins: {} }, { type: 'C' })
    ).toEqual('C');
  });
});

// Following turn order is often used in worker placement games like Agricola and Viticulture.
test('rounds with starting player token', () => {
  const game: Game = {
    setup: () => ({ startingPlayerToken: 0 }),

    moves: {
      takeStartingPlayerToken: ({ G, ctx }) => {
        G.startingPlayerToken = ctx.currentPlayer;
      },
    },

    phases: {
      main: {
        start: true,
        turn: {
          order: {
            first: ({ G }) => G.startingPlayerToken,
            next: ({ ctx }) => (+ctx.playOrderPos + 1) % ctx.playOrder.length,
          },
        },
      },
    },
  };

  const client = Client({ game, numPlayers: 4 });

  expect(client.getState().ctx.currentPlayer).toBe('0');

  client.events.endTurn();
  expect(client.getState().ctx.currentPlayer).toBe('1');

  client.events.endTurn();
  expect(client.getState().ctx.currentPlayer).toBe('2');

  client.moves.takeStartingPlayerToken();
  client.events.endTurn();
  expect(client.getState().ctx.currentPlayer).toBe('3');

  client.events.endTurn();
  client.events.setPhase('main');
  expect(client.getState().ctx.currentPlayer).toBe('2');

  client.events.endTurn();
  expect(client.getState().ctx.currentPlayer).toBe('3');

  client.events.endTurn();
  expect(client.getState().ctx.currentPlayer).toBe('0');
});

// The following pattern is used in Catan, Twilight Imperium, and (sort of) Powergrid.
test('serpentine setup phases', () => {
  const game: Game = {
    phases: {
      'first setup round': {
        start: true,
        turn: {
          order: {
            first: () => 0,
            next: ({ ctx }) => (+ctx.playOrderPos + 1) % ctx.playOrder.length,
          },
        },
        next: 'second setup round',
      },
      'second setup round': {
        turn: {
          order: {
            first: ({ ctx }) => ctx.playOrder.length - 1,
            next: ({ ctx }) => (+ctx.playOrderPos - 1) % ctx.playOrder.length,
          },
        },
        next: 'main phase',
      },
      'main phase': {
        turn: {
          order: {
            first: () => 0,
            next: ({ ctx }) => (+ctx.playOrderPos + 1) % ctx.playOrder.length,
          },
        },
      },
    },
  };

  const numPlayers = 4;
  const client = Client({ game, numPlayers });

  expect(client.getState().ctx.currentPlayer).toBe('0');
  expect(client.getState().ctx.phase).toBe('first setup round');

  client.events.endTurn();
  expect(client.getState().ctx.currentPlayer).toBe('1');
  expect(client.getState().ctx.phase).toBe('first setup round');

  client.events.endTurn();
  expect(client.getState().ctx.currentPlayer).toBe('2');
  expect(client.getState().ctx.phase).toBe('first setup round');

  client.events.endTurn();
  expect(client.getState().ctx.currentPlayer).toBe('3');
  expect(client.getState().ctx.phase).toBe('first setup round');

  client.events.endTurn();
  client.events.endPhase();
  expect(client.getState().ctx.currentPlayer).toBe('3');
  expect(client.getState().ctx.phase).toBe('second setup round');

  client.events.endTurn();
  expect(client.getState().ctx.currentPlayer).toBe('2');
  expect(client.getState().ctx.phase).toBe('second setup round');

  client.events.endTurn();
  expect(client.getState().ctx.currentPlayer).toBe('1');
  expect(client.getState().ctx.phase).toBe('second setup round');

  client.events.endTurn();
  expect(client.getState().ctx.currentPlayer).toBe('0');
  expect(client.getState().ctx.phase).toBe('second setup round');

  client.events.endTurn();
  client.events.endPhase();
  expect(client.getState().ctx.currentPlayer).toBe('0');
  expect(client.getState().ctx.phase).toBe('main phase');

  client.events.endTurn();
  expect(client.getState().ctx.currentPlayer).toBe('1');
  expect(client.getState().ctx.phase).toBe('main phase');

  client.events.endTurn();
  expect(client.getState().ctx.currentPlayer).toBe('2');
  expect(client.getState().ctx.phase).toBe('main phase');

  client.events.endTurn();
  expect(client.getState().ctx.currentPlayer).toBe('3');
  expect(client.getState().ctx.phase).toBe('main phase');

  client.events.endTurn();
  expect(client.getState().ctx.currentPlayer).toBe('0');
  expect(client.getState().ctx.phase).toBe('main phase');

  client.events.endTurn();
  expect(client.getState().ctx.currentPlayer).toBe('1');
  expect(client.getState().ctx.phase).toBe('main phase');

  client.events.endTurn();
  expect(client.getState().ctx.currentPlayer).toBe('2');
  expect(client.getState().ctx.phase).toBe('main phase');

  client.events.endTurn();
  expect(client.getState().ctx.currentPlayer).toBe('3');
  expect(client.getState().ctx.phase).toBe('main phase');

  client.events.endTurn();
  expect(client.getState().ctx.currentPlayer).toBe('0');
  expect(client.getState().ctx.phase).toBe('main phase');

  client.events.endTurn();
  expect(client.getState().ctx.currentPlayer).toBe('1');
  expect(client.getState().ctx.phase).toBe('main phase');
});

describe('config errors', () => {
  test('game name with spaces', () => {
    const game = () => {
      ProcessGameConfig({ name: 'tic tac toe' });
    };
    expect(game).toThrow();
  });

  test('plugin name with spaces', () => {
    const plugins = [
      {
        name: 'my cool plugin',
        api: () => {},
      },
    ];
    const game = () => {
      ProcessGameConfig({ plugins });
    };
    expect(game).toThrow();
  });

  test('plugin name missing', () => {
    const plugins = [
      {
        api: () => {},
      },
    ];
    const game = () => {
      ProcessGameConfig({ plugins } as unknown as Game);
    };
    expect(game).toThrow();
  });

  test('invalid move object', () => {
    const game = ProcessGameConfig({ moves: { A: 1 } } as unknown as Game);
    const state = InitializeGame({ game });
    game.processMove(state, { type: 'A', args: null, playerID: '0' });
    expect(error).toBeCalledWith(
      expect.stringContaining('invalid move object')
    );
  });
});

describe('disableUndo', () => {
  test('set disableUndo to false by default', () => {
    const game = ProcessGameConfig({
      moves: {},
    });
    expect(game.disableUndo).toBeFalsy();
  });

  test('set disableUndo to true', () => {
    const game = ProcessGameConfig({
      moves: {},
      disableUndo: true,
    });

    expect(game.disableUndo).toBeTruthy();
  });
});
