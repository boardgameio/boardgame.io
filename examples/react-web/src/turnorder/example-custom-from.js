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
  setup: () => ({
    order: ['1', '0', '2', '3', '5', '4'],
  }),

  turn: { order: TurnOrder.CUSTOM_FROM('order') },
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
    setup: () => ({
      order: ['1', '0', '2', '3', '5', '4'],
    }),

    endPhase: false,
    turn: { order: TurnOrder.CUSTOM_FROM('order') },
  }),
};
