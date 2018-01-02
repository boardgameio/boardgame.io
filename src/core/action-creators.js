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
  move: move,
});

/**
 * End the current turn and yield to the next player.
 */
export const endTurn = () => ({
  type: Actions.END_TURN,
});

/**
 * Used to reset the Redux store's state.
 * @param {object} state - The state to restore.
 */
export const restore = (state) => ({
  type:  Actions.RESTORE,
  state: state,
});
