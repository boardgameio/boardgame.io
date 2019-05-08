/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import * as logging from './logger';

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
  const playerID = ctx.playerID;
  passOrder = [...passOrder, playerID];
  G = { ...G, passOrder };
  if (passOrder.length >= ctx.numPlayers) {
    G = { ...G, allPassed: true };
  }
  return G;
};

/**
 * Event to change the actionPlayers array.
 * @param {object} state - The game state.
 * @param {object} arg - An array of playerID's or <object> of:
 *   {
 *     value: (G, ctx) => [],        // function that returns an array of playerID's (optional if all is set)
 *
 *     all: true,        // set value to all playerID's
 *
 *     others: true,     // set value to all except currentPlayer.
 *
 *     once: true,       // players have one move
 *                       // (after which they're pruned from actionPlayers).
 *                       // The phase ends once actionPlayers becomes empty.
 *   }
 */
export function SetActionPlayersEvent(state, arg) {
  return { ...state, ctx: setActionPlayers(state.G, state.ctx, arg) };
}

function setActionPlayers(G, ctx, arg) {
  let actionPlayers = [];

  if (arg.value) {
    actionPlayers = arg.value(G, ctx);
  }
  if (arg.all) {
    actionPlayers = [...ctx.playOrder];
  }

  if (arg.others) {
    actionPlayers = [...ctx.playOrder].filter(nr => nr !== ctx.currentPlayer);
  }

  if (Array.isArray(arg)) {
    actionPlayers = arg;
  }

  return {
    ...ctx,
    actionPlayers,
    _actionPlayersOnce: arg.once || false,
  };
}

/**
 * Converts a playOrderPos index into its value in playOrder.
 * @param {Array} playOrder - An array of player ID's.
 * @param {number} playOrderPos - An index into the above.
 */
function getCurrentPlayer(playOrder, playOrderPos) {
  return playOrder[playOrderPos] + '';
}

/**
 * Called at the start of a phase to initialize turn order state.
 * @param {object} G - The game object G.
 * @param {object} ctx - The game object ctx.
 * @param {object} turn - A turn object for this phase.
 */
export function InitTurnOrderState(G, ctx, turn) {
  if (turn.order === undefined) {
    turn.order = TurnOrder.DEFAULT;
  }

  let playOrder = [...new Array(ctx.numPlayers)].map((d, i) => i + '');
  if (turn.order.playOrder !== undefined) {
    playOrder = turn.order.playOrder(G, ctx);
  }

  const playOrderPos = turn.order.first(G, ctx);
  const currentPlayer = getCurrentPlayer(playOrder, playOrderPos);

  if (turn.order.actionPlayers !== undefined) {
    ctx = setActionPlayers(G, ctx, turn.order.actionPlayers);
  } else {
    ctx = { ...ctx, actionPlayers: [currentPlayer] };
  }

  return { ...ctx, currentPlayer, playOrderPos, playOrder };
}

/**
 * Called at the end of each turn to update the turn order state.
 * @param {object} G - The game object G.
 * @param {object} ctx - The game object ctx.
 * @param {object} turn - A turn object for this phase.
 * @param {string} endTurnArg - An optional argument to endTurn that
                                may specify the next player.
 */
export function UpdateTurnOrderState(G, ctx, turn, endTurnArg) {
  let playOrderPos = ctx.playOrderPos;
  let currentPlayer = ctx.currentPlayer;
  let actionPlayers = ctx.actionPlayers;
  let endPhase = false;

  if (endTurnArg && endTurnArg !== true) {
    if (ctx.playOrder.includes(endTurnArg.next)) {
      playOrderPos = ctx.playOrder.indexOf(endTurnArg.next);
      currentPlayer = endTurnArg.next;
      actionPlayers = [currentPlayer];
    } else {
      logging.error(`invalid argument to endTurn: ${endTurnArg}`);
    }
  } else {
    const t = turn.order.next(G, ctx);

    if (t === undefined) {
      endPhase = true;
    } else {
      playOrderPos = t;
      currentPlayer = getCurrentPlayer(ctx.playOrder, playOrderPos);

      if (turn.order.actionPlayers === undefined) {
        actionPlayers = [currentPlayer];
      }
    }
  }

  ctx = {
    ...ctx,
    playOrderPos,
    currentPlayer,
    actionPlayers,
  };

  return { endPhase, ctx };
}

/**
 * Set of different turn orders possible in a phase.
 * These are meant to be passed to the `turn` setting
 * in the flow objects.
 *
 * Each object defines the first player when the phase / game
 * begins, and also a function `next` to determine who the
 * next player is when the turn ends.
 *
 * Objects can also contain an actionPlayers section which
 * is passed to SetActionPlayers above at the beginning of
 * the phase.
 *
 * The phase ends if next() returns undefined.
 */
export const TurnOrder = {
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
   * ONCE
   *
   * Another round-robin turn order, but goes around just once.
   * The phase ends after all players have played.
   */
  ONCE: {
    first: () => 0,
    next: (G, ctx) => {
      if (ctx.playOrderPos < ctx.playOrder.length - 1) {
        return ctx.playOrderPos + 1;
      }
    },
  },

  /**
   * ANY
   *
   * The turn stays with one player, but any player can play (in any order)
   * until the phase ends.
   */
  ANY: {
    first: (G, ctx) => ctx.playOrderPos,
    next: (G, ctx) => ctx.playOrderPos,
    actionPlayers: { all: true },
  },

  /**
   * ANY_ONCE
   *
   * The turn stays with one player, but any player can play (once, and in any order).
   * This is typically used in a phase where you want to elicit a response
   * from every player in the game.
   */
  ANY_ONCE: {
    first: (G, ctx) => ctx.playOrderPos,
    next: (G, ctx) => ctx.playOrderPos,
    actionPlayers: { all: true, once: true },
    endPhaseOnceDone: true,
  },

  /**
   * OTHERS
   *
   * The turn stays with one player, and every *other* player can play (in any order)
   * until the phase ends.
   */
  OTHERS: {
    first: (G, ctx) => ctx.playOrderPos,
    next: (G, ctx) => ctx.playOrderPos,
    actionPlayers: { others: true },
  },

  /**
   * OTHERS_ONCE
   *
   * The turn stays with one player, and every *other* player can play (once, and in any order).
   * This is typically used in a phase where you want to elicit a response
   * from every *other* player in the game.
   */
  OTHERS_ONCE: {
    first: (G, ctx) => ctx.playOrderPos,
    next: (G, ctx) => ctx.playOrderPos,
    actionPlayers: { others: true, once: true },
    endPhaseOnceDone: true,
  },

  /**
   * CUSTOM
   *
   * Identical to DEFAULT, but also sets playOrder at the
   * beginning of the phase.
   *
   * @param {Array} playOrder - The play order.
   */
  CUSTOM: playOrder => ({
    playOrder: () => playOrder,
    first: () => 0,
    next: (G, ctx) => (ctx.playOrderPos + 1) % ctx.playOrder.length,
  }),

  /**
   * CUSTOM_FROM
   *
   * Identical to DEFAULT, but also sets playOrder at the
   * beginning of the phase to a value specified by a field
   * in G.
   *
   * @param {string} playOrderField - Field in G.
   */
  CUSTOM_FROM: playOrderField => ({
    playOrder: G => G[playOrderField],
    first: () => 0,
    next: (G, ctx) => (ctx.playOrderPos + 1) % ctx.playOrder.length,
  }),

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
