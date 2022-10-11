/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { InitializeGame } from '../core/initialize';
import { Client } from '../client/client';
import { MAKE_MOVE, GAME_EVENT } from '../core/action-types';
import { makeMove } from '../core/action-creators';
import { Step, Simulate } from './ai';
import { RandomBot } from './random-bot';
import { MCTSBot } from './mcts-bot';
import type { Node } from './mcts-bot';
import { ProcessGameConfig } from '../core/game';
import { Stage } from '../core/turn-order';
import type { AnyFn, Game, Ctx } from '../types';

function IsVictory(cells) {
  const positions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  const isRowComplete = (row) => {
    const symbols = row.map((i) => cells[i]);
    return symbols.every((i) => i !== null && i === symbols[0]);
  };

  return positions.map((row) => isRowComplete(row)).includes(true);
}

const TicTacToe = ProcessGameConfig({
  setup: () => ({
    cells: Array.from({ length: 9 }).fill(null),
  }),

  moves: {
    clickCell({ G, ctx }, id: number) {
      const cells = [...G.cells];
      if (cells[id] === null) {
        cells[id] = ctx.currentPlayer;
      }
      return { ...G, cells };
    },
  },

  turn: { minMoves: 1, maxMoves: 1 },

  endIf: ({ G, ctx }) => {
    if (IsVictory(G.cells)) {
      return { winner: ctx.currentPlayer };
    }

    if (G.cells.filter((t) => t == null).length === 0) {
      return { draw: true };
    }
  },
});

const enumerate = (G: any, ctx: Ctx, playerID: string) => {
  const r = [];
  for (let i = 0; i < 9; i++) {
    if (G.cells[i] === null) {
      r.push(makeMove('clickCell', [i], playerID));
    }
  }
  return r;
};

describe('Step', () => {
  test('advances game state', async () => {
    const client = Client<{ moved: boolean }>({
      game: {
        setup: () => ({ moved: false }),

        moves: {
          clickCell({ G }) {
            return { moved: !G.moved };
          },
        },

        endIf({ G }) {
          if (G.moved) return true;
        },

        ai: {
          enumerate: () => [{ move: 'clickCell' }],
        },
      },
    });

    const bot = new RandomBot({ enumerate: client.game.ai.enumerate });
    expect(client.getState().G).toEqual({ moved: false });
    await Step(client, bot);
    expect(client.getState().G).toEqual({ moved: true });
  });

  test('does not crash on empty action', async () => {
    const client = Client({
      game: {
        ai: {
          enumerate: () => [],
        },
      },
    });
    const bot = new RandomBot({ enumerate: client.game.ai.enumerate });
    await expect(Step(client, bot)).resolves.toBeUndefined();
  });

  test('works with stages', async () => {
    const client = Client({
      game: {
        moves: {
          A: ({ G }) => {
            G.moved = true;
          },
        },

        turn: {
          activePlayers: { currentPlayer: 'stage' },
        },

        ai: {
          enumerate: () => [{ move: 'A' }],
        },
      },
    });

    const bot = new RandomBot({ enumerate: client.game.ai.enumerate });
    expect(client.getState().G).not.toEqual({ moved: true });
    await Step(client, bot);
    expect(client.getState().G).toEqual({ moved: true });
  });
});

describe('Simulate', () => {
  const bots = {
    '0': new RandomBot({ seed: 'test', enumerate }),
    '1': new RandomBot({ seed: 'test', enumerate }),
  };

  test('multiple bots', async () => {
    const state = InitializeGame({ game: TicTacToe });
    const { state: endState } = await Simulate({
      game: TicTacToe,
      bots,
      state,
    });
    expect(endState.ctx.gameover).not.toBe(undefined);
  });

  test('single bot', async () => {
    const bot = new RandomBot({ seed: 'test', enumerate });
    const state = InitializeGame({ game: TicTacToe });
    const { state: endState } = await Simulate({
      game: TicTacToe,
      bots: bot,
      state,
      depth: 10,
    });
    expect(endState.ctx.gameover).not.toBe(undefined);
  });

  test('with activePlayers', async () => {
    const game = ProcessGameConfig({
      moves: {
        A: ({ G }) => {
          G.moved = true;
        },
      },
      turn: {
        activePlayers: { currentPlayer: Stage.NULL },
      },
      endIf: ({ G }) => G.moved,
    });

    const bot = new RandomBot({
      seed: 'test',
      enumerate: () => [makeMove('A')],
    });

    const state = InitializeGame({ game });
    const { state: endState } = await Simulate({
      game,
      bots: bot,
      state,
      depth: 1,
    });
    expect(endState.ctx.gameover).not.toBe(undefined);
  });
});

describe('Bot', () => {
  test('random', () => {
    const b = new RandomBot({ enumerate: () => [] });
    expect(b.random()).toBeGreaterThanOrEqual(0);
    expect(b.random()).toBeLessThan(1);
  });

  test('enumerate - makeMove', () => {
    const enumerate = () => [makeMove('move')];
    const b = new RandomBot({ enumerate });
    expect(b.enumerate(undefined, undefined, undefined)[0].type).toBe(
      MAKE_MOVE
    );
  });

  test('enumerate - translate to makeMove', () => {
    const enumerate = () => [{ move: 'move' }];
    const b = new RandomBot({ enumerate });
    expect(b.enumerate(undefined, undefined, undefined)[0].type).toBe(
      MAKE_MOVE
    );
  });

  test('enumerate - translate to gameEvent', () => {
    const enumerate = () => [{ event: 'endTurn' }];
    const b = new RandomBot({ enumerate });
    expect(b.enumerate(undefined, undefined, undefined)[0].type).toBe(
      GAME_EVENT
    );
  });

  test('enumerate - unrecognized', () => {
    const enumerate = (() =>
      [{ unknown: true }] as unknown) as Game['ai']['enumerate'];
    const b = new RandomBot({ enumerate });
    expect(b.enumerate(undefined, undefined, undefined)).toEqual([undefined]);
  });
});

