/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import * as ActionCreators from './action-creators';

/**
 * Helper to create a reducer that manages ctx (with the
 * ability to also update G).
 *
 * You probably want GameFlow below, but you might
 * need to use this directly if you are creating
 * a very customized game flow that GameFlow cannot handle.
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
 */
export function Flow({setup, events, validator}) {
  if (!setup)     setup = () => ({});
  if (!events)    events = {};
  if (!validator) validator = () => true;

  return {
    setup,
    validator,
    eventNames: Object.getOwnPropertyNames(events),
    reducer: (state, action) => {
      if (events.hasOwnProperty(action.type)) {
        const context = events[action.type];
        const args = [state].concat(action.args);
        return events[action.type].apply(context, args);
      }
      return state;
    },
  };
}

/**
 * TurnOrder
 *
 * Set of different turn orders possible in a phase.
 * Each function returns the next player given G and ctx.
 *
 * You can define your own and pass it to the `turnOrder`
 * setting in the phase config object (see below).
 */
export const TurnOrder = {
  // Default round-robin order.
  DEFAULT: {
    first: (G, ctx) => ctx.currentPlayer,
    next: (G, ctx) => ((+ctx.currentPlayer + 1) % ctx.numPlayers + ""),
  },

  // Any player can play and there isn't a currentPlayer really.
  ANY: {
    first: () => 'any',
    next: () => 'any',
  },
};

/**
 * GameFlow
 *
 * Wrapper around Flow that creates a reducer to manage ctx.
 * (with the ability to also update G).
 *
 * This is somewhat analogous to Game(), which creates
 * a reducer to just manage G. It works at a higher level
 * than Flow, also incorporating phases. You will typically
 * not use this directly, but pass it options from the Game
 * object, which accepts 'victory' and 'phases'.
 *
 * @param {object} config - The config object that specifies various
 *                          things about the flow of the game.
 *
 * @param {Array} config.phases - A list of phases in the game.
 *                                Each phase is described by an object:
 * {
 *   name: 'phase_name',
 *   // Any setup code to run before the phase begins.
 *   setup: (G, ctx) => G,
 *   // Any cleanup code to run after the phase ends.
 *   cleanup: (G, ctx) => G,
 *   // The phase ends if this function returns true.
 *   phaseEndCondition: (G, ctx) => boolean
 *   // Called when `endTurn` is processed, and returns the next player.
 *   // If not specified, TurnOrder.DEFAULT is used.
 *   turnOrder: {
 *     // The first player.
 *     first: (G, ctx) => playerID,
 *     // Called whenever `endTurn` is processed to determine
 *     // the next player.
 *     next: (G, ctx) => playerID,
 *   },
 *   // List of moves that are allowed in this phase.
 *   allowedMoves: ['moveA', ...],
 * }
 *
 * A phase ends when the phaseEndCondition is met, or if the
 * game reducer receives a 'endPhase' game event.
 *
 * @param {function} config.victory - Function that returns the
 *     ID of the player that won if the game is in a victory state.
 *     Signature: (G, ctx) => { ... },
 */
export function GameFlow(config) {
  // Attach defaults.
  if (config.phases) {
    for (let conf of config.phases) {
      if (!conf.turnOrder) {
        conf.turnOrder = TurnOrder.DEFAULT;
      }
      if (!conf.phaseEndCondition) {
        conf.phaseEndCondition = () => false;
      }
      if (!conf.setup) {
        conf.setup = G => G;
      }
      if (!conf.cleanup) {
        conf.cleanup = G => G;
      }
    }
  }

  const initial = {
    turn: 0,
    currentPlayer: '0',
    winner: null,
  };

  // Helper to perform start-of-phase initialization.
  const startPhase = (state, phaseConfig) => {
    const G = phaseConfig.setup(state.G, state.ctx);
    const currentPlayer = phaseConfig.turnOrder.first(G, state.ctx);
    return { ...state, G, ctx: { ...state.ctx, currentPlayer } };
  };

  /**
   * endPhase (game event)
   *
   * Ends the current phase.
   * Also runs any phase cleanup code and setup code for the
   * next phase (if any).
   */
  const endPhase = (state) => {
    let G = state.G;
    let ctx = state.ctx;

    // Run any cleanup code for the phase that is about to end.
    const currentPhaseConfig = config.phases[ctx._phaseNum];
    G = currentPhaseConfig.cleanup(G, ctx);

    // Update the phase.
    const _phaseNum = (ctx._phaseNum + 1) % config.phases.length;
    const phase = config.phases[_phaseNum].name;
    ctx = { ...ctx, _phaseNum, phase };

    // Run any setup code for the new phase.
    const newPhaseConfig = config.phases[ctx._phaseNum];
    return startPhase({G, ctx}, newPhaseConfig);
  };

  /**
   * endTurn (game event)
   *
   * Ends the current turn.
   * Passes the turn to the next turn in a round-robin fashion.
   */
  const endTurn = (state) => {
    let phaseEndCondition = () => false;
    let turnOrder = TurnOrder.DEFAULT;

    if (config.phases) {
      const conf = config.phases[state.ctx._phaseNum];

      if (conf.turnOrder) {
        turnOrder = conf.turnOrder;
      }

      if (conf.phaseEndCondition) {
        phaseEndCondition = conf.phaseEndCondition;
      }
    }

    // Update winner.
    let winner = config.victory ? config.victory(state.G, state.ctx) : state.ctx.winner;

    // Update current player.
    const currentPlayer = turnOrder.next(state.G, state.ctx);

    // Update turn.
    const turn = state.ctx.turn + 1;

    // Return new state.
    state = { G: state.G, ctx: { ...state.ctx, currentPlayer, turn, winner } };

    // End phase if condition is met.
    if (phaseEndCondition(state.G, state.ctx)) {
      state = endPhase(state);
    }

    return state;
  };

  // Simple flow if the user doesn't provide a config object.
  // It provides a single 'endTurn' event, which passes the
  // turn to players in a round-robin order, and checks for
  // victory at the end of each turn.
  if (!config.phases) {
    return Flow({
      setup: numPlayers => ({
        ...initial,
        numPlayers,
      }),
      events: { endTurn },
    });
  }

  /**
   * init (Event)
   *
   * Runs any setup code defined for the first phase of the game.
   * This is called at the beginning of the game automatically
   * before any turns are made.
   */
  const init = (state) => {
    const conf = config.phases[0];
    return startPhase(state, conf);
  };

  const validator = (G, ctx, move) => {
    const conf = config.phases[ctx._phaseNum];
    if (conf.allowedMoves) {
      const set = new Set(conf.allowedMoves);
      return set.has(move.type);
    }
    return true;
  };

  return Flow({
    setup: (numPlayers) => ({
      ...initial,
      numPlayers,
      phase: config.phases[0].name,
      _phaseNum: 0,
    }),
    events: { init, endTurn, endPhase },
    validator,
  });
}

/**
 * createEventDispatchers
 *
 * Creates a set of dispatchers to dispatch game flow events.
 * @param {Array} eventNames - A list of event names.
 * @param {object} store - The Redux store to create dispatchers for.
 */
export function createEventDispatchers(eventNames, store) {
  let dispatchers = {};
  for (const name of eventNames) {
    dispatchers[name] = function(...args) {
      store.dispatch(ActionCreators.gameEvent({
        type: name,
        args: args
      }));
    };
  }
  return dispatchers;
}
