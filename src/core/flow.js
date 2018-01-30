/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import * as ActionCreators from './action-creators';
import { TurnOrder } from './turn-order';

/**
 * Helper to create a reducer that manages ctx (with the
 * ability to also update G).
 *
 * You probably want to use FlowWithPhases below, but you might
 * need to use this directly if you are creating a very customized
 * game flow that it cannot handle.
 *
 * @param {...object} setup - Function with the signature
 *                            numPlayers => ctx
 *                            that determines the initial value of ctx.
 * @param {...object} events - Object containing functions
 *                             named after events that this
 *                             reducer will handle. Each function
 *                             has the following signature:
 *                             ({G, ctx}) => {G, ctx}
 * @param {...object} validator - A move validator that returns false
 *                                if a particular type of move is invalid
 *                                at this point in the game.
 *                                (G, ctx, moveName) => boolean
 * @param {...object} processMove - A function that's called whenever a move is made.
 *                                  (state, action, dispatch) => state.
 */
export function Flow({ ctx, events, init, validator, processMove }) {
  if (!ctx) ctx = () => ({});
  if (!events) events = {};
  if (!init) init = state => state;
  if (!validator) validator = () => true;
  if (!processMove) processMove = state => state;

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

    // Disallow moves once the game is over.
    // Also call any provided additional validation.
    validator: (G, ctx, move) => {
      if (ctx.gameover !== undefined) return false;
      return validator(G, ctx, move);
    },

    eventNames: Object.getOwnPropertyNames(events),

    processMove: (state, action) => {
      return processMove(state, action, dispatch);
    },

    processGameEvent: (state, action) => {
      return dispatch(state, action);
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
 * @param {...object} onTurnEnd - Any code to run when a turn ends.
 *                                (G, ctx) => G
 *
 * @param {...object} turnOrder - Customize the turn order (see turn-order.js).
 *
 * @param {...object} triggers - An array of objects with the format:
 *                               {
 *                                 condition: (G, ctx) => boolean,
 *                                 action: (G, ctx) => action,
 *                               }
 *                               Whenever `condition` is true the `action` is run.
 *                               Triggers are processed one after the other in the
 *                               order they are defined at the end of each move.
 *
 * @param {...object} endTurn - Set to false to disable the `endTurn` event.
 *
 * @param {...object} endPhase - Set to false to disable the `endPhase` event.
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
 *   // A phase-specific onTurnEnd.
 *   onTurnEnd: (G, ctx) => G,
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
  onTurnEnd,
  turnOrder,
  triggers,
  endTurn,
  endPhase,
}) {
  // Attach defaults.
  if (endPhase === undefined && phases) {
    endPhase = true;
  }
  if (endTurn === undefined) {
    endTurn = true;
  }
  if (!phases) phases = [{ name: 'default' }];
  if (!endTurnIf) endTurnIf = () => false;
  if (!endGameIf) endGameIf = () => undefined;
  if (!onTurnEnd) onTurnEnd = G => G;
  if (!turnOrder) turnOrder = TurnOrder.DEFAULT;
  if (!triggers) triggers = [];

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
    if (conf.onTurnEnd === undefined) {
      conf.onTurnEnd = onTurnEnd;
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

  // Helper to perform start-of-phase initialization.
  const startPhase = function(state, phaseConfig) {
    const ctx = { ...state.ctx };
    const G = phaseConfig.onPhaseBegin(state.G, ctx);
    ctx.currentPlayer = phaseConfig.turnOrder.first(G, ctx);
    return { ...state, G, ctx };
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
  function endPhaseEvent(state, nextPhase) {
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
    return startPhase({ ...state, G, ctx }, phaseMap[ctx.phase]);
  }

  /**
   * endTurn (game event)
   *
   * Ends the current turn.
   * Passes the turn to the next turn in a round-robin fashion.
   */
  function endTurnEvent(state) {
    let G = state.G;
    let ctx = state.ctx;

    const conf = phaseMap[ctx.phase];

    // Run turn-end triggers.
    G = conf.onTurnEnd(G, ctx);

    // Update gameover.
    const gameover = conf.endGameIf(G, ctx);
    if (gameover !== undefined) {
      return { ...state, G, ctx: { ...ctx, gameover } };
    }

    // Update current player.
    const currentPlayer = conf.turnOrder.next(G, ctx);
    // Update turn.
    const turn = ctx.turn + 1;
    // Update state.
    ctx = { ...ctx, currentPlayer, turn, currentPlayerMoves: 0 };

    // End phase if condition is met.
    const end = conf.endPhaseIf(G, ctx);
    if (end) {
      return endPhaseEvent({ ...state, G, ctx }, end);
    }

    return { ...state, G, ctx };
  }

  function processMove(state, action, dispatch) {
    // Update currentPlayerMoves.
    const currentPlayerMoves = state.ctx.currentPlayerMoves + 1;
    state = { ...state, ctx: { ...state.ctx, currentPlayerMoves } };

    // Process triggers.
    for (const trigger of triggers) {
      if (trigger.condition(state.G, state.ctx)) {
        const G = trigger.action(state.G, state.ctx);
        state = { ...state, G };
      }
    }

    const conf = phaseMap[state.ctx.phase];
    const gameover = conf.endGameIf(state.G, state.ctx);

    // End the turn automatically if endTurnIf is true  or if endGameIf returns.
    if (endTurnIfWrap(state.G, state.ctx) || gameover !== undefined) {
      state = dispatch(state, { type: 'endTurn', playerID: action.playerID });
    }

    // End the game automatically if endGameIf returns.
    if (gameover !== undefined) {
      return { ...state, ctx: { ...state.ctx, gameover } };
    }

    // End the phase automatically if endPhaseIf is true.
    const end = conf.endPhaseIf(state.G, state.ctx);
    if (end) {
      state = dispatch(state, {
        type: 'endPhase',
        args: [end],
        playerID: action.playerID,
      });
    }

    return state;
  }

  const validator = (G, ctx, move) => {
    const conf = phaseMap[ctx.phase];
    if (conf.allowedMoves) {
      const set = new Set(conf.allowedMoves);
      return set.has(move.type);
    }
    return true;
  };

  let enabledEvents = {};
  if (endTurn) enabledEvents['endTurn'] = endTurnEvent;
  if (endPhase) enabledEvents['endPhase'] = endPhaseEvent;

  return Flow({
    ctx: numPlayers => ({
      numPlayers,
      turn: 0,
      currentPlayer: '0',
      currentPlayerMoves: 0,
      phase: phases[0].name,
    }),
    init: state => startPhase(state, phases[0]),
    events: enabledEvents,
    validator,
    processMove,
  });
}

/**
 * createEventDispatchers
 *
 * Creates a set of dispatchers to dispatch game flow events.
 * @param {Array} eventNames - A list of event names.
 * @param {object} store - The Redux store to create dispatchers for.
 * @param {string} playerID - The ID of the player dispatching these events.
 */
export function createEventDispatchers(eventNames, store, playerID) {
  let dispatchers = {};
  for (const name of eventNames) {
    dispatchers[name] = function(...args) {
      store.dispatch(ActionCreators.gameEvent(name, args, playerID));
    };
  }
  return dispatchers;
}
