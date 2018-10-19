/*
 * Copyright 2018 The boardgame.io Authors.
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { Game } from 'boardgame.io/core';

export default {
  description: () => null,

  game: Game({
    flow: {
      setActionPlayers: true,

      phases: [
        { name: 'move', allowedMoves: ['play'] },
        { name: 'discard', allowedMoves: ['discard'] },
      ],
    },

    moves: {
      play(G, ctx) {
        ctx.events.endPhase();
        ctx.events.setActionPlayers({ allOthers: true, once: true });
        return G;
      },

      discard(G) {
        return G;
      },
    },
  }),
};
