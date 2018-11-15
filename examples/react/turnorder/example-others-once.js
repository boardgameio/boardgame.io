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
      play: {
        allowedMoves: ['play'],
      },

      discard: {
        turnOrder: TurnOrder.OTHERS_ONCE,
        allowedMoves: ['discard'],
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
      <strong>TurnOrder.OTHERS</strong> allows everyone except the current
      player to make one move (in any order). This is a usefule pattern in games
      where you want to elicit a response from every other player in the game.
    </p>

    <p>
      For example, you could have a card that (when played) requires every other
      player to discard a card.
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
