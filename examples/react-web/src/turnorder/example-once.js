/*
 * Copyright 2018 The boardgame.io Authors.
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import { TurnOrder } from 'boardgame.io/core';

const code = `{
  phases: {
    A: {
      start: true,
      next: 'B',
      turn: { order: TurnOrder.ONCE },
    },
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
  game: {
    events: {
      endPhase: false,
    },
    phases: {
      A: {
        start: true,
        next: 'B',
        turn: { order: TurnOrder.ONCE },
      },
      B: {},
    },
  },
};
