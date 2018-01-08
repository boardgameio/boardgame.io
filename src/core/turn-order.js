/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

/**
 * Set of different turn orders possible in a phase.
 * These are meant to be passed to the `turnOrder` setting
 * in the flow objects.
 *
 * Each object defines the first player when the phase / game
 * begins, and also a function `next` to determine who the
 * next player is when the turn ends.
 */
export const TurnOrder = {
  /**
   * DEFAULT
   *
   * The default round-robin turn order.
   */
  DEFAULT: {
    first: (G, ctx) => ctx.currentPlayer,
    next: (G, ctx) => ((+ctx.currentPlayer + 1) % ctx.numPlayers + ""),
  },

  /**
   * ANY
   *
   * Any player can play and there isn't a currentPlayer really.
   */
  ANY: {
    first: () => 'any',
    next: () => 'any',
  },

  /**
   * SKIP
   *
   * Round-robin, but skips over any players that have passed.
   */
  SKIP: {
    first: (G, ctx) => ctx.currentPlayer,
    next: (G, ctx) => {
      if (ctx.allPassed) return;
      let nextPlayer = ctx.currentPlayer;
      for (let i = 0; i < ctx.numPlayers; i++) {
        nextPlayer = ((+nextPlayer + 1) % ctx.numPlayers + "");
        if (!(nextPlayer in ctx.passMap)) {
          return nextPlayer;
        }
      }
    }
  },
};
