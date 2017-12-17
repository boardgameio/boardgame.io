/*
 * Copyright 2017 Google Inc.
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import * as Actions from './action-types';
import * as ActionCreators from './action-creators';

/**
 * createGameReducer
 *
 * Creates the main game state reducer.
 */
function createGameReducer({game, numPlayers}) {
  if (!game)       game = { G: {}, names: [], reducer: G => G };
  if (!numPlayers) numPlayers = 2;

  const initial = {
    G: game.G,
    ctx: {
      turn: 0,
      currentPlayer: 0,
      numPlayers: numPlayers,
    },
    log: [],
    _id: 0,
    _initial: {}
  };

  // Store the initial version of state so that we can see
  // previous versions by replaying actions over the initial
  // version.
  const deepCopy = obj => JSON.parse(JSON.stringify(obj));
  initial._initial = deepCopy(initial);

  /*
   * GameState
   *
   * Redux reducer that maintains the overall game state.
   */
  return (state = initial, action) => {
    switch (action.type) {
      case Actions.MAKE_MOVE: {
        const G = game.reducer(state.G, action.move, state.ctx);
        const log = [...state.log, action];
        return {...state, G, _id: state._id + 1, log};
      }

      case Actions.END_TURN: {
        // The game may have some end of turn clean up.
        const G = game.reducer(
            state.G, { type: Actions.END_TURN }, state.ctx);

        let ctx = state.ctx;

        // Update current player.
        const currentPlayer =
            (ctx.currentPlayer + 1) % ctx.numPlayers;

        // Update turn.
        const turn = ctx.turn + 1;

        ctx = {...ctx, currentPlayer, turn};

        // Update log.
        const log = [...state.log, action];

        return {...state, G, ctx, _id: state._id + 1, log};
      }

      case Actions.RESTORE: {
        return action.state;
      }

      default:
        return state;
    }
  };
}

/**
 * createDispatchers
 *
 * Creates a set of dispatchers to make moves.
 */
function createDispatchers(moveNames, store) {
  let dispatchers = {};
  for (const name of moveNames) {
    dispatchers[name] = function(...args) {
      store.dispatch(ActionCreators.makeMove({
        type: name,
        args: args
      }));
    };
  }
  return dispatchers;
}

export { createGameReducer, createDispatchers };
