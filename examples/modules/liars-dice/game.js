/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { Game, Random } from 'boardgame.io/core';
// import { PlayerView } from 'boardgame.io/core';

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
    roll: G => {
      let ops = G;
      ops = Random.D6(ops, 'dieValue1');
      ops = Random.D6(ops, 'dieValue2');
      ops = Random.D6(ops, 'dieValue3');
      ops = Random.D6(ops, 'dieValue4');
      ops = Random.D6(ops, 'dieValue5');
      return ops;
    },
  },

  flow: {
    phases: [
      {
        name: 'Rolling',
        endPhaseIf: G => Object.values(G.players).every(p => p !== null),
        allowedMoves: ['roll'],
        onMove: (G, ctx) => {
          return {
            bidValue: G.bidValue,
            bidQuantity: G.bidQuantity,
            players: {
              ...G.players,
              [ctx.currentPlayer]: [
                G.dieValue1,
                G.dieValue2,
                G.dieValue3,
                G.dieValue4,
                G.dieValue5,
              ],
            },
          };
        },
      },
      {
        name: 'Bidding',
        allowedMoves: ['bid', 'challenge'],
      },
    ],
  },

  // playerView: PlayerView.STRIP_SECRETS,
});

export default LiarsDice;
