/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { PlayerView, ActivePlayers } from 'boardgame.io/core';

const RedactedMoves = {
  name: 'secret-state',

  setup: () => ({
    other: {},
    players: {
      0: 'player 0 state',
      1: 'player 1 state',
    },
  }),

  moves: {
    clickCell: {
      /* eslint-disable no-unused-vars */
      move: (_, secretstuff) => {},
      /* eslint-enable no-unused-vars */
      redact: true,
    },
  },

  turn: { activePlayers: ActivePlayers.ALL },

  playerView: PlayerView.STRIP_SECRETS,
};

export default RedactedMoves;
