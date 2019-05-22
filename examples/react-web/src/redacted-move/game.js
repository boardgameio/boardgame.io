/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { Game, PlayerView, TurnOrder } from 'boardgame.io/core';

const RedactedMoves = Game({
  name: 'secret-state',

  setup: () => ({
    other: {},
    players: {
      0: 'player 0 state',
      1: 'player 1 state',
    },
  }),

  moves: {
    clickCell: {
      /* eslint-disable no-unused-vars */
      impl: (G, ctx, secretstuff) => {
        return { ...G };
      },
      /* eslint-enable no-unused-vars */
      redact: true,
    },
  },

  turn: { order: TurnOrder.ANY },

  playerView: PlayerView.STRIP_SECRETS,
});

export default RedactedMoves;
