/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { Game, Random } from 'boardgame.io/core';

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
    bid: G => G,
    challenge: G => G, // TODO
    roll: (G, ctx) => {
      const newG = {
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
      };
      console.log(newG);
      return newG;
    },
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

  playerView: (G, ctx, pid) => {
    console.log(G, ctx, pid);
    // if (pid === null) {
    //   return G;
    // }
    return G;
    // return PlayerView.STRIP_SECRETS(G, ctx, pid);
  },
});

export default LiarsDice;
