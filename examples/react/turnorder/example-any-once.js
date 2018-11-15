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
    startingPhase: 'A',
    phases: {
      A: { turnOrder: TurnOrder.ANY_ONCE, next: 'B' },
      B: { allowedMoves: [] },
    }
  },
}
`;

const Description = () => (
  <div>
    <p>
      <strong>TurnOrder.ANY_ONCE</strong> allows anyone to play during the turn,
      but exactly once.
    </p>
    <pre>{code}</pre>
  </div>
);

export default {
  description: Description,
  game: Game({
    moves: {
      move: G => G,
    },

    flow: {
      endTurn: false,
      endPhase: false,
      startingPhase: 'A',

      phases: {
        A: { turnOrder: TurnOrder.ANY_ONCE, next: 'B' },
        B: { allowedMoves: [] },
      },
    },
  }),
};
