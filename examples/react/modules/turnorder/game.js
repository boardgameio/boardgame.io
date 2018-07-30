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
        actions: 0,
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

  moves: {
    playMilitia: (G, ctx) => {
      // Need to keep the currentPlayer inside actionPlayers - otherwise
      // he will not be able to make any move anymore.
      ctx.events.setActionPlayers(['0', '1', '2']);

      const currentPlayer = ctx.currentPlayer;
      const playersNext = [...G.players];
      playersNext[currentPlayer] = { ...G.players[currentPlayer], actions: 0 };

      const nextG = { players: playersNext };
      return nextG;
    },
  },

  flow: {
    setActionPlayers: true,

    onTurnBegin: (G, ctx) => {
      const currentPlayer = ctx.currentPlayer;
      const playersNext = [...G.players];
      playersNext[currentPlayer] = { ...G.players[currentPlayer], actions: 1 };
      return { players: playersNext };
    },
  },
});

export default TurnExample;
