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
    phases: {
      A: { turnOrder: TurnOrder.ONCE },
      B: {},
    },
  },
}
`;

const Description = () => (
  <div>
    <p>
      <strong>TurnOrder.ONCE</strong> goes around the table once and then ends
      the phase automatically.
    </p>
    <pre>{code}</pre>
  </div>
);

export default {
  description: Description,
  game: Game({
    flow: {
      endPhase: false,
      startingPhase: 'A',
      phases: {
        A: { turnOrder: TurnOrder.ONCE, next: 'B' },
        B: {},
      },
    },
  }),
};
