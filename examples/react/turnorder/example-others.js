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
    turnOrder: TurnOrder.OTHERS,
  },
}
`;

const Description = () => (
  <div>
    <p>
      <strong>TurnOrder.OTHERS</strong> allows anyone except the current player
      to play until the phase ends.
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
      endPhase: false,
      turnOrder: TurnOrder.OTHERS,
    },
  }),
};
