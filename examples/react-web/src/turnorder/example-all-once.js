/*
 * Copyright 2018 The boardgame.io Authors.
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import { ActivePlayers } from 'boardgame.io/core';

const code = `{
  phases: {
    A: {
      start: true,
      next: 'B',
      turn: { activePlayers: ActivePlayers.ALL_ONCE },
      endIf: (G, ctx) => ctx.numMoves && ctx.activePlayers === null,
    },
    B: {},
  }
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
    moves: {
      move: G => G,
    },

    events: {
      endTurn: false,
      endPhase: false,
    },

    phases: {
      A: {
        start: true,
        next: 'B',
        turn: { activePlayers: ActivePlayers.ALL_ONCE },
        endIf: (G, ctx) => ctx.numMoves && ctx.activePlayers === null,
      },
      B: {},
    },
  },
};
