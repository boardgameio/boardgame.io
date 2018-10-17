/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { Game, PlayerView } from 'boardgame.io/core';

const SecretState = Game({
  name: 'secret-state',

  setup: () => ({
    other: {},
    players: {
      0: 'player 0 state',
      1: 'player 1 state',
      2: 'player 2 state',
    },
  }),

  playerView: PlayerView.STRIP_SECRETS,
});

export default SecretState;
