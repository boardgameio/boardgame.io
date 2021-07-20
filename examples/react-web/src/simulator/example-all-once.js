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
  turn: { activePlayers: ActivePlayers.ALL_ONCE },
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
      move: ({ G }) => G,
    },

    turn: { activePlayers: ActivePlayers.ALL_ONCE },

    events: {
      endPhase: false,
    },
  },
};
