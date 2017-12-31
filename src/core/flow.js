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
 * @param {...object} ctx - The initial value of ctx.
 * @param {...object} events - Object containing functions
 *                             named after events that this
 *                             reducer will handle. Each function
 *                             has the following signature:
 *                             (ctx, G) => ctx
 */
export function Flow({setup, events}) {
  if (!setup)  setup = () => ({});
  if (!events) events = {};

  return {
    setup,
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
 *     Each phase is described by an object:
 *       {
 *         name: 'phase_name',
 *         // Any setup code to run before the phase begins.
 *         setup: (G, ctx) => G,
 *         // Any cleanup code to run after the phase ends.
 *         cleanup: (G, ctx) => G,
 *       }
 *
 * @param {function} config.victory - Function that returns the
 *     ID of the player that won if the game is in a victory state.
 *     Signature: (G, ctx) => { ... },
 *
 * @example
 * Game({
 *   ...
 *
 *   victory: (G, ctx) => { ... },
 *
 *   phases: [
 *     { name: 'A', setup: (G, ctx) => G, cleanup: (G, ctx) => G },
 *     { name: 'B', setup: (G, ctx) => G, cleanup: (G, ctx) => G },
 *     ...
 *   ]
 * })
 */
export function GameFlow(config) {
  const initial = {
    turn: 0,
    currentPlayer: '0',
    winner: null,
  };

  /**
   * endTurn (Event)
   *
   * Ends the current turn.
   * Passes the turn to the next turn in a round-robin fashion.
   */
  const endTurn = ({ G, ctx }) => {
    // Update winner.
    let winner = config.victory ? config.victory(G, ctx) : ctx.winner;
    // Update current player.
    const currentPlayer =
        (+ctx.currentPlayer + 1) % ctx.numPlayers + "";
    // Update turn.
    const turn = ctx.turn + 1;
    // Return new state.
    return { G, ctx: { ...ctx, currentPlayer, turn, winner } };
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
    const currentPhaseConfig = config.phases[0];
    if (currentPhaseConfig.setup) {
      return { ...state, G: currentPhaseConfig.setup(state.G, state.ctx) };
    }
    return state;
  };

  /**
   * endPhase (Event)
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
    if (currentPhaseConfig.cleanup) {
      G = currentPhaseConfig.cleanup(G, ctx);
    }

    // Update the phase.
    const _phaseNum =
        (ctx._phaseNum + 1) % config.phases.length;
    const phase = config.phases[_phaseNum].name;
    ctx = { ...ctx, _phaseNum, phase };

    // Run any setup code for the new phase.
    const newPhaseConfig = config.phases[ctx._phaseNum];
    if (newPhaseConfig.setup) {
      G = newPhaseConfig.setup(G, ctx);
    }

    return { ...state, G, ctx: { ...state.ctx, phase, _phaseNum } };
  };

  return Flow({
    setup: (numPlayers) => ({
      ...initial,
      numPlayers,
      phase: config.phases[0].name,
      _phaseNum: 0,
    }),

    events: { init, endTurn, endPhase }
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
