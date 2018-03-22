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

  moves: {
    playMilitia: (G, ctx) => {
      console.log(`MOVE: playMilitia`);
      console.log(`BEFORE: G=${JSON.stringify(G, null, 4)}`);

      // Need to keep the currentPlayer inside actionPlayers - otherwise
      // he will not be able to make any move anymore.
      // TODO does not work.
      // ctx.events.changeActionPlayers(['0', '1', '2']);

      const currentPlayer = ctx.currentPlayer;

      const playersNext = [...G.players];
      playersNext[currentPlayer] = { ...G.players[currentPlayer], actions: 0 };

      const nextG = { players: playersNext };
      console.log(`AFTER: G=${JSON.stringify(nextG, null, 4)}`);
      return nextG;
    },
  },
});

export default TurnExample;
