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
  phases: {
    A: { turn: { order: TurnOrder.ONCE }, next: 'B' },
    B: {},
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
    endPhase: false,
    startingPhase: 'A',
    phases: {
      A: { turn: { order: TurnOrder.ONCE }, next: 'B' },
      B: {},
    },
  }),
};
