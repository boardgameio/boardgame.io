/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import * as ActionCreators from './action-creators';

/**
 * Helper to create a reducer that manages ctx (and G).
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
 * Wrapper around Flow that (also) creates a reducer that manages ctx.
 * This is somewhat analogous to Game(), which creates
 * a reducer to manage G. It works at a higher level
 * than Flow, incorporating phases and so on.
 *
 * @param {object} config - The config object that specifies various
 *                          things about the flow of the game.
 * @param {object} config.phases - An object specifying the phases of the
 *                                 game as keys.
 */
export function GameFlow(config) {
  const phaseKeys =
      config.phases ? Object.keys(config.phases) : [];

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

  const endPhase = (state) => {
    let G = state.G;
    let ctx = state.ctx;

    // Run any cleanup code for the phase that is about to end.
    const currentPhaseConfig = config.phases[ctx.phase];
    if (currentPhaseConfig.cleanup) {
      G = currentPhaseConfig.cleanup(G, ctx);
    }

    // Update the phase.
    const _phaseNum =
        (ctx._phaseNum + 1) % phaseKeys.length;
    const phase = phaseKeys[_phaseNum];
    ctx = { ...ctx, _phaseNum, phase };

    // Run any setup code for the new phase.
    const newPhaseConfig = config.phases[ctx.phase];
    if (newPhaseConfig.setup) {
      G = newPhaseConfig.setup(G, ctx);
    }

    return { ...state, G, ctx: { ...state.ctx, phase, _phaseNum } };
  };

  const init = (state) => {
    let G = state.G;
    let ctx = state.ctx;

    const currentPhaseConfig = config.phases[ctx.phase];
    if (currentPhaseConfig.setup) {
      G = currentPhaseConfig.setup(G, ctx);
    }

    return { ...state, G, ctx };
  };

  let events = { endTurn };
  if (config.phases) {
    events = { endTurn, endPhase, init };
  }

  return Flow({
    setup: (numPlayers) => {
      const initial = {
        turn: 0,
        currentPlayer: '0',
        numPlayers: numPlayers,
        winner: null,
      };

      if (config.phases) {
        initial._phaseNum = 0;
        initial.phase = phaseKeys[0];
      }

      return initial;
    },

    events,
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
