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
      ctx.events.setActionPlayers(
        ['0', '1', '2'].filter(nr => +nr !== +ctx.currentPlayer)
      );

      const currentPlayer = ctx.currentPlayer;
      const playersNext = [...G.players];
      playersNext[currentPlayer] = { ...G.players[currentPlayer], actions: 0 };

      const nextG = { players: playersNext };
      return nextG;
    },

    dropCards: (G, ctx) => {
      const ap = ctx.actionPlayers.filter(nr => +nr !== +ctx.playerID);

      if (ap.length !== 0) {
        // there are still players needing to take action
        ctx.events.setActionPlayers(ap);
      } else {
        // all players dropped cards => give control back to the current player
        ctx.events.setActionPlayers([ctx.currentPlayer]);
      }

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