describe('MCTSBot', () => {
  test('game that never ends', async () => {
    const game: Game = {};
    const state = InitializeGame({ game });
    const bot = new MCTSBot({ seed: 'test', game, enumerate: () => [] });
    const { state: endState } = await Simulate({ game, bots: bot, state });
    expect(endState.ctx.turn).toBe(1);
  });

  test('RandomBot vs. MCTSBot', async () => {
    const bots = {
      '0': new RandomBot({ seed: 'test', enumerate }),
      '1': new MCTSBot({
        iterations: 200,
        seed: 'test',
        game: TicTacToe,
        enumerate,
      }),
    };

    const initialState = InitializeGame({ game: TicTacToe });

    for (let i = 0; i < 5; i++) {
      const state = initialState;
      const { state: endState } = await Simulate({
        game: TicTacToe,
        bots,
        state,
      });
      expect(endState.ctx.gameover).not.toEqual({ winner: '0' });
    }
  });

  test('MCTSBot vs. MCTSBot', async () => {
    const initialState = InitializeGame({ game: TicTacToe });
    const iterations = 400;

    for (let i = 0; i < 5; i++) {
      const bots = {
        '0': new MCTSBot({
          seed: i,
          game: TicTacToe,
          enumerate,
          iterations,
          playoutDepth: 50,
        }),
        '1': new MCTSBot({
          seed: i,
          game: TicTacToe,
          enumerate,
          iterations,
        }),
      };
      const state = initialState;
      const { state: endState } = await Simulate({
        game: TicTacToe,
        bots,
        state,
      });
      expect(endState.ctx.gameover).toEqual({ draw: true });
    }
  });

  test('with activePlayers', async () => {
    const game = ProcessGameConfig({
      setup: () => ({ moves: 0 }),
      moves: {
        A: ({ G }) => {
          G.moves++;
        },
      },
      turn: {
        activePlayers: { currentPlayer: Stage.NULL },
      },
      endIf: ({ G }) => G.moves > 5,
    });

    const bot = new MCTSBot({
      seed: 'test',
      game,
      enumerate: () => [makeMove('A')],
    });

    const state = InitializeGame({ game });
    const { state: endState } = await Simulate({
      game,
      bots: bot,
      state,
      depth: 10,
    });
    expect(endState.ctx.gameover).not.toBe(undefined);
  });

  test('objectives', async () => {
    const objectives = () => ({
      'play-on-square-0': {
        checker: (G) => G.cells[0] !== null,
        weight: 10,
      },
    });

    const state = InitializeGame({ game: TicTacToe });

    for (let i = 0; i < 10; i++) {
      const bot = new MCTSBot({
        iterations: 200,
        seed: i,
        game: TicTacToe,
        enumerate,
        objectives,
      });

      const { action } = await bot.play(state, '0');
      expect(action.payload.args).toEqual([0]);
    }
  });

  test('async mode', async () => {
    const initialState = InitializeGame({ game: TicTacToe });
    const bot = new MCTSBot({
      seed: '0',
      game: TicTacToe,
      enumerate,
      iterations: 10,
      playoutDepth: 10,
    });
    bot.setOpt('async', true);
    const action = await bot.play(initialState, '0');
    expect(action).not.toBeUndefined();
  });

  describe('iterations & playout depth', () => {
    test('set opts', () => {
      const bot = new MCTSBot({ game: TicTacToe, enumerate: jest.fn() });
      bot.setOpt('iterations', 1);
      expect(bot.opts()['iterations'].value).toBe(1);
    });

    test('setOpt works on invalid key', () => {
      const bot = new RandomBot({ enumerate: jest.fn() });
      const setInvalidKey = () => bot.setOpt('unknown', 1);
      const getInvalidKey = () => bot.getOpt('unknown');
      expect(setInvalidKey).not.toThrow();
      expect(getInvalidKey).toThrow();
    });

    test('functions', () => {
      const state = InitializeGame({ game: TicTacToe });

      // jump ahead in the game because the example iterations
      // and playoutDepth functions are based on the turn
      state.ctx.turn = 8;

      const { turn, currentPlayer } = state.ctx;

      const enumerateSpy = jest.fn(enumerate);

      const bot = new MCTSBot({
        game: TicTacToe,
        enumerate: enumerateSpy,
        iterations: (G, ctx) => ctx.turn * 100,
        playoutDepth: (G, ctx) => ctx.turn * 10,
      });

      expect(
        (bot.iterations as AnyFn)(null, { turn } as Ctx, currentPlayer)
      ).toBe(turn * 100);
      expect(
        (bot.playoutDepth as AnyFn)(null, { turn } as Ctx, currentPlayer)
      ).toBe(turn * 10);

      // try the playout() function which requests the playoutDepth value
      bot.playout({ state } as Node);

      expect(enumerateSpy).toHaveBeenCalledWith(
        state.G,
        state.ctx,
        currentPlayer
      );

      // then try the play() function which requests the iterations value
      enumerateSpy.mockClear();

      bot.play(state, currentPlayer);

      expect(enumerateSpy).toHaveBeenCalledWith(
        state.G,
        state.ctx,
        currentPlayer
      );
    });
  });
});
