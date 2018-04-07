/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { Game, PlayerView } from 'boardgame.io/core';

const LiarsDice = Game({
  name: 'liars-dice',

  setup: () => ({
    players: {
      0: [4, 4, 2, 6, 1],
      1: [4, 5, 6, 3, 3],
      2: [1, 1, 2, 4, 3],
    },
  }),

  moves: {
    bid(G, ctx, id) {
      const cells = [...G.cells];

      if (cells[id] === null) {
        cells[id] = ctx.currentPlayer;
      }

      return { ...G, cells };
    },
  },

  playerView: PlayerView.STRIP_SECRETS,
});

export default LiarsDice;
