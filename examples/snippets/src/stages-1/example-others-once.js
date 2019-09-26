/*
 * Copyright 2018 The boardgame.io Authors.
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';

const code = `{
  moves: {
    play: (G, ctx) => {
      ctx.events.setActivePlayers({
        others: 'discard',
        moveLimit: 1
      });
      return G;
    },
  },

  turn: {
    stages: {
      discard: {
        moves: {
          discard: G => G,
        },
      },
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

  game: {
    events: {
      endPhase: false,
    },

    moves: {
      play: (G, ctx) => {
        ctx.events.setActivePlayers({ others: 'discard', moveLimit: 1 });
        return G;
      },
    },

    turn: {
      stages: {
        discard: {
          moves: {
            discard: G => G,
          },
        },
      },
    },
  },
};
