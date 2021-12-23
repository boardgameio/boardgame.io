/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import * as logging from './logger';
import * as plugin from '../plugins/main';
import type {
  Ctx,
  StageArg,
  ActivePlayersArg,
  PlayerID,
  State,
  TurnConfig,
} from '../types';
import { supportDeprecatedMoveLimit } from './backwards-compatibility';

export function SetActivePlayers(ctx: Ctx, arg: ActivePlayersArg): Ctx {
  let activePlayers: typeof ctx.activePlayers = {};
  let _prevActivePlayers: typeof ctx._prevActivePlayers = [];
  let _nextActivePlayers: ActivePlayersArg | null = null;
  let _activePlayersMinMoves = {};
  let _activePlayersMaxMoves = {};

  if (Array.isArray(arg)) {
    // support a simple array of player IDs as active players
    const value = {};
    arg.forEach((v) => (value[v] = Stage.NULL));
    activePlayers = value;
  } else {
    // process active players argument object

    // stages previously did not enforce minMoves, this behaviour is kept intentionally
    supportDeprecatedMoveLimit(arg);

    if (arg.next) {
      _nextActivePlayers = arg.next;
    }

    if (arg.revert) {
      _prevActivePlayers = [
        ...ctx._prevActivePlayers,
        {
          activePlayers: ctx.activePlayers,
          _activePlayersMinMoves: ctx._activePlayersMinMoves,
          _activePlayersMaxMoves: ctx._activePlayersMaxMoves,
          _activePlayersNumMoves: ctx._activePlayersNumMoves,
        },
      ];
    }

    if (arg.currentPlayer !== undefined) {
      ApplyActivePlayerArgument(
        activePlayers,
        _activePlayersMinMoves,
        _activePlayersMaxMoves,
        ctx.currentPlayer,
        arg.currentPlayer
      );
    }

    if (arg.others !== undefined) {
      for (let i = 0; i < ctx.playOrder.length; i++) {
        const id = ctx.playOrder[i];
        if (id !== ctx.currentPlayer) {
          ApplyActivePlayerArgument(
            activePlayers,
            _activePlayersMinMoves,
            _activePlayersMaxMoves,
            id,
            arg.others
          );
        }
      }
    }

    if (arg.all !== undefined) {
      for (let i = 0; i < ctx.playOrder.length; i++) {
        const id = ctx.playOrder[i];
        ApplyActivePlayerArgument(
          activePlayers,
          _activePlayersMinMoves,
          _activePlayersMaxMoves,
          id,
          arg.all
        );
      }
    }

    if (arg.value) {
      for (const id in arg.value) {
        ApplyActivePlayerArgument(
          activePlayers,
          _activePlayersMinMoves,
          _activePlayersMaxMoves,
          id,
          arg.value[id]
        );
      }
    }

    if (arg.minMoves) {
      for (const id in activePlayers) {
        if (_activePlayersMinMoves[id] === undefined) {
          _activePlayersMinMoves[id] = arg.minMoves;
        }
      }
    }

    if (arg.maxMoves) {
      for (const id in activePlayers) {
        if (_activePlayersMaxMoves[id] === undefined) {
          _activePlayersMaxMoves[id] = arg.maxMoves;
        }
      }
    }
  }

  if (Object.keys(activePlayers).length === 0) {
    activePlayers = null;
  }

  if (Object.keys(_activePlayersMinMoves).length === 0) {
    _activePlayersMinMoves = null;
  }

  if (Object.keys(_activePlayersMaxMoves).length === 0) {
    _activePlayersMaxMoves = null;
  }

  const _activePlayersNumMoves = {};
  for (const id in activePlayers) {
    _activePlayersNumMoves[id] = 0;
  }

  return {
    ...ctx,
    activePlayers,
    _activePlayersMinMoves,
    _activePlayersMaxMoves,
    _activePlayersNumMoves,
    _prevActivePlayers,
    _nextActivePlayers,
  };
}

/**
 * Update activePlayers, setting it to previous, next or null values
 * when it becomes empty.
 * @param ctx
 */
export function UpdateActivePlayersOnceEmpty(ctx: Ctx) {
  let {
    activePlayers,
    _activePlayersMinMoves,
    _activePlayersMaxMoves,
    _activePlayersNumMoves,
    _prevActivePlayers,
    _nextActivePlayers,
  } = ctx;

  if (activePlayers && Object.keys(activePlayers).length === 0) {
    if (_nextActivePlayers) {
      ctx = SetActivePlayers(ctx, _nextActivePlayers);
      ({
        activePlayers,
        _activePlayersMinMoves,
        _activePlayersMaxMoves,
        _activePlayersNumMoves,
        _prevActivePlayers,
      } = ctx);
    } else if (_prevActivePlayers.length > 0) {
      const lastIndex = _prevActivePlayers.length - 1;
      ({
        activePlayers,
        _activePlayersMinMoves,
        _activePlayersMaxMoves,
        _activePlayersNumMoves,
      } = _prevActivePlayers[lastIndex]);
      _prevActivePlayers = _prevActivePlayers.slice(0, lastIndex);
    } else {
      activePlayers = null;
      _activePlayersMinMoves = null;
      _activePlayersMaxMoves = null;
    }
  }

  return {
    ...ctx,
    activePlayers,
    _activePlayersMinMoves,
    _activePlayersMaxMoves,
    _activePlayersNumMoves,
    _prevActivePlayers,
  };
}

