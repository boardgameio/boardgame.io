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
    endPhase: false,
    startingPhase: 'play',

    phases: {
      play: {
        allowedMoves: ['play'],
      },

      discard: {
        turnOrder: TurnOrder.OTHERS_ONCE,
        allowedMoves: ['discard'],
        next: 'play',
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
    <p>
      This is an example from the card game Dominion. The Militia card forces
      every other player to discard a card.
    </p>
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
        play: {
          allowedMoves: ['play'],
        },

        discard: {
          turnOrder: TurnOrder.OTHERS_ONCE,
          allowedMoves: ['discard'],
          next: 'play',
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
