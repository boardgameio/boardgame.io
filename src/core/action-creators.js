/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import * as Actions from './action-types';

/**
 * Generate a move to be dispatched to the game move reducer.
 *
 * @param {string} type - The move type.
 * @param {Array}  args - Additional arguments.
 * @param {string}  playerID - The ID of the player making this action.
 * @param {string}  credentials - (optional) The credentials for the player making this action.
 */
export const makeMove = (type, args, playerID, credentials) => ({
  type: Actions.MAKE_MOVE,
  payload: { type, args, playerID, credentials },
});

/**
 * Generate a game event to be dispatched to the flow reducer.
 *
 * @param {string} type - The event type.
 * @param {Array}  args - Additional arguments.
 * @param {string}  playerID - The ID of the player making this action.
 * @param {string}  credentials - (optional) The credentials for the player making this action.
 */
export const gameEvent = (type, args, playerID, credentials) => ({
  type: Actions.GAME_EVENT,
  payload: { type, args, playerID, credentials },
});

/**
 * Generate an automatic game event that is a side-effect of a move.
 * @param {string} type - The event type.
 * @param {Array}  args - Additional arguments.
 * @param {string}  playerID - The ID of the player making this action.
 * @param {string}  credentials - (optional) The credentials for the player making this action.
 */
export const automaticGameEvent = (type, args, playerID, credentials) => ({
  type: Actions.GAME_EVENT,
  payload: { type, args, playerID, credentials },
  automatic: true,
});

/**
 * Used to reset the Redux store's state on a sync.
 * @param {object} state - The state to restore.
 * @param {Array} log - The log to restore.
 */
export const sync = (state, log) => ({
  type: Actions.SYNC,
  state,
  log,
  clientOnly: true,
});

/**
 * Used to update the Redux store's state in response to
 * an action coming from another player.
 * @param {object} state - The state to restore.
 * @param {Array} deltalog - A log delta.
 */
export const update = (state, deltalog) => ({
  type: Actions.UPDATE,
  state,
  deltalog,
  clientOnly: true,
});

/**
 * Used to reset the game state.
 * @param {object} state - The initial state.
 */
export const reset = state => ({
  type: Actions.RESET,
  state,
  clientOnly: true,
});

/**
 * Used to undo the last move.
 * @param {string}  playerID - The ID of the player making this action.
 * @param {string}  credentials - (optional) The credentials for the player making this action.
 */
export const undo = (playerID, credentials) => ({
  type: Actions.UNDO,
  payload: { playerID, credentials },
});

/**
 * Used to redo the last undone move.
 * @param {string}  playerID - The ID of the player making this action.
 * @param {string}  credentials - (optional) The credentials for the player making this action.
 */
export const redo = (playerID, credentials) => ({
  type: Actions.REDO,
  payload: { playerID, credentials },
});
