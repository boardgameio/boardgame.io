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
 * You probably want one of the wrappers below, but you might
 * need to use this directly if you are creating
 * a very customized game flow that they cannot handle.
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
 * SimpleFlow
 *
 * Simple game flow that just passes the turn around in
 * round-robin fashion without any game phases.
 *
 * @param {...object} movesPerTurn - End the turn automatically after a certain number
 *                                   of moves (default: undefined, i.e. the turn does
 *                                   not automatically end after a certain number of moves).
 *
 * @param {...object} endTurnIf - The turn automatically ends if this function
 *                                returns true (checked after each move).
 *                                (G, ctx) => boolean
 * @param {...object} endGameIf - The game automatically ends if this function
 *                                returns anything (checked after each move).
 *                                The return value is available at `ctx.gameover`.
 *                                (G, ctx) => {}
 * @param {...object} onTurnEnd - Any code to run when a turn ends.
 *                                (G, ctx) => G
 * @param {...object} triggers - An array of objects with the format:
 *                               {
 *                                 condition: (G, ctx) => boolean,
 *                                 action: (G, ctx) => action,
 *                               }
 *                               Whenever `condition` is true the `action` is run.
 *                               Triggers are processed one after the other in the
 *                               order they are defined at the end of each move.
 */
export function SimpleFlow({
  movesPerTurn,
  endTurnIf,
  endGameIf,
  onTurnEnd,
  triggers,
}) {
  if (!endTurnIf) endTurnIf = () => false;
  if (!endGameIf) endGameIf = () => undefined;
  if (!onTurnEnd) onTurnEnd = G => G;
  if (!triggers) triggers = [];

  const endTurnIfWrap = (G, ctx) => {
    if (movesPerTurn && ctx.currentPlayerMoves >= movesPerTurn) {
      return true;
    }
    return endTurnIf(G, ctx);
  };

  /**
   * endTurn (game event)
   *
   * Ends the current turn.
   * Passes the turn to the next turn in a round-robin fashion.
   */
  function endTurn(state) {
    const G = onTurnEnd(state.G, state.ctx);
    state = { ...state, G };

    // Update gameover.
    const gameover = endGameIf(state.G, state.ctx);
    if (gameover !== undefined) {
      return { ...state, ctx: { ...state.ctx, gameover } };
    }

    // Update current player.
    const currentPlayer = TurnOrder.DEFAULT.next(state.G, state.ctx);
    // Update turn.
    const turn = state.ctx.turn + 1;
    // Return new state.
    return {
      ...state,
      ctx: { ...state.ctx, currentPlayer, turn, currentPlayerMoves: 0 },
    };
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

    // End the game automatically if endGameIf is true.
    const gameover = endGameIf(state.G, state.ctx);
    if (gameover !== undefined) {
      return { ...state, ctx: { ...state.ctx, gameover } };
    }

    // End the turn automatically if endTurnIf is true.
    if (endTurnIfWrap(state.G, state.ctx)) {
      state = dispatch(state, { type: 'endTurn', playerID: action.playerID });
    }

    return state;
  }

  return Flow({
    ctx: numPlayers => ({
      numPlayers,
      turn: 0,
      currentPlayer: '0',
      currentPlayerMoves: 0,
    }),
    events: { endTurn },
    processMove,
  });
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
 * @param {...object} phases - A list of phases in the game.
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
 *   // Any code to run when a turn ends in this phase.
 *   onTurnEnd: (G, ctx) => G,
 *
 *   // Any code to run when a player passes in this phase.
 *   onPass: (G, ctx) => G,
 *
 *   // The phase ends if this function returns true.
 *   // If the return value is the name of another phase,
 *   // that will be chosen as the next phase (as opposed
 *   // to the next one in round-robin order).
 *   // The phase can also end when the `endPhase` game event happens.
 *   endPhaseIf: (G, ctx) => {},
 *
 *   // A phase-specific endTurnIf.
 *   endTurnIf: (G, ctx) => boolean,
 *
 *   // A phase-specific endGameIf.
 *   endGameIf: (G, ctx) => {},
 *
 *   // A phase-specific movesPerTurn.
 *   movesPerTurn: integer,
 *
 *   // Called when `endTurn` is processed, and returns the next player.
 *   // If not specified, TurnOrder.DEFAULT is used.
 *   turnOrder: {
 *     // The first player.
 *     first: (G, ctx) => playerID,
 *     // Called whenever `endTurn` is processed to determine
 *     // the next player.
 *     next: (G, ctx) => playerID,
 *   },
 *
 *   // List of moves that are allowed in this phase.
 *   allowedMoves: ['moveA', ...],
 * }
 *
 *
 * Global options (not associated with any phase):
 * Most of these can be overriden on a per-phase basis (except triggers).
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
 * @param {...object} triggers - An array of objects with the format:
 *                               {
 *                                 condition: (G, ctx) => boolean,
 *                                 action: (G, ctx) => action,
 *                               }
 *                               Whenever `condition` is true the `action` is run.
 *                               Triggers are processed one after the other in the
 *                               order they are defined at the end of each move.
 */
