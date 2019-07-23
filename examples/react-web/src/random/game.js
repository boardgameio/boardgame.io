/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

const RandomExample = {
  name: 'shuffle',

  setup: () => ({
    deck: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'],
  }),

  moves: {
    shuffle: (G, ctx) => ({ ...G, deck: ctx.random.Shuffle(G.deck) }),
    rollDie: (G, ctx, value) => ({ ...G, dice: ctx.random.Die(value) }),
    rollD6: (G, ctx) => ({ ...G, dice: ctx.random.D6() }),
  },
};

export default RandomExample;
