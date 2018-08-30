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
        cards: 5,
        actions: 0,
      },
      {
        name: 'Player 2',
        cards: 5,
        actions: 0,
      },
      {
        name: 'Player 3',
        cards: 5,
        actions: 0,
      },
    ],
  }),

  moves: {
    playMilitia: (G, ctx) => {
      ctx.events.setActionPlayers({ allOthers: true });

      const currentPlayer = ctx.currentPlayer;
      const playersNext = [...G.players];
      playersNext[currentPlayer] = { ...G.players[currentPlayer], actions: 0 };

      const nextG = { players: playersNext };
      return nextG;
    },

    dropCards: (G, ctx) => {
      const newPlayer = { ...G.players[+ctx.playerID], cards: 3 };
      // TODO functional approach to replace element from array?
      const newPlayers = [...G.players];
      newPlayers[+ctx.playerID] = newPlayer;

      return { ...G, players: newPlayers };
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
