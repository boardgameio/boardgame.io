/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import {
  SetActionPlayers,
  InitTurnOrderState,
  UpdateTurnOrderState,
  TurnOrder,
} from './turn-order';
import { Random } from './random';
import { Events } from './events';
import { automaticGameEvent } from './action-creators';

/**
 * Helper to create a reducer that manages ctx (with the
 * ability to also update G).
 *
 * You probably want to use FlowWithPhases below, but you might
 * need to use this directly if you are creating a very customized
 * game flow that it cannot handle.
 *
 * @param {...object} ctx - Function with the signature
 *                          numPlayers => ctx
 *                          that determines the initial value of ctx.
 * @param {...object} events - Object containing functions
 *                             named after events that this
 *                             reducer will handle. Each function
 *                             has the following signature:
 *                             ({G, ctx}) => {G, ctx}
 * @param {...object} processMove - A function that's called whenever a move is made.
 *                                  (state, action, dispatch) => state.
 * @param {...object} optimisticUpdate - (G, ctx, move) => boolean
 *                                       Control whether a move should
 *                                       be executed optimistically on
 *                                       the client while waiting for
 *                                       the result of execution from
 *                                       the server.
 * @param {...object} canMakeMove - (G, ctx, moveName) => boolean
 *                                  Predicate to determine whether a
 *                                  particular move is allowed at
 *                                  this time.
 *
 * @param {...object} canUndoMove - (G, ctx, moveName) => boolean
 *                                  Predicate to determine whether a
 *                                  particular move is undoable at this
 *                                  time.
 */
export function Flow({
  ctx,
  events,
  init,
  processMove,
  optimisticUpdate,
  canMakeMove,
  canUndoMove,
}) {
  if (!ctx) ctx = () => ({});
  if (!events) events = {};
  if (!init) init = state => state;
  if (!processMove) processMove = state => state;
  if (!canMakeMove) canMakeMove = () => true;
  if (!canUndoMove) canUndoMove = () => true;

  if (optimisticUpdate === undefined) {
    optimisticUpdate = () => true;
  }

  const dispatch = (state, action) => {
    const { payload } = action;
    if (events.hasOwnProperty(payload.type)) {
      const context = { playerID: payload.playerID, dispatch };
      const newLogEntry = { action };
      const deltalog = [...(state.deltalog || []), newLogEntry];
      state = { ...state, deltalog };
      const args = [state].concat(payload.args);
      return events[payload.type].apply(context, args);
    }
    return state;
  };

  return {
    ctx,
    init,
    canUndoMove,

    eventNames: Object.getOwnPropertyNames(events),

    processMove: (state, action) => {
      return processMove(state, action, dispatch);
    },

    processGameEvent: (state, action) => {
      return dispatch(state, action, dispatch);
    },

    optimisticUpdate,

    canPlayerCallEvent: (G, ctx, playerID) => {
      return ctx.currentPlayer == playerID;
    },

    canPlayerMakeMove: (G, ctx, playerID) => {
      const actionPlayers = ctx.actionPlayers || [];
      return actionPlayers.includes(playerID);
    },

    canMakeMove: (G, ctx, moveName) => {
      // Disallow moves once the game is over.
      if (ctx.gameover !== undefined) return false;
      // User-provided move validation.
      return canMakeMove(G, ctx, moveName);
    },
  };
}