export function FlowWithPhases({
  phases,
  movesPerTurn,
  endTurnIf,
  endGameIf,
  onTurnEnd,
  triggers,
}) {
  // Attach defaults.
  if (!phases) phases = [{ name: 'default' }];
  if (!endTurnIf) endTurnIf = () => false;
  if (!endGameIf) endGameIf = () => undefined;
  if (!onTurnEnd) onTurnEnd = G => G;
  if (!triggers) triggers = [];

  let phaseKeys = [];
  let phaseMap = {};

  for (let conf of phases) {
    phaseKeys.push(conf.name);
    phaseMap[conf.name] = conf;

    if (!conf.turnOrder) {
      conf.turnOrder = TurnOrder.DEFAULT;
    }
    if (!conf.endPhaseIf) {
      conf.endPhaseIf = () => false;
    }
    if (!conf.onPhaseBegin) {
      conf.onPhaseBegin = G => G;
    }
    if (!conf.onPhaseEnd) {
      conf.onPhaseEnd = G => G;
    }
    if (!conf.onPass) {
      conf.onPass = G => G;
    }
  }

  const endTurnIfWrap = (G, ctx) => {
    const conf = phaseMap[ctx.phase];
    if (conf.movesPerTurn && ctx.currentPlayerMoves >= conf.movesPerTurn) {
      return true;
    }
    if (conf.endTurnIf) {
      return conf.endTurnIf(G, ctx);
    }
    if (movesPerTurn && ctx.currentPlayerMoves >= movesPerTurn) {
      return true;
    }
    return endTurnIf(G, ctx);
  };

  const endGameIfWrap = (G, ctx) => {
    const conf = phaseMap[ctx.phase];
    if (conf.endGameIf) {
      return conf.endGameIf(G, ctx);
    }
    return endGameIf(G, ctx);
  };

  const onTurnEndWrap = (G, ctx) => {
    const conf = phaseMap[ctx.phase];
    if (conf.onTurnEnd) {
      return conf.onTurnEnd(G, ctx);
    }
    return onTurnEnd(G, ctx);
  };

  // Helper to perform start-of-phase initialization.
  const startPhase = function(state, phaseConfig) {
    const ctx = { ...state.ctx, passMap: {}, allPassed: false };
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
  function endPhase(state, nextPhase) {
    let G = state.G;
    let ctx = state.ctx;

    // Run any cleanup code for the phase that is about to end.
    const conf = phaseMap[ctx.phase];
    G = conf.onPhaseEnd(G, ctx);

    const gameover = endGameIfWrap(G, ctx);
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
  function endTurn(state) {
    let G = state.G;
    let ctx = state.ctx;

    const conf = phaseMap[ctx.phase];

    // Run turn-end triggers.
    G = onTurnEndWrap(G, ctx);

    // Update gameover.
    const gameover = endGameIfWrap(G, ctx);
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
      return endPhase({ ...state, G, ctx }, end);
    }

    return { ...state, G, ctx };
  }

  /**
   * pass (game event)
   *
   * The current player passes (and ends the turn).
   */
  function pass(state) {
    let G = state.G;
    let ctx = state.ctx;
    const conf = phaseMap[state.ctx.phase];
    G = conf.onPass(G, ctx);

    // Mark that the player has passed.
    const playerID =
      ctx.currentPlayer == 'any' ? this.playerID : ctx.currentPlayer;

    if (playerID !== undefined) {
      let passMap = { ...ctx.passMap };
      passMap[playerID] = true;
      ctx = { ...ctx, passMap };

      if (Object.keys(passMap).length >= ctx.numPlayers) {
        ctx.allPassed = true;
      }
    }

    return endTurn({ ...state, G, ctx });
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

    // End the game automatically if endGameIf is true.
    const gameover = endGameIfWrap(state.G, state.ctx);
    if (gameover !== undefined) {
      return { ...state, ctx: { ...state.ctx, gameover } };
    }

    // End the phase automatically if endPhaseIf is true.
    const conf = phaseMap[state.ctx.phase];
    const end = conf.endPhaseIf(state.G, state.ctx);
    if (end) {
      state = dispatch(state, {
        type: 'endPhase',
        args: [end],
        playerID: action.playerID,
      });
    }

    // End the turn automatically if endTurnIf is true.
    if (endTurnIfWrap(state.G, state.ctx)) {
      state = dispatch(state, { type: 'endTurn', playerID: action.playerID });
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

  return Flow({
    ctx: numPlayers => ({
      numPlayers,
      turn: 0,
      currentPlayer: '0',
      currentPlayerMoves: 0,
      phase: phases[0].name,
      passMap: {},
      allPassed: false,
    }),
    init: state => startPhase(state, phases[0]),
    events: { endTurn, endPhase, pass },
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
