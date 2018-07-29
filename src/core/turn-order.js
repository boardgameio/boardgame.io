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
 * Event to change the actionPlayers array.
 * @param {object} state - The game state.
 * @param {object} actionPlayers - An array of playerID's or
 *                                 TurnOrder.ALL.
 */
export function ChangeActionPlayers(state, actionPlayers) {
  if (actionPlayers == TurnOrder.ALL) {
    actionPlayers = [...state.ctx.playOrder];
    return { ...state, ctx: { ...state.ctx, actionPlayers } };
  }

  if (actionPlayers && actionPlayers.length) {
    return { ...state, ctx: { ...state.ctx, actionPlayers } };
  }

  return state;
}

/**
 * Converts a playOrderPos index into its value in playOrder.
 * @param {Array} playOrder - An array of player ID's.
 * @param {number} playOrderPos - An index into the above.
 */
function getCurrentPlayer(playOrder, playOrderPos) {
  if (playOrderPos === undefined) {
    return 'any';
  }
  return playOrder[playOrderPos] + '';
}

/**
 * Called at the start of a phase to initialize turn order state.
 * @param {object} G - The game object G.
 * @param {object} ctx - The game object ctx.
 * @param {object} turnOrder - A turn order object for this phase.
 */
export function InitTurnOrderState(G, ctx, turnOrder) {
  const playOrderPos = turnOrder.first(G, ctx);
  const currentPlayer = getCurrentPlayer(ctx.playOrder, playOrderPos);
  const actionPlayers = [currentPlayer];
  return { ...ctx, currentPlayer, playOrderPos, actionPlayers };
}

/**
 * Called at the end of each turn to update the turn order state.
 * @param {object} G - The game object G.
 * @param {object} ctx - The game object ctx.
 * @param {object} turnOrder - A turn order object for this phase.
 * @param {string} nextPlayer - An optional argument to endTurn that
                                may specify the next player.
 */
export function UpdateTurnOrderState(G, ctx, turnOrder, nextPlayer) {
  let playOrderPos = ctx.playOrderPos;
  let currentPlayer = ctx.currentPlayer;

  if (nextPlayer === 'any') {
    playOrderPos = undefined;
    currentPlayer = nextPlayer;
  } else if (ctx.playOrder.includes(nextPlayer)) {
    playOrderPos = ctx.playOrder.indexOf(nextPlayer);
    currentPlayer = nextPlayer;
  } else {
    playOrderPos = turnOrder.next(G, ctx);
    currentPlayer = getCurrentPlayer(ctx.playOrder, playOrderPos);
  }

  const actionPlayers = [currentPlayer];

  return {
    ...ctx,
    playOrderPos,
    currentPlayer,
    actionPlayers,
  };
}

export const TurnOrder = {
  /**
   * Constant that can be used as an argument to
   * changeActionPlayers to make it set actionPlayers
   * to all the players in the game.
   */
  ALL: 'all',

  /**
   * Set of different turn orders possible in a phase.
   * These are meant to be passed to the `turnOrder` setting
   * in the flow objects.
   *
   * Each object defines the first player when the phase / game
   * begins, and also a function `next` to determine who the
   * next player is when the turn ends.
   */

  /**
   * DEFAULT
   *
   * The default round-robin turn order.
   */
  DEFAULT: {
    first: (G, ctx) => ctx.playOrderPos,
    next: (G, ctx) => (ctx.playOrderPos + 1) % ctx.playOrder.length,
  },

  /**
   * ANY
   *
   * Any player can play and there isn't a currentPlayer really.
   */
  ANY: {
    first: () => undefined,
    next: () => undefined,
  },

  /**
   * SKIP
   *
   * Round-robin, but skips over any players that have passed.
   * Meant to be used with Pass above.
   */

  SKIP: {
    first: (G, ctx) => ctx.playOrderPos,
    next: (G, ctx) => {
      if (G.allPassed) return;
      let playOrderPos = ctx.playOrderPos;
      for (let i = 0; i < ctx.playOrder.length; i++) {
        playOrderPos = (playOrderPos + 1) % ctx.playOrder.length;
        if (!G.passOrder.includes(ctx.playOrder[playOrderPos] + '')) {
          return playOrderPos;
        }
      }
    },
  },
};
