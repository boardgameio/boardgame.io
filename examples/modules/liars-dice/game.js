/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { Game, Random, PlayerView } from 'boardgame.io/core';

const LiarsDice = Game({
  name: 'liars-dice',

  setup: () => ({
    bidValue: 1,
    bidQuantity: 1,
    players: {
      0: null,
      1: null,
      2: null,
    },
  }),

  moves: {
    bid: (G, ctx, id) => {
      const cells = [...G.cells];
      if (cells[id] === null) {
        cells[id] = ctx.currentPlayer;
      }
      return { ...G, cells };
    },
    challenge: G => G, // TODO
    roll: (G, ctx) => ({
      ...G,
      players: {
        ...G.players,
        [ctx.currentPlayer]: [
          Random.D6(),
          Random.D6(),
          Random.D6(),
          Random.D6(),
          Random.D6(),
        ],
      },
    }),
  },

  flow: {
    phases: [
      {
        name: 'Rolling',
        endPhaseIf: G => Object.values(G.players).every(p => p !== null),
        allowedMoves: ['roll'],
      },
      {
        name: 'Bidding',
        allowedMoves: ['bid', 'challenge'],
      },
    ],
  },

  playerView: (g, ctx, pid) => {
    if (pid === null) {
      return g;
    }
    return PlayerView.STRIP_SECRETS(g, ctx, pid);
  },
});

export default LiarsDice;
