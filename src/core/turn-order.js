/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

/**
 * Standard move that simulates passing.
 *
 * Creates two objects in G:
 * passOrder - An array of playerIDs capturing passes in the pass order.
 * allPassed - Set to true when all players have passed.
 */
export const Pass = (G, ctx) => {
  let passOrder = [];
  if (G.passOrder !== undefined) {
    passOrder = G.passOrder;
  }
  const playerID =
    ctx.currentPlayer === 'any' ? ctx.playerID : ctx.currentPlayer;
  passOrder.push(playerID);
  G = { ...G, passOrder };
  if (passOrder.length >= ctx.numPlayers) {
    G.allPassed = true;
  }
  return G;
};

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
    first: (G, ctx) => ctx.playerOrder[0] + '',
    next: (G, ctx) => {
      let playerPos = ctx.playerOrder.findIndex(x => x == ctx.currentPlayer);
      return ctx.playerOrder[(playerPos + 1) % ctx.numPlayers] + '';
    },
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
   * Meant to be used with Pass above.
   */

  SKIP: {
    first: (G, ctx) => ctx.playerOrder[0] + '',
    next: (G, ctx) => {
      if (G.allPassed) return;
      let player = ctx.currentPlayer;
      for (let i = 0; i < ctx.numPlayers; i++) {
        let playerPos = ctx.playerOrder.findIndex(x => x == player);
        player = ctx.playerOrder[(playerPos + 1) % ctx.numPlayers] + '';
        if (!G.passOrder.includes(player)) {
          return player;
        }
      }
    },
  },
};