/**
 * Apply an active player argument to the given player ID
 * @param {Object} activePlayers
 * @param {Object} _activePlayersMinMoves
 * @param {Object} _activePlayersMaxMoves
 * @param {String} playerID The player to apply the parameter to
 * @param {(String|Object)} arg An active player argument
 */
function ApplyActivePlayerArgument(
  activePlayers: Ctx['activePlayers'],
  _activePlayersMinMoves: Ctx['_activePlayersMinMoves'],
  _activePlayersMaxMoves: Ctx['_activePlayersMaxMoves'],
  playerID: PlayerID,
  arg: StageArg
) {
  if (typeof arg !== 'object' || arg === Stage.NULL) {
    arg = { stage: arg as string | null };
  }

  if (arg.stage !== undefined) {
    // stages previously did not enforce minMoves, this behaviour is kept intentionally
    supportDeprecatedMoveLimit(arg);

    activePlayers[playerID] = arg.stage;
    if (arg.minMoves) _activePlayersMinMoves[playerID] = arg.minMoves;
    if (arg.maxMoves) _activePlayersMaxMoves[playerID] = arg.maxMoves;
  }
}

/**
 * Converts a playOrderPos index into its value in playOrder.
 * @param {Array} playOrder - An array of player ID's.
 * @param {number} playOrderPos - An index into the above.
 */
function getCurrentPlayer(
  playOrder: Ctx['playOrder'],
  playOrderPos: Ctx['playOrderPos']
) {
  // convert to string in case playOrder is set to number[]
  return playOrder[playOrderPos] + '';
}

/**
 * Called at the start of a turn to initialize turn order state.
 *
 * TODO: This is called inside StartTurn, which is called from
 * both UpdateTurn and StartPhase (so it's called at the beginning
 * of a new phase as well as between turns). We should probably
 * split it into two.
 */
export function InitTurnOrderState(state: State, turn: TurnConfig) {
  let { G, ctx } = state;
  const { numPlayers } = ctx;
  const ctxWithAPI = plugin.EnhanceCtx(state);
  const order = turn.order;

  let playOrder = [...Array.from({ length: numPlayers })].map((_, i) => i + '');
  if (order.playOrder !== undefined) {
    playOrder = order.playOrder(G, ctxWithAPI);
  }

  const playOrderPos = order.first(G, ctxWithAPI);
  const posType = typeof playOrderPos;
  if (posType !== 'number') {
    logging.error(
      `invalid value returned by turn.order.first — expected number got ${posType} “${playOrderPos}”.`
    );
  }
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
export function UpdateTurnOrderState(
  state: State,
  currentPlayer: PlayerID,
  turn: TurnConfig,
  endTurnArg?: true | { remove?: any; next?: string }
) {
  const order = turn.order;

  let { G, ctx } = state;
  let playOrderPos = ctx.playOrderPos;
  let endPhase = false;

  if (endTurnArg && endTurnArg !== true) {
    if (typeof endTurnArg !== 'object') {
      logging.error(`invalid argument to endTurn: ${endTurnArg}`);
    }

    Object.keys(endTurnArg).forEach((arg) => {
      switch (arg) {
        case 'remove':
          currentPlayer = getCurrentPlayer(ctx.playOrder, playOrderPos);
          break;
        case 'next':
          playOrderPos = ctx.playOrder.indexOf(endTurnArg.next);
          currentPlayer = endTurnArg.next;
          break;
        default:
          logging.error(`invalid argument to endTurn: ${arg}`);
      }
    });
  } else {
    const ctxWithAPI = plugin.EnhanceCtx(state);
    const t = order.next(G, ctxWithAPI);
    const type = typeof t;
    if (t !== undefined && type !== 'number') {
      logging.error(
        `invalid value returned by turn.order.next — expected number or undefined got ${type} “${t}”.`
      );
    }

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
    first: (G: any, ctx: Ctx) =>
      ctx.turn === 0
        ? ctx.playOrderPos
        : (ctx.playOrderPos + 1) % ctx.playOrder.length,
    next: (G: any, ctx: Ctx) => (ctx.playOrderPos + 1) % ctx.playOrder.length,
  },

  /**
   * RESET
   *
   * Similar to DEFAULT, but starts from 0 each time.
   */
  RESET: {
    first: () => 0,
    next: (G: any, ctx: Ctx) => (ctx.playOrderPos + 1) % ctx.playOrder.length,
  },

  /**
   * CONTINUE
   *
   * Similar to DEFAULT, but starts with the player who ended the last phase.
   */
  CONTINUE: {
    first: (G: any, ctx: Ctx) => ctx.playOrderPos,
    next: (G: any, ctx: Ctx) => (ctx.playOrderPos + 1) % ctx.playOrder.length,
  },

  /**
   * ONCE
   *
   * Another round-robin turn order, but goes around just once.
   * The phase ends after all players have played.
   */
  ONCE: {
    first: () => 0,
    next: (G: any, ctx: Ctx) => {
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
  CUSTOM: (playOrder: string[]) => ({
    playOrder: () => playOrder,
    first: () => 0,
    next: (G: any, ctx: Ctx) => (ctx.playOrderPos + 1) % ctx.playOrder.length,
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
  CUSTOM_FROM: (playOrderField: string) => ({
    playOrder: (G: any) => G[playOrderField],
    first: () => 0,
    next: (G: any, ctx: Ctx) => (ctx.playOrderPos + 1) % ctx.playOrder.length,
  }),
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
  ALL_ONCE: { all: Stage.NULL, minMoves: 1, maxMoves: 1 },

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
  OTHERS_ONCE: { others: Stage.NULL, minMoves: 1, maxMoves: 1 },
};
