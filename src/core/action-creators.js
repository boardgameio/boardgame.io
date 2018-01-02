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
 * @param {object} move - The move to dispatch.
 * @param {string} move.type - The move type.
 * @param {Array}  move.args - Additional arguments.
 */
export const makeMove = (move) => ({
  type: Actions.MAKE_MOVE,
  move,
});

/**
 * Generate a game event to be dispatched to the flow reducer.
 *
 * @param {object} e - The event to dispatch.
 * @param {string} e.type - The event type.
 * @param {Array}  e.args - Additional arguments.
 * @param {string}  playerID - The ID of the player making this action.
 */
export const gameEvent = (e, playerID) => ({
  type: Actions.GAME_EVENT,
  e: { ...e, playerID },
});

/**
 * Used to reset the Redux store's state.
 * @param {object} state - The state to restore.
 */
export const restore = (state) => ({
  type:  Actions.RESTORE,
  state,
});
