/*
 * Copyright 2018 The boardgame.io Authors.
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import { Game, TurnOrder } from 'boardgame.io/core';

const code = `{
  flow: {
    startingPhase: 'play',

    phases: {
      play: {},

      discard: {
        turnOrder: TurnOrder.OTHERS_ONCE,
      },
    },
  },

  moves: {
    play(G, ctx) {
      ctx.events.endPhase({ next: 'discard' });
      return G;
    },

    discard(G) {
      return G;
    },
  },
}
`;

const Description = () => (
  <div>
    <pre>{code}</pre>
  </div>
);

export default {
  description: Description,

  game: Game({
    flow: {
      endPhase: false,
      startingPhase: 'play',

      phases: {
        play: {},

        discard: {
          turnOrder: TurnOrder.OTHERS_ONCE,
        },
      },
    },

    moves: {
      play(G, ctx) {
        ctx.events.endPhase({ next: 'discard' });
        return G;
      },

      discard(G) {
        return G;
      },
    },
  }),
};
