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
 * Event to change the active players (and their stages) in the current turn.
 * @param {*} state
 * @param {*} arg
 */
export function SetActivePlayersEvent(state, arg) {
  return { ...state, ctx: SetActivePlayers(state.ctx, arg) };
}

export function SetActivePlayers(ctx, arg) {
  let { _prevActivePlayers } = ctx;

  const _nextActivePlayers = arg.next || null;

  if (arg.revert) {
    _prevActivePlayers = _prevActivePlayers.concat(ctx.activePlayers);
  } else {
    _prevActivePlayers = [];
  }

  let activePlayers = {};
  let _activePlayersOnce = false;

  if (arg.value) {
    activePlayers = arg.value;
  }

  if (arg.currentPlayer !== undefined) {
    activePlayers[ctx.currentPlayer] = arg.currentPlayer;
  }

  if (arg.others !== undefined) {
    for (let i = 0; i < ctx.playOrder.length; i++) {
      const playerID = ctx.playOrder[i];
      if (playerID !== ctx.currentPlayer) {
        activePlayers[playerID] = arg.others;
      }
    }
  }

  if (arg.all !== undefined) {
    for (let i = 0; i < ctx.playOrder.length; i++) {
      const playerID = ctx.playOrder[i];
      activePlayers[playerID] = arg.all;
    }
  }

  if (arg.once) {
    _activePlayersOnce = true;
  }

  if (Object.keys(activePlayers).length == 0) {
    activePlayers = null;
  }

  let _activePlayersMoveLimit = null;

  if (arg.moveLimit) {
    if (typeof arg.moveLimit === 'number') {
      if (activePlayers) {
        _activePlayersMoveLimit = {};
        for (const id in activePlayers) {
          _activePlayersMoveLimit[id] = arg.moveLimit;
        }
      }
    } else {
      _activePlayersMoveLimit = {};

      if (arg.moveLimit.value) {
        _activePlayersMoveLimit = arg.moveLimit.value;
      }

      if (
        arg.moveLimit.currentPlayer !== undefined &&
        activePlayers[ctx.currentPlayer]
      ) {
        _activePlayersMoveLimit[ctx.currentPlayer] =
          arg.moveLimit.currentPlayer;
      }

      if (arg.moveLimit.others !== undefined) {
        for (const id in activePlayers) {
          if (id !== ctx.currentPlayer) {
            _activePlayersMoveLimit[id] = arg.moveLimit.others;
          }
        }
      }

      if (Object.keys(activePlayers).length == 0) {
        activePlayers = null;
      }
    }
  }

  return {
    ...ctx,
    activePlayers,
    _activePlayersOnce,
    _prevActivePlayers,
    _nextActivePlayers,
    _activePlayersMoveLimit,
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
 * Called at the start of a turn to initialize turn order state.
 *
 * TODO: This is called inside StartTurn, which is called from
 * both UpdateTurn and StartPhase (so it's called at the beginning
 * of a new phase as well as between turns). We should probably
 * split it into two.
 *
 * @param {object} G - The game object G.
 * @param {object} ctx - The game object ctx.
 * @param {object} turn - A turn object for this phase.
 */
export function InitTurnOrderState(G, ctx, turn) {
  const order = turn.order;

  let playOrder = [...new Array(ctx.numPlayers)].map((d, i) => i + '');
  if (order.playOrder !== undefined) {
    playOrder = order.playOrder(G, ctx);
  }

  const playOrderPos = order.first(G, ctx);
  const currentPlayer = getCurrentPlayer(playOrder, playOrderPos);

  ctx = { ...ctx, currentPlayer, playOrderPos, playOrder };
  ctx = SetActivePlayers(ctx, turn.activePlayers || {});

  return ctx;
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
  const order = turn.order;

  let playOrderPos = ctx.playOrderPos;
  let currentPlayer = ctx.currentPlayer;
  let endPhase = false;

  if (endTurnArg && endTurnArg !== true) {
    if (ctx.playOrder.includes(endTurnArg.next)) {
      playOrderPos = ctx.playOrder.indexOf(endTurnArg.next);
      currentPlayer = endTurnArg.next;
    } else {
      logging.error(`invalid argument to endTurn: ${endTurnArg}`);
    }
  } else {
    const t = order.next(G, ctx);

    if (t === undefined) {
      endPhase = true;
    } else {
      playOrderPos = t;
      currentPlayer = getCurrentPlayer(ctx.playOrder, playOrderPos);
    }
  }

  ctx = {
    ...ctx,
    playOrderPos,
    currentPlayer,
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
   * RESET
   *
   * Similar to DEFAULT, but starts from 0 each time.
   */
  RESET: {
    first: () => 0,
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

export const Stage = {
  NULL: null,
};

export const ActivePlayers = {
  /**
   * ALL
   *
   * The turn stays with one player, but any player can play (in any order)
   * until the phase ends.
   */
  ALL: { all: Stage.NULL },

  /**
   * ALL_ONCE
   *
   * The turn stays with one player, but any player can play (once, and in any order).
   * This is typically used in a phase where you want to elicit a response
   * from every player in the game.
   */
  ALL_ONCE: { all: Stage.NULL, once: true },

  /**
   * OTHERS
   *
   * The turn stays with one player, and every *other* player can play (in any order)
   * until the phase ends.
   */
  OTHERS: { others: Stage.NULL },

  /**
   * OTHERS_ONCE
   *
   * The turn stays with one player, and every *other* player can play (once, and in any order).
   * This is typically used in a phase where you want to elicit a response
   * from every *other* player in the game.
   */
  OTHERS_ONCE: { others: Stage.NULL, once: true },
};
