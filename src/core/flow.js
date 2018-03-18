/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { TurnOrder } from './turn-order';
import { Random } from './random';
import { Events } from './events';

/**
 * This function checks whether a player is allowed to make a move.
 *
 * @param {object} G     - The Game instance
 * @param {object} ctx   - The ctx instance
 * @param {object} opts  - Options - used here to transport the playerID.
 */
function canMakeMoveDefault(G, ctx, opts) {
  const { playerID } = opts || {};

  // In multiplayer mode, the default playerID is null, which corresponds
  // to a spectator that can't make moves.
  if (playerID === null) {
    return true;
  }

  // In singleplayer mode (and most unit tests), the default playerID
  // is undefined, and can always make moves.
  if (playerID === undefined) {
    return true;
  }

  const actionPlayers = ctx.actionPlayers || [];

  // Explicitly do not allow the current player
  // When he is allowed to make a move, his playerID
  // must be included in actionPlayers.
  return actionPlayers.includes(playerID) || actionPlayers.includes('any');
}

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
 * @param {...object} canMakeMove - (G, ctx, opts) => boolean
 *                                  Predicate to determine whether the player
 *                                  identified by playerID is allowed to make a move.
 *                                  opts contains an object { type, args, playerID },
 *                                  which is the payload of makeMove().
 */
