/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import Game from '../core/game';
import { createGameReducer } from '../core/reducer';
import { makeMove } from '../core/action-creators';
import { Simulate } from './ai';

test('next', () => {
  let game = Game({
    moves: {
      A: () => ({ next: 'A' }),
      B: () => ({ next: 'B' }),
    },

    ai: {
      next: G => [{ move: G.next, args: [] }],
    },
  });

  const reducer = createGameReducer({ game, numPlayers: 2 });

  let state = reducer(undefined, { type: 'init' });

  {
    state = reducer(state, makeMove('A'));
    const moves = game.ai.next(state.G, state.ctx);
    expect(moves.length).toBe(1);
    expect(moves[0].move).toBe('A');
    expect(moves[0].args).toEqual([]);
  }

  {
    state = reducer(state, makeMove('B'));
    const moves = game.ai.next(state.G, state.ctx);
    expect(moves.length).toBe(1);
    expect(moves[0].move).toBe('B');
    expect(moves[0].args).toEqual([]);
  }
});

test('Simulate', () => {
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

    for (let pos of positions) {
      const symbol = cells[pos[0]];
      let winner = symbol;
      for (let i of pos) {
        if (cells[i] != symbol) {
          winner = null;
          break;
        }
      }
      if (winner != null) return true;
    }

    return false;
  }

  const TicTacToe = Game({
    setup: () => ({
      cells: Array(9).fill(null),
    }),

    moves: {
      clickCell(G, ctx, id) {
        const cells = [...G.cells];
        if (cells[id] === null) {
          cells[id] = ctx.currentPlayer;
        }
        return { ...G, cells };
      },
    },

    flow: {
      movesPerTurn: 1,

      endGameIf: (G, ctx) => {
        if (IsVictory(G.cells)) {
          return ctx.currentPlayer;
        }
      },
    },

    ai: {
      next: G => {
        let r = [];
        for (let i = 0; i < 9; i++) {
          if (G.cells[i] === null) {
            r.push({ move: 'clickCell', args: [i] });
          }
        }
        return r;
      },
    },
  });

  const numPlayers = 2;
  const reducer = createGameReducer({ game: TicTacToe, numPlayers });
  const state = reducer(undefined, { type: 'init' });
  const endState = Simulate({ game: TicTacToe, numPlayers, state });

  expect(endState.G.cells).toEqual([
    '0',
    '1',
    '0',
    '1',
    '0',
    '1',
    '0',
    null,
    null,
  ]);
  expect(endState.ctx.gameover).not.toBe(undefined);
});
