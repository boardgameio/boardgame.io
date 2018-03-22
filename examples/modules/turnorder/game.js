/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { Game } from 'boardgame.io/core';

const TurnExample = Game({
  name: 'turnorder',

  setup: () => ({
    players: [
      {
        name: 'Player 1',
        actions: 1,
      },
      {
        name: 'Player 2',
        actions: 0,
      },
      {
        name: 'Player 3',
        actions: 0,
      },
    ],
  }),

  moves: {},
});

export default TurnExample;
