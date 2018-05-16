/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { createGameReducer } from './reducer';
import { makeMove } from './action-creators';

// Initial implementation that just takes the first move
// and simulates till the end of the game.
export function Simulate({ game, state, numPlayers }) {
  const reducer = createGameReducer({ game, numPlayers });

  let t = state;
  while (t.ctx.gameover === undefined) {
    const next = game.ai.next(t.G, t.ctx);
    const { move, args } = next[0];
    t = reducer(t, makeMove(move, args));
  }

  return t;
}
