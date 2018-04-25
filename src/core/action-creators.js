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
 * Used to reset the Redux store's state.
 * @param {object} state - The state to restore.
 */
export const restore = state => ({
  type: Actions.RESTORE,
  state,
});

/**
 * Used to reset the game state.
 */
export const reset = () => ({
  type: Actions.RESET,
});

/**
 * Used to undo the last move.
 */
export const undo = () => ({
  type: Actions.UNDO,
});

/**
 * Used to redo the last undone move.
 */
export const redo = () => ({
  type: Actions.REDO,
});
