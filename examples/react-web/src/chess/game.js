/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import Chess from 'chess.js';

// Helper to instantiate chess.js correctly on
// both browser and Node.
function Load(pgn) {
  let chess = null;
  if (Chess.Chess) {
    chess = new Chess.Chess();
  } else {
    chess = new Chess();
  }
  chess.load_pgn(pgn);
  return chess;
}

const ChessGame = {
  name: 'chess',

  setup: () => ({ pgn: '' }),

  moves: {
    move({ G, ctx }, san) {
      const chess = Load(G.pgn);
      if (
        (chess.turn() == 'w' && ctx.currentPlayer == '1') ||
        (chess.turn() == 'b' && ctx.currentPlayer == '0')
      ) {
        return { ...G };
      }
      chess.move(san);
      return { pgn: chess.pgn() };
    },
  },

  turn: { minMoves: 1, maxMoves: 1 },

  endIf: ({ G }) => {
    const chess = Load(G.pgn);
    if (chess.game_over()) {
      if (
        chess.in_draw() ||
        chess.in_threefold_repetition() ||
        chess.insufficient_material() ||
        chess.in_stalemate()
      ) {
        return 'd';
      }
      if (chess.in_checkmate()) {
        if (chess.turn() == 'w') {
          return 'b';
        } else {
          return 'w';
        }
      }
    }
  },
};

export default ChessGame;
