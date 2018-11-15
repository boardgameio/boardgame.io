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
    turnOrder: TurnOrder.ANY,
  },
}
`;

const Description = () => (
  <div>
    <p>
      <strong>TurnOrder.ANY</strong> allows anyone to play until the phase ends.
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
      turnOrder: TurnOrder.ANY,
    },
  }),
};
