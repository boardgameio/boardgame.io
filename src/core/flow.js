/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import * as ActionCreators from './action-creators';

/**
 * Helper to create a GameFlow reducer that manages ctx.
 * This is somewhat analogous to Game(), which creates
 * a reducer to manage G.
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
    reducer: (state, action, G) => {
      if (events.hasOwnProperty(action.type)) {
        const context = events[action.type];
        const args = [state, G].concat(action.args);
        return events[action.type].apply(context, args);
      }
      return state;
    },
  };
}

/**
 * createDispatchers
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

export const DEFAULT = game => Flow({
  setup: (numPlayers) => ({
    turn: 0,
    currentPlayer: '0',
    numPlayers: numPlayers,
    winner: null,
  }),

  events: {
    endTurn(ctx, G) {
      // Update winner.
      const winner = game.victory(G, ctx);
      // Update current player.
      const currentPlayer =
          (+ctx.currentPlayer + 1) % ctx.numPlayers + "";
      // Update turn.
      const turn = ctx.turn + 1;
      // Return new ctx.
      return {...ctx, currentPlayer, turn, winner};
    },
  }
});