export function Flow({
  ctx,
  events,
  init,
  processMove,
  optimisticUpdate,
  canMakeMove,
}) {
  if (!ctx) ctx = () => ({});
  if (!events) events = {};
  if (!init) init = state => state;
  if (!processMove) processMove = state => state;
  if (!canMakeMove) canMakeMove = canMakeMoveDefault;

  if (optimisticUpdate === undefined) {
    optimisticUpdate = () => true;
  }

  const dispatch = (state, action) => {
    if (events.hasOwnProperty(action.type)) {
      const context = { playerID: action.playerID };
      const args = [state].concat(action.args);
      const oldLog = state.log || [];
      const log = [...oldLog, action];
      const newState = events[action.type].apply(context, args);
      return { ...newState, log };
    }
    return state;
  };

  return {
    ctx,
    init,

    eventNames: Object.getOwnPropertyNames(events),

    processMove: (state, action) => {
      return processMove(state, action, dispatch);
    },

    processGameEvent: (state, action) => {
      return dispatch(state, action);
    },

    optimisticUpdate,

    // Disallow moves once the game is over.
    // Also call any provided additional validation.
    canMakeMove: (G, ctx, opts) => {
      if (ctx.gameover !== undefined) return false;
      return canMakeMove(G, ctx, opts);
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
 * @param {...object} endTurnIf - The turn automatically ends if this function
 *                                returns true (checked after each move).
 *                                (G, ctx) => boolean
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
 * @param {...object} undoableMoves - List of moves that are undoable,
 *                                   (default: undefined, i.e. all moves are undoable).
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
 * {
 *   name: 'phase_name',
 *
 *   // Any setup code to run before the phase begins.
 *   onPhaseBegin: (G, ctx) => G,
 *
 *   // Any cleanup code to run after the phase ends.
 *   onPhaseEnd: (G, ctx) => G,
 *
 *   // The phase ends if this function returns true.
 *   // If the return value is the name of another phase,
 *   // that will be chosen as the next phase (as opposed
 *   // to the next one in round-robin order).
 *   // The phase can also end when the `endPhase` game event happens.
 *   endPhaseIf: (G, ctx) => {},
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
 *   // List of moves that are allowed in this phase.
 *   allowedMoves: ['moveA', ...],
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
  undoableMoves,
  optimisticUpdate,
  canMakeMove,
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

  let phaseKeys = [];
  let phaseMap = {};

  for (let conf of phases) {
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
  }

  const endTurnIfWrap = (G, ctx) => {
    const conf = phaseMap[ctx.phase];
    if (conf.movesPerTurn && ctx.currentPlayerMoves >= conf.movesPerTurn) {
      return true;
    }
    return conf.endTurnIf(G, ctx);
  };

  const getCurrentPlayer = (playOrder, playOrderPos) => {
    if (playOrderPos === undefined) {
      return 'any';
    }
    return playOrder[playOrderPos] + '';
  };

  // Helper to perform start-of-phase initialization.
  const startPhase = function(state, phaseConfig) {
    const ctx = { ...state.ctx };
    const G = phaseConfig.onPhaseBegin(state.G, ctx);
    ctx.playOrderPos = phaseConfig.turnOrder.first(G, ctx);
    ctx.currentPlayer = getCurrentPlayer(ctx.playOrder, ctx.playOrderPos);
    ctx.actionPlayers = [ctx.currentPlayer];
    return { ...state, G, ctx };
  };

  const startTurn = function(state, config) {
    let ctx = { ...state.ctx };
    const G = config.onTurnBegin(state.G, ctx);
    ctx = Random.detach(ctx);
    ctx = Events.detach(ctx);
    const _undo = [{ G, ctx }];
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
    let conf = phaseMap[ctx.phase];
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

    // End the new phase automatically if necessary.
    // In order to avoid infinite loops, this is called
    // a finite number of times.
    if (!cascadeDepth) cascadeDepth = 0;
    if (cascadeDepth < phases.length - 1) {
      conf = phaseMap[state.ctx.phase];
      const end = conf.endPhaseIf(state.G, state.ctx);
      if (end) {
        state = endPhaseEvent(state, end, cascadeDepth + 1);
      }
    }

    return state;
  }

  /**
   * endTurn (game event)
   *
   * Ends the current turn.
   * Passes the turn to the next turn in a round-robin fashion.
   */
  function endTurnEvent(state) {
    let { G, ctx } = state;

    const conf = phaseMap[ctx.phase];

    // Prevent ending the turn if movesPerTurn haven't been made.
    if (conf.movesPerTurn && ctx.currentPlayerMoves < conf.movesPerTurn) {
      return state;
    }

    // Run turn-end triggers.
    G = conf.onTurnEnd(G, ctx);

    // Update gameover.
    const gameover = conf.endGameIf(G, ctx);
    if (gameover !== undefined) {
      return { ...state, G, ctx: { ...ctx, gameover } };
    }

    // Update current player.
    const playOrderPos = conf.turnOrder.next(G, ctx);
    const currentPlayer = getCurrentPlayer(ctx.playOrder, playOrderPos);
    const actionPlayers = [currentPlayer];
    // Update turn.
    const turn = ctx.turn + 1;
    // Update state.
    ctx = {
      ...ctx,
      playOrderPos,
      currentPlayer,
      actionPlayers,
      turn,
      currentPlayerMoves: 0,
    };

    // End phase if condition is met.
    const end = conf.endPhaseIf(G, ctx);
    if (end) {
      return endPhaseEvent({ ...state, G, ctx }, end);
    }

    return startTurn({ ...state, G, ctx }, conf);
  }

  function undoEvent(state) {
    const { _undo, _redo } = state;

    if (_undo.length < 2) {
      return state;
    }

    const last = _undo[_undo.length - 1];
    const restore = _undo[_undo.length - 2];

    // only allow undoableMoves to be undoable
    if (undoableMoves && !undoableMoves.includes(last.moveType)) {
      return state;
    }

    return {
      ...state,
      G: restore.G,
      ctx: restore.ctx,
      _undo: _undo.slice(0, _undo.length - 1),
      _redo: [last, ..._redo],
    };
  }

  function redoEvent(state) {
    const { _undo, _redo } = state;

    if (_redo.length == 0) {
      return state;
    }

    const first = _redo[0];

    return {
      ...state,
      G: first.G,
      ctx: first.ctx,
      _undo: [..._undo, first],
      _redo: _redo.slice(1),
    };
  }

  function endGameEvent(state, arg) {
    if (arg === undefined) {
      arg = true;
    }

    return { ...state, ctx: { ...state.ctx, gameover: arg } };
  }

  function processMove(state, action, dispatch) {
    const conf = phaseMap[state.ctx.phase];

    const currentPlayerMoves = state.ctx.currentPlayerMoves + 1;
    state = {
      ...state,
      ctx: { ...state.ctx, currentPlayerMoves },
    };

    const G = conf.onMove(state.G, state.ctx, action);
    state = { ...state, G };

    const gameover = conf.endGameIf(state.G, state.ctx);

    // End the turn automatically if endTurnIf is true  or if endGameIf returns.
    const endTurn = endTurnIfWrap(state.G, state.ctx);
    if (endTurn || gameover !== undefined) {
      state = dispatch(state, { type: 'endTurn', playerID: action.playerID });
    }

    // End the phase automatically if endPhaseIf is true.
    const end = conf.endPhaseIf(state.G, state.ctx);
    if (end || gameover !== undefined) {
      state = dispatch(state, {
        type: 'endPhase',
        args: [end],
        playerID: action.playerID,
      });
    }

    // End the game automatically if endGameIf returns.
    if (gameover !== undefined) {
      return { ...state, ctx: { ...state.ctx, gameover } };
    }

    // Update undo / redo state.
    if (!endTurn) {
      const undo = state._undo || [];
      const moveType = action.payload.type;
      state = {
        ...state,
        _undo: [...undo, { G: state.G, ctx: state.ctx, moveType }],
        _redo: [],
      };
    }

    return state;
  }

  const canMakeMoveWrap = (G, ctx, opts) => {
    const conf = phaseMap[ctx.phase] || {};
    if (conf.allowedMoves) {
      const set = new Set(conf.allowedMoves);
      if (!set.has(opts.type)) {
        return false;
      }
    }

    // run user-provided validation
    if (canMakeMove !== undefined && !canMakeMove(G, ctx, opts)) {
      return false;
    }

    return canMakeMoveDefault(G, ctx, opts);
  };

  let enabledEvents = {};
  if (undoableMoves === undefined || undoableMoves.length > 0) {
    enabledEvents['undo'] = undoEvent;
    enabledEvents['redo'] = redoEvent;
  }
  if (endTurn) enabledEvents['endTurn'] = endTurnEvent;
  if (endPhase) enabledEvents['endPhase'] = endPhaseEvent;
  if (endGame) enabledEvents['endGame'] = endGameEvent;

  return Flow({
    ctx: numPlayers => ({
      numPlayers,
      turn: 0,
      currentPlayer: '0',
      currentPlayerMoves: 0,
      playOrder: Array.from(Array(numPlayers), (d, i) => i),
      playOrderPos: 0,
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
    canMakeMove: canMakeMoveWrap,
  });
}