/**
 * FlowWithPhases
 *
 * A very customizable game flow that introduces phases to the
 * game. Each phase can be configured with:
 * - A custom turn order.
 * - Automatically executed setup / cleanup code.
 * - Custom phase end conditions.
 * - A move whitelist that disallows other moves during the phase.
 *
 * @param {...object} movesPerTurn - End the turn automatically after a certain number
 *                                   of moves (default: undefined, i.e. the turn does
 *                                   not automatically end after a certain number of moves).
 *
 * @param {...object} endTurnIf - The turn automatically ends if this
 *                                returns a truthy value
 *                                (checked after each move).
 *                                If the return value is a playerID,
 *                                that player is the next player
 *                                (instead of following the turn order).
 *                                (G, ctx) => boolean|string
 *
 * @param {...object} endGameIf - The game automatically ends if this function
 *                                returns anything (checked after each move).
 *                                The return value is available at ctx.gameover.
 *                                (G, ctx) => {}
 *
 * @param {...object} onTurnBegin - Any code to run when a turn begins.
 *                                 (G, ctx) => G
 *
 * @param {...object} onTurnEnd - Any code to run when a turn ends.
 *                                (G, ctx) => G
 *
 * @param {...object} onMove - Any code to run at the end of a move.
 *                             (G, ctx, { type: 'moveName', args: [] }) => G
 *
 * @param {...object} turnOrder - Customize the turn order (see turn-order.js).
 *
 * @param {...object} endTurn - Set to false to disable the `endTurn` event.
 *
 * @param {...object} endPhase - Set to false to disable the `endPhase` event.
 *
 * @param {...object} endGame - Set to true to enable the `endGame` event.
 *
 * @param {...object} setActionPlayers - Set to true to enable the `setActionPlayers` event.
 *
 * @param {...object} allowedMoves - List of moves that are allowed.
 *                                   This can be either a list of
 *                                   move names or a function with the
 *                                   signature (G, ctx) => [].
 *                                   (default: null, i.e. all moves are allowed).
 *
 * @param {...object} undoableMoves - List of moves that are undoable,
 *                                   (default: null, i.e. all moves are undoable).
 *
 *
 * @param {...object} optimisticUpdate - (G, ctx, move) => boolean
 *                                       Control whether a move should
 *                                       be executed optimistically on
 *                                       the client while waiting for
 *                                       the result of execution from
 *                                       the server.
 *
 * @param {...object} phases - A list of phases in the game.
 *
 * Each phase is described by an object:
 *
 * All the properties below override their global equivalents
 * above whenever they are defined (i.e. the global setting
 * is used if a phase-specific setting is absent).
 *
 * {
 *   name: 'phase_name',
 *
 *   // Any setup code to run before the phase begins.
 *   onPhaseBegin: (G, ctx) => G,
 *
 *   // Any cleanup code to run after the phase ends.
 *   onPhaseEnd: (G, ctx) => G,
 *
 *   // The phase ends if this function returns a truthy value.
 *   // If the return value is the name of another phase,
 *   // that will be chosen as the next phase (as opposed
 *   // to the next one in round-robin order).
 *   endPhaseIf: (G, ctx) => boolean|string,
 *
 *   Phase-specific options that override their global equivalents:
 *
 *   // A phase-specific endTurnIf.
 *   endTurnIf: (G, ctx) => boolean,
 *
 *   // A phase-specific endGameIf.
 *   endGameIf: (G, ctx) => {},
 *
 *   // A phase-specific onTurnBegin
 *   onTurnBegin: (G, ctx) => G,
 *
 *   // A phase-specific onTurnEnd.
 *   onTurnEnd: (G, ctx) => G,
 *
 *   // A phase-specific onMove.
 *   onMove - (G, ctx) => G,
 *
 *   // A phase-specific turnOrder.
 *   turnOrder: TurnOrder.DEFAULT,
 *
 *   // A phase-specific movesPerTurn.
 *   movesPerTurn: integer,
 *
 *   // List of moves or a function that returns a list of moves
 *   // that are allowed in this phase.
 *   allowedMoves: (G, ctx) => ['moveA', ...],
 *
 *   // List of moves that are undoable.
 *   undoableMoves: ['moveA', ...],
 * }
 */
