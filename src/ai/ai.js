/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { CreateGameReducer } from '../core/reducer';
import { makeMove } from '../core/action-creators';

// Initial implementation that just takes the first move
// and simulates till the end of the game.
export function Simulate({ game, ai, state, numPlayers }) {
  const reducer = CreateGameReducer({ game, numPlayers });

  let t = state;
  while (t.ctx.gameover === undefined) {
    const next = ai.next(t.G, t.ctx);
    const { move, args } = next[0];
    t = reducer(t, makeMove(move, args));
  }

  return t;
}
