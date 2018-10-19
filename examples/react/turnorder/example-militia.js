/*
 * Copyright 2018 The boardgame.io Authors.
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import { Game } from 'boardgame.io/core';

const code = `{
  flow: {
    setActionPlayers: true,

    phases: [
      { name: 'move', allowedMoves: ['play'] },
      { name: 'discard', allowedMoves: ['discard'] },
    ],

    onTurnBegin(G, ctx) {
      ctx.events.endPhase('move');
      return G;
    },
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
}
`;

const Description = () => (
  <div>
    <p>
      This is an example from the card game Dominion. The Militia card forces
      every other play to discard a card.
    </p>
    <pre>{code}</pre>
  </div>
);

export default {
  description: Description,

  game: Game({
    flow: {
      setActionPlayers: true,

      phases: [
        { name: 'move', allowedMoves: ['play'] },
        { name: 'discard', allowedMoves: ['discard'] },
      ],

      onTurnBegin(G, ctx) {
        ctx.events.endPhase('move');
        return G;
      },
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