export function FlowWithPhases({
  phases,
  movesPerTurn,
  endTurnIf,
  endGameIf,
  onTurnBegin,
  onTurnEnd,
  onMove,
  turnOrder,
  endTurn,
  endPhase,
  endGame,
  setActionPlayers,
  undoableMoves,
  allowedMoves,
  optimisticUpdate,
}) {
  // Attach defaults.
  if (endPhase === undefined && phases) {
    endPhase = true;
  }
  if (endTurn === undefined) {
    endTurn = true;
  }
  if (endGame === undefined) {
    endGame = false;
  }
  if (setActionPlayers === undefined) {
    setActionPlayers = false;
  }
  if (optimisticUpdate === undefined) {
    optimisticUpdate = () => true;
  }
  if (!phases) phases = [{ name: 'default' }];
  if (!endTurnIf) endTurnIf = () => false;
  if (!endGameIf) endGameIf = () => undefined;
  if (!onTurnBegin) onTurnBegin = G => G;
  if (!onTurnEnd) onTurnEnd = G => G;
  if (!onMove) onMove = G => G;
  if (!turnOrder) turnOrder = TurnOrder.DEFAULT;
  if (allowedMoves === undefined) allowedMoves = null;
  if (undoableMoves === undefined) undoableMoves = null;

  let phaseKeys = [];
  let phaseMap = {};

  for (let i = 0; i < phases.length; i++) {
    let conf = phases[i];
    phaseKeys.push(conf.name);
    phaseMap[conf.name] = conf;

    if (conf.endPhaseIf === undefined) {
      conf.endPhaseIf = () => false;
    }
    if (conf.onPhaseBegin === undefined) {
      conf.onPhaseBegin = G => G;
    }
    if (conf.onPhaseEnd === undefined) {
      conf.onPhaseEnd = G => G;
    }
    if (conf.movesPerTurn === undefined) {
      conf.movesPerTurn = movesPerTurn;
    }
    if (conf.endTurnIf === undefined) {
      conf.endTurnIf = endTurnIf;
    }
    if (conf.endGameIf === undefined) {
      conf.endGameIf = endGameIf;
    }
    if (conf.onTurnBegin === undefined) {
      conf.onTurnBegin = onTurnBegin;
    }
    if (conf.onTurnEnd === undefined) {
      conf.onTurnEnd = onTurnEnd;
    }
    if (conf.onMove === undefined) {
      conf.onMove = onMove;
    }
    if (conf.turnOrder === undefined) {
      conf.turnOrder = turnOrder;
    }
    if (conf.undoableMoves === undefined) {
      conf.undoableMoves = undoableMoves;
    }
    if (conf.allowedMoves === undefined) {
      conf.allowedMoves = allowedMoves;
    }
    if (typeof conf.allowedMoves !== 'function') {
      const t = conf.allowedMoves;
      conf.allowedMoves = () => t;
    }
  }

  const shouldEndPhase = ({ G, ctx }) => {
    const conf = phaseMap[ctx.phase];
    return conf.endPhaseIf(G, ctx);
  };

  const shouldEndTurn = ({ G, ctx }) => {
    const conf = phaseMap[ctx.phase];

    const currentPlayerMoves = ctx.stats.turn.numMoves[ctx.currentPlayer] || 0;
    if (conf.movesPerTurn && currentPlayerMoves >= conf.movesPerTurn) {
      return true;
    }
    return conf.endTurnIf(G, ctx);
  };

  // Helper to perform start-of-phase initialization.
  const startPhase = function(state, config) {
    const G = config.onPhaseBegin(state.G, state.ctx);
    const ctx = InitTurnOrderState(state.G, state.ctx, config.turnOrder);

    // Reset stats.
    ctx.stats = {
      ...ctx.stats,
      phase: {
        ...ctx.stats.phase,
        numMoves: {},
        allPlayed: false,
      },
    };

    const allowedMoves = config.allowedMoves(G, ctx);
    return { ...state, G, ctx: { ...ctx, allowedMoves } };
  };

  const startTurn = function(state, config) {
    const G = config.onTurnBegin(state.G, state.ctx);

    let plainCtx = state.ctx;
    plainCtx = Random.detach(plainCtx);
    plainCtx = Events.detach(plainCtx);
    const _undo = [{ G, ctx: plainCtx }];

    const ctx = { ...state.ctx };
    ctx.allowedMoves = config.allowedMoves(G, ctx);

    // Reset stats.
    ctx.stats = {
      ...ctx.stats,
      turn: {
        ...ctx.stats.turn,
        numMoves: {},
        allPlayed: false,
      },
    };

    return { ...state, G, ctx, _undo, _redo: [] };
  };

  const startGame = function(state, config) {
    state = startPhase(state, config);
    state = startTurn(state, config);
    return state;
  };

  /**
   * endPhase (game event)
   *
   * Ends the current phase.
   * Also runs any phase cleanup code and setup code for the
   * next phase (if any).
   *
   * The next phase is chosen in a round-robin fashion, with the
   * option to override that by passing nextPhase.
   */
  function endPhaseEvent(state, nextPhase, cascadeDepth) {
    let G = state.G;
    let ctx = state.ctx;

    // Run any cleanup code for the phase that is about to end.
    const conf = phaseMap[ctx.phase];
    G = conf.onPhaseEnd(G, ctx);

    const gameover = conf.endGameIf(G, ctx);
    if (gameover !== undefined) {
      return { ...state, G, ctx: { ...ctx, gameover } };
    }

    // Update the phase.
    if (nextPhase in phaseMap) {
      ctx = { ...ctx, phase: nextPhase };
    } else {
      let index = phaseKeys.indexOf(ctx.phase);
      index = (index + 1) % phases.length;
      const phase = phases[index].name;
      ctx = { ...ctx, phase };
    }

    // Run any setup code for the new phase.
    state = startPhase({ ...state, G, ctx }, phaseMap[ctx.phase]);

    const origTurn = state.ctx.turn;

    // End the new phase automatically if necessary.
    // In order to avoid infinite loops, this is called
    // a finite number of times.
    if (!cascadeDepth) cascadeDepth = 0;
    if (cascadeDepth < phases.length - 1) {
      const end = shouldEndPhase(state);
      if (end) {
        state = this.dispatch(
          state,
          automaticGameEvent('endPhase', [end, cascadeDepth + 1], this.playerID)
        );
      }
    }

    // End turn if endTurnIf returns something
    // (and the turn has not already been ended by a nested endPhase call).
    const endTurn = shouldEndTurn(state);
    if (endTurn && state.ctx.turn == origTurn) {
      state = this.dispatch(
        state,
        automaticGameEvent('endTurn', [endTurn], this.playerID)
      );
    }

    return state;
  }

  /**
   * endTurn (game event)
   *
   * Ends the current turn.
   * Passes the turn to the next turn in a round-robin fashion.
   */
  function endTurnEvent(state, nextPlayer) {
    let { G, ctx } = state;

    const conf = phaseMap[ctx.phase];

    // Prevent ending the turn if movesPerTurn haven't been made.
    const currentPlayerMoves = ctx.stats.turn.numMoves[ctx.currentPlayer] || 0;
    if (conf.movesPerTurn && currentPlayerMoves < conf.movesPerTurn) {
      return state;
    }

    // Run turn-end triggers.
    G = conf.onTurnEnd(G, ctx);

    // Update gameover.
    const gameover = conf.endGameIf(G, ctx);
    if (gameover !== undefined) {
      return { ...state, G, ctx: { ...ctx, gameover } };
    }

    let endPhase = false;

    // Update turn order state.
    {
      const { endPhase: a, ctx: b } = UpdateTurnOrderState(
        G,
        ctx,
        conf.turnOrder,
        nextPlayer
      );
      endPhase = a;
      ctx = b;
    }

    // Update turn.
    const turn = ctx.turn + 1;

    // Update state.
    ctx = { ...ctx, turn };

    // End phase if condition is met.
    const endPhaseArg = shouldEndPhase(state);
    if (endPhaseArg) {
      endPhase = true;
    }

    if (endPhase) {
      return this.dispatch(
        { ...state, G, ctx },
        automaticGameEvent('endPhase', [endPhaseArg], this.playerID)
      );
    }

    return startTurn({ ...state, G, ctx }, conf);
  }

  function endGameEvent(state, arg) {
    if (arg === undefined) {
      arg = true;
    }

    return { ...state, ctx: { ...state.ctx, gameover: arg } };
  }

  function updateStats(state, key, playerID) {
    const moves = (state.ctx.stats[key].numMoves[playerID] || 0) + 1;
    const numMoves = { ...state.ctx.stats[key].numMoves, [playerID]: moves };
    const t = { ...state.ctx.stats[key], numMoves };

    if (Object.keys(numMoves).length == state.ctx.numPlayers) {
      t.allPlayed = true;
    }

    const stats = { ...state.ctx.stats, [key]: t };
    const ctx = { ...state.ctx, stats };

    return { ...state, ctx };
  }

  function processMove(state, action, dispatch) {
    let conf = phaseMap[state.ctx.phase];

    state = updateStats(state, 'turn', action.playerID);
    state = updateStats(state, 'phase', action.playerID);

    // Update actionPlayers if _actionPlayersOnce is set.
    let actionPlayers = state.ctx.actionPlayers;
    if (state.ctx._actionPlayersOnce) {
      const playerID = action.playerID;
      actionPlayers = actionPlayers.filter(id => id !== playerID);
    }
    if (state.ctx._actionPlayersAllOthers) {
      const playerID = action.playerID;
      actionPlayers = actionPlayers.filter(id => id !== playerID);
      if (actionPlayers.length === 0) {
        actionPlayers = [state.ctx.currentPlayer];
      }
    }

    state = {
      ...state,
      ctx: {
        ...state.ctx,
        actionPlayers,
      },
    };

    const G = conf.onMove(state.G, state.ctx, action);
    state = { ...state, G };

    const origTurn = state.ctx.turn;
    const gameover = conf.endGameIf(state.G, state.ctx);

    // End the phase automatically if endPhaseIf is true or if endGameIf returns.
    const endPhase = shouldEndPhase(state);
    if (endPhase || gameover !== undefined) {
      state = dispatch(
        state,
        automaticGameEvent('endPhase', [endPhase], action.playerID)
      );
      // Update to the new phase configuration
      conf = phaseMap[state.ctx.phase];
    }

    // End the turn automatically if endTurnIf is true or if endGameIf returns.
    // (but not if endPhase above already ends the turn).
    const endTurn = shouldEndTurn(state);
    if (state.ctx.turn == origTurn && (endTurn || gameover !== undefined)) {
      state = dispatch(
        state,
        automaticGameEvent('endTurn', [endTurn], action.playerID)
      );
    }

    // End the game automatically if endGameIf returns.
    if (gameover !== undefined) {
      return { ...state, ctx: { ...state.ctx, gameover } };
    }

    // Update allowedMoves.
    const allowedMoves = conf.allowedMoves(state.G, state.ctx);
    state = { ...state, ctx: { ...state.ctx, allowedMoves } };

    // Update undo / redo state.
    if (!endTurn) {
      const undo = state._undo || [];
      const moveType = action.type;

      let plainCtx = state.ctx;
      plainCtx = Random.detach(plainCtx);
      plainCtx = Events.detach(plainCtx);

      state = {
        ...state,
        _undo: [...undo, { G: state.G, ctx: plainCtx, moveType }],
        _redo: [],
      };
    }

    return state;
  }

  const canMakeMove = (G, ctx, moveName) => {
    const conf = phaseMap[ctx.phase];
    const moves = conf.allowedMoves(G, ctx);
    if (!moves) return true;
    return moves.includes(moveName);
  };

  const canUndoMove = (G, ctx, moveName) => {
    const conf = phaseMap[ctx.phase];
    if (!conf.undoableMoves) return true;
    return conf.undoableMoves.includes(moveName);
  };

  let enabledEvents = {};
  if (endTurn) {
    enabledEvents['endTurn'] = endTurnEvent;
  }
  if (endPhase) {
    enabledEvents['endPhase'] = endPhaseEvent;
  }
  if (endGame) {
    enabledEvents['endGame'] = endGameEvent;
  }
  if (setActionPlayers) {
    enabledEvents['setActionPlayers'] = SetActionPlayers;
  }

  return Flow({
    ctx: numPlayers => ({
      numPlayers,
      turn: 0,
      currentPlayer: '0',
      currentPlayerMoves: 0,
      playOrder: Array.from(Array(numPlayers), (d, i) => i + ''),
      playOrderPos: 0,
      stats: { turn: { numMoves: {} }, phase: { numMoves: {} } },
      allPlayed: false,
      phase: phases[0].name,
    }),
    init: state => {
      return startGame(state, phases[0]);
    },
    optimisticUpdate: (G, ctx, action) => {
      // Some random code was executed.
      if (ctx._random !== undefined && ctx._random.prngstate !== undefined) {
        return false;
      }
      return optimisticUpdate(G, ctx, action);
    },
    events: enabledEvents,
    processMove,
    canMakeMove,
    canUndoMove,
  });
}
