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
  const playerID = ctx.playerID;
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
 * @param {object} arg - An array of playerID's or <object> of:
 *   {
 *     value: [],   // array of playerID's (optional if all is set).
 *     all: true,   // set value to all playerID's
 *     once: true,  // players have one move.
 *   }
 */
export function SetActionPlayers(state, arg) {
  let actionPlayers = [];

  if (arg.value) {
    actionPlayers = arg.value;
  }
  if (arg.all) {
    actionPlayers = [...state.ctx.playOrder];
  }

  if (arg.allOthers) {
    actionPlayers = [...state.ctx.playOrder].filter(
      nr => nr !== state.ctx.currentPlayer
    );
  }

  if (Array.isArray(arg)) {
    actionPlayers = arg;
  }

  return {
    ...state,
    ctx: {
      ...state.ctx,
      actionPlayers,
      _actionPlayersOnce: arg.once,
      _actionPlayersAllOthers: arg.allOthers,
    },
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
 * @param {object} turnOrder - A turn order object for this phase.
 */
export function InitTurnOrderState(G, ctx, turnOrder) {
  let playOrderPos;
  let actionPlayers;

  const t = turnOrder.first(G, ctx);

  if (t.playOrderPos !== undefined) {
    playOrderPos = t.playOrderPos;
  } else {
    playOrderPos = t;
  }

  const currentPlayer = getCurrentPlayer(ctx.playOrder, playOrderPos);

  if (t.actionPlayers !== undefined) {
    actionPlayers = t.actionPlayers;
  } else {
    actionPlayers = [currentPlayer];
  }

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
  let actionPlayers = ctx.actionPlayers;
  let endPhase = false;

  if (ctx.playOrder.includes(nextPlayer)) {
    playOrderPos = ctx.playOrder.indexOf(nextPlayer);
    currentPlayer = nextPlayer;
    actionPlayers = [currentPlayer];
  } else {
    const t = turnOrder.next(G, ctx);

    if (t == undefined) {
      endPhase = true;
    } else {
      if (t.playOrderPos !== undefined) {
        playOrderPos = t.playOrderPos;
      } else {
        playOrderPos = t;
      }

      currentPlayer = getCurrentPlayer(ctx.playOrder, playOrderPos);

      if (t.actionPlayers !== undefined) {
        actionPlayers = t.actionPlayers;
      } else {
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
 * These are meant to be passed to the `turnOrder` setting
 * in the flow objects.
 *
 * Each object defines the first player when the phase / game
 * begins, and also a function `next` to determine who the
 * next player is when the turn ends.
 *
 * first / next can also return an object of type
 * { playOrderPos, actionPlayers }
 * in which case they can also set actionPlayers simultaneously.
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
   * currentPlayer switches around in round-robin fashion, but any player can play on each turn.
   */
  ANY: {
    first: (G, ctx) => {
      return {
        actionPlayers: [...ctx.playOrder],
        playOrderPos: ctx.playOrderPos,
      };
    },
    next: (G, ctx) => {
      const playOrderPos = (ctx.playOrderPos + 1) % ctx.playOrder.length;
      return { actionPlayers: [...ctx.playOrder], playOrderPos };
    },
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
