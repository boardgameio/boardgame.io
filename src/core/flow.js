/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import {
  SetActionPlayersEvent,
  InitTurnOrderState,
  UpdateTurnOrderState,
} from './turn-order';
import * as plugins from '../plugins/main';
import { automaticGameEvent } from './action-creators';
import { ContextEnhancer } from './reducer';
import * as logging from './logger';

/**
 * Helper to create a reducer that manages ctx (with the
 * ability to also update G).
 *
 * This is mostly around for legacy reasons. The original plan
 * was to have two flows, one with phases etc. and another
 * simpler one like this. The current state is such that this
 * is merely an internal function of FlowWithPhases below.
 *
 * @param {...object} ctx - Function with the signature
 *                          numPlayers => ctx
 *                          that determines the initial value of ctx.
 * @param {...object} events - Object containing functions
 *                             named after events that this
 *                             reducer will handle. Each function
 *                             has the following signature:
 *                             ({G, ctx}) => {G, ctx}
 * @param {...object} enabledEvents - Map of eventName -> bool indicating
 *                                    which events are callable from the client
 *                                    or from within moves.
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
 *
 * @param {Array} redactedMoves - List of moves to be redacted
 *                                from the log.
 */
export function Flow({
  ctx,
  events,
  enabledEvents,
  init,
  processMove,
  optimisticUpdate,
  canMakeMove,
  canUndoMove,
  redactedMoves,
  moveMap,
}) {
  if (!ctx) ctx = () => ({});
  if (!events) events = {};
  if (!enabledEvents) enabledEvents = {};
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
      const logEntry = {
        action,
        _stateID: state._stateID,
        turn: state.ctx.turn,
        phase: state.ctx.phase,
      };
      const deltalog = [...(state.deltalog || []), logEntry];
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
    redactedMoves,
    moveMap,

    eventNames: Object.getOwnPropertyNames(events),
    enabledEventNames: Object.getOwnPropertyNames(enabledEvents),

    processMove: (state, action) => {
      return processMove(state, action, dispatch);
    },

    processGameEvent: (state, action) => {
      return dispatch(state, action, dispatch);
    },

    optimisticUpdate,

    canPlayerCallEvent: (G, ctx, playerID) => {
      return (
        ctx.currentPlayer == playerID && ctx.actionPlayers.includes(playerID)
      );
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
 *                                If the return value is { next: playerID },
 *                                that player is the next player
 *                                (instead of following the turn order).
 *                                (G, ctx) => boolean|object
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
 * @param {...object} turn - Customize the turn structure (see turn-order.js).
 *
 * @param {...object} endTurn - Set to false to disable the `endTurn` event.
 *
 * @param {...object} endPhase - Set to false to disable the `endPhase` event.
 *
 * @param {...object} endGame - Set to true to enable the `endGame` event.
 *
 * @param {...object} setActionPlayers - Set to true to enable the `setActionPlayers` event.
 *
 * @param {...object} undoableMoves - List of moves that are undoable,
 *                                   (default: null, i.e. all moves are undoable).
 *
 * @param {Array} redactedMoves - List of moves to be redacted
 *                                from the log.
 *
 * @param {...object} optimisticUpdate - (G, ctx, move) => boolean
 *                                       Control whether a move should
 *                                       be executed optimistically on
 *                                       the client while waiting for
 *                                       the result of execution from
 *                                       the server.
 *
 * @param {object} game - The game object.
 *
 * @param {...object} phases - A map of phases in the game.
 *
 * Each phase is described by an object whose key is the phase name.
 *
 * All the properties below override their global equivalents
 * above whenever they are defined (i.e. the global setting
 * is used if a phase-specific setting is absent).
 *
 * {
 *   // Any setup code to run before the phase begins.
 *   onPhaseBegin: (G, ctx) => G,
 *
 *   // Any cleanup code to run after the phase ends.
 *   onPhaseEnd: (G, ctx) => G,
 *
 *   // The phase ends if this function returns a truthy value.
 *   // If the return value is of the form { next: 'phase name' }
 *   // then that will be chosen as the next phase.
 *   endPhaseIf: (G, ctx) => boolean|object,
 *
 *   Phase-specific options that override their global equivalents:
 *
 *   // A phase-specific endTurnIf.
 *   endTurnIf: (G, ctx) => boolean|object,
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
 *   // A phase-specific turn structure.
 *   turn: { order: TurnOrder.DEFAULT },
 *
 *   // A phase-specific movesPerTurn.
 *   movesPerTurn: integer,
 *
 *   // List of moves that are undoable.
 *   undoableMoves: ['moveA', ...],
 * }
 */
export function FlowWithPhases({
  phases,
  startingPhase,
  movesPerTurn,
  endTurnIf,
  endGameIf,
  onTurnBegin,
  onTurnEnd,
  onMove,
  turn,
  endTurn,
  endPhase,
  endGame,
  setActionPlayers,
  undoableMoves,
  redactedMoves,
  optimisticUpdate,
  game,
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
  if (game === undefined) {
    game = { plugins: [] };
  }
  if (!startingPhase) startingPhase = 'default';
  if (!endTurnIf) endTurnIf = () => false;
  if (!endGameIf) endGameIf = () => undefined;
  if (!onTurnBegin) onTurnBegin = G => G;
  if (!onTurnEnd) onTurnEnd = G => G;
  if (!onMove) onMove = G => G;
  if (!turn) turn = {};
  if (undoableMoves === undefined) undoableMoves = null;

  const phaseMap = game.phases || phases || {};

  if ('default' in phaseMap) {
    logging.error('cannot specify phase with name "default"');
  }

  phaseMap['default'] = {};

  let moveMap = {};

  for (let phase in phaseMap) {
    const conf = phaseMap[phase];

    if (conf.moves !== undefined) {
      for (let move of Object.keys(conf.moves)) {
        moveMap[phase + '.' + move] = conf.moves[move];
      }
    }

    if (conf.endPhaseIf === undefined) {
      conf.endPhaseIf = () => undefined;
    }
    if (conf.onPhaseBegin === undefined) {
      conf.onPhaseBegin = G => G;
    }
    conf.onPhaseBegin = plugins.FnWrap(conf.onPhaseBegin, game);
    if (conf.onPhaseEnd === undefined) {
      conf.onPhaseEnd = G => G;
    }
    conf.onPhaseEnd = plugins.FnWrap(conf.onPhaseEnd, game);
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
    conf.onTurnBegin = plugins.FnWrap(conf.onTurnBegin, game);
    if (conf.onTurnEnd === undefined) {
      conf.onTurnEnd = onTurnEnd;
    }
    conf.onTurnEnd = plugins.FnWrap(conf.onTurnEnd, game);
    if (conf.onMove === undefined) {
      conf.onMove = onMove;
    }
    conf.onMove = plugins.FnWrap(conf.onMove, game);
    if (conf.turn === undefined) {
      conf.turn = turn;
    }
    if (conf.undoableMoves === undefined) {
      conf.undoableMoves = undoableMoves;
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
    let G = config.onPhaseBegin(state.G, state.ctx);
    let ctx = InitTurnOrderState(G, state.ctx, config.turn);

    // Allow plugins to modify G and ctx at the beginning of a phase.
    G = plugins.G.onPhaseBegin(G, ctx, game);
    ctx = plugins.ctx.onPhaseBegin(ctx, game);

    // Reset stats.
    ctx.stats = {
      ...ctx.stats,
      phase: {
        ...ctx.stats.phase,
        numMoves: {},
        allPlayed: false,
      },
    };

    return { ...state, G, ctx };
  };

  const startTurn = function(state, config) {
    const G = config.onTurnBegin(state.G, state.ctx);

    const plainCtx = ContextEnhancer.detachAllFromContext(state.ctx);
    const _undo = [{ G, ctx: plainCtx }];

    const ctx = { ...state.ctx };

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

  const startGame = function(state) {
    if (!(state.ctx.phase in phaseMap)) {
      logging.error('invalid startingPhase: ' + state.ctx.phase);
      return state;
    }

    const conf = phaseMap[state.ctx.phase];
    state = startPhase(state, conf);
    state = startTurn(state, conf);
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
   *
   * If this call results in a cycle, the phase is reset to
   * the default phase.
   */
  function endPhaseEvent(state, arg, visitedPhases) {
    let G = state.G;
    let ctx = state.ctx;

    // Run any cleanup code for the phase that is about to end.
    const conf = phaseMap[ctx.phase];
    G = conf.onPhaseEnd(G, ctx);

    const gameover = conf.endGameIf(G, ctx);
    if (gameover !== undefined) {
      return { ...state, G, ctx: { ...ctx, gameover } };
    }

    const prevPhase = ctx.phase;

    // Update the phase.
    if (arg && arg !== true) {
      if (arg.next in phaseMap) {
        ctx = { ...ctx, phase: arg.next, prevPhase };
      } else {
        logging.error('invalid argument to endPhase: ' + arg);
      }
    } else if (conf.next !== undefined) {
      ctx = { ...ctx, phase: conf.next, prevPhase };
    } else {
      ctx = { ...ctx, phase: ctx.prevPhase, prevPhase };
    }

    // Run any setup code for the new phase.
    state = startPhase({ ...state, G, ctx }, phaseMap[ctx.phase]);

    const origTurn = state.ctx.turn;

    // End the new phase automatically if necessary.
    // In order to avoid infinite loops, the `default`
    // phase is chosen as the next phase the moment we
    // end up at a phase that we've already visited when
    // we processed the endPhase event that kicked of this
    // chain of events.
    if (!visitedPhases) visitedPhases = {};

    if (ctx.phase in visitedPhases) {
      state = this.dispatch(
        state,
        automaticGameEvent(
          'endPhase',
          [{ next: 'default' }, visitedPhases],
          this.playerID
        )
      );
    } else {
      visitedPhases[ctx.phase] = true;
      const end = shouldEndPhase(state);
      if (end) {
        state = this.dispatch(
          state,
          automaticGameEvent('endPhase', [end, visitedPhases], this.playerID)
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
  function endTurnEvent(state, arg) {
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
        conf.turn,
        arg
      );
      endPhase = a;
      ctx = b;
    }

    // Update turn.
    const turn = ctx.turn + 1;

    // Update state.
    ctx = { ...ctx, turn };

    state = { ...state, G, ctx };

    // End phase if condition is met.
    const endPhaseArg = shouldEndPhase(state);
    if (endPhaseArg) {
      endPhase = true;
    }

    if (endPhase) {
      return this.dispatch(
        state,
        automaticGameEvent('endPhase', [endPhaseArg], this.playerID)
      );
    }

    return startTurn(state, conf);
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
    let actionPlayersOnceDone = false;
    if (state.ctx._actionPlayersOnce) {
      const playerID = action.playerID;
      actionPlayers = actionPlayers.filter(id => id !== playerID);

      if (actionPlayers.length == 0 && conf.turn.order.endPhaseOnceDone) {
        actionPlayersOnceDone = true;
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
    const endPhase = shouldEndPhase(state) || actionPlayersOnceDone;
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

    // Update undo / redo state.
    if (!endTurn) {
      const undo = state._undo || [];
      const moveType = action.type;

      const plainCtx = ContextEnhancer.detachAllFromContext(state.ctx);

      state = {
        ...state,
        _undo: [...undo, { G: state.G, ctx: plainCtx, moveType }],
        _redo: [],
      };
    }

    return state;
  }

  const canMakeMove = (G, ctx, moveName) => {
    // If this is a namespaced move, verify that
    // we are in the correct phase.
    if (moveName.includes('.')) {
      const tokens = moveName.split('.');
      return tokens[0] == ctx.phase;
    }
    // If not, then the move is allowed.
    return true;
  };

  const canUndoMove = (G, ctx, moveName) => {
    const conf = phaseMap[ctx.phase];
    if (!conf.undoableMoves) return true;
    return conf.undoableMoves.includes(moveName);
  };

  const events = {
    endTurn: endTurnEvent,
    endPhase: endPhaseEvent,
    endGame: endGameEvent,
    setActionPlayers: SetActionPlayersEvent,
  };

  let enabledEvents = {};
  if (endTurn) {
    enabledEvents['endTurn'] = true;
  }
  if (endPhase) {
    enabledEvents['endPhase'] = true;
  }
  if (endGame) {
    enabledEvents['endGame'] = true;
  }
  if (setActionPlayers) {
    enabledEvents['setActionPlayers'] = true;
  }

  return Flow({
    ctx: numPlayers => ({
      numPlayers,
      turn: 0,
      currentPlayer: '0',
      actionPlayers: ['0'],
      currentPlayerMoves: 0,
      playOrder: [...new Array(numPlayers)].map((d, i) => i + ''),
      playOrderPos: 0,
      stats: { turn: { numMoves: {} }, phase: { numMoves: {} } },
      allPlayed: false,
      phase: startingPhase,
      prevPhase: 'default',
      stage: {},
    }),
    init: state => {
      return startGame(state);
    },
    optimisticUpdate: (G, ctx, action) => {
      // Some random code was executed.
      if (ctx._random !== undefined && ctx._random.prngstate !== undefined) {
        return false;
      }
      return optimisticUpdate(G, ctx, action);
    },
    events,
    enabledEvents,
    processMove,
    canMakeMove,
    canUndoMove,
    redactedMoves,
    moveMap,
  });
}
