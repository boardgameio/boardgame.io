/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { PlayerView } from 'boardgame.io/core';

const SecretState = {
  name: 'secret-state',

  setup: () => ({
    other: {},
    players: {
      0: 'player 0 state',
      1: 'player 1 state',
      2: 'player 2 state',
    },
  }),

  moves: {
    clickCell(G) {
      return { ...G };
    },
  },

  playerView: PlayerView.STRIP_SECRETS,
};

export default SecretState;
