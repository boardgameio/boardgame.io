/*
 * Copyright 2017 The boardgame.io Authors
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
 * @param {...object} game - Return value of Game().
 * @param {...object} numPlayers - The number of players.
 * @param {...object} multiplayer - Set to true if we are in a multiplayer client.
 */
export function createGameReducer({ game, numPlayers, multiplayer }) {
  if (!numPlayers) {
    numPlayers = 2;
  }

  const initial = {
    // User managed state.
    G: game.setup(numPlayers),

    // Framework managed state.
    ctx: game.flow.ctx(numPlayers),

    // A list of actions performed so far. Used by the
    // GameLog to display a journal of moves.
    log: [],

    // A monotonically non-decreasing ID to ensure that
    // state updates are only allowed from clients that
    // are at the same version that the server.
    _id: 0,

    // A snapshot of this object so that actions can be
    // replayed over it to view old snapshots.
    _initial: {},
  };

  const state = game.flow.init({ G: initial.G, ctx: initial.ctx });
  initial.G = state.G;
  initial.ctx = state.ctx;

  const deepCopy = obj => JSON.parse(JSON.stringify(obj));
  initial._initial = deepCopy(initial);

  /**
   * GameReducer
   *
   * Redux reducer that maintains the overall game state.
   * @param {object} state - The state before the action.
   * @param {object} action - A Redux action.
   */
  return (state = initial, action) => {
    switch (action.type) {
      case Actions.GAME_EVENT: {
        // Process game events only on the server.
        // These events like `endTurn` typically
        // contain code that may rely on secret state
        // and cannot be computed on the client.
        if (multiplayer) {
          return state;
        }

        const { G, ctx } = game.flow.processGameEvent(
          { G: state.G, ctx: state.ctx },
          action.payload
        );
        const log = [...state.log, action];
        return { ...state, G, ctx, log, _id: state._id + 1 };
      }

      case Actions.MAKE_MOVE: {
        // Ignore the move if it isn't valid at this point.
        if (!game.flow.validator(state.G, state.ctx, action.payload)) {
          return state;
        }

        // Process the move.
        const G = game.processMove(state.G, action.payload, state.ctx);
        const log = [...state.log, action];
        state = { ...state, G, log, _id: state._id + 1 };

        // If we're on the client, just process the move
        // and no triggers in multiplayer mode.
        // These will be processed on the server, which
        // will send back a state update.
        if (multiplayer) {
          return state;
        }

        // Allow the flow reducer to process any triggers that happen after moves.
        return game.flow.processMove(state, action);
      }

      case Actions.RESTORE: {
        return action.state;
      }

      default: {
        return state;
      }
    }
  };
}

/**
 * createMoveDispatchers
 *
 * Creates a set of dispatchers to make moves.
 * @param {Array} moveNames - A list of move names.
 * @param {object} store - The Redux store to create dispatchers for.
 */
export function createMoveDispatchers(moveNames, store, playerID) {
  let dispatchers = {};
  for (const name of moveNames) {
    dispatchers[name] = function(...args) {
      store.dispatch(ActionCreators.makeMove(name, args, playerID));
    };
  }
  return dispatchers;
}
