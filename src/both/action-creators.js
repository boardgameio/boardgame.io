/*
 * Copyright 2017 Google Inc.
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

// Redux actions for the GameState reducer.

import * as Actions from './action-types';

/*
 * makeMove
 *
 * Generate a move to be dispatched to the game move reducer.
 *
 * move.type should contain the move name, and
 * move.args should contain any additional arguments.
 */
export const makeMove = (move) => ({
  type: Actions.MAKE_MOVE,
  move: move,
});

export const endTurn = () => ({
  type: Actions.END_TURN,
});

export const restore = (state) => ({
  type:  Actions.RESTORE,
  state: state,
});
