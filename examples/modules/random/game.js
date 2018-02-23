/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { Game, Random } from 'boardgame.io/core';

const RandomExample = Game({
  name: 'shuffle',

  setup: () => ({
    deck: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'],
  }),

  moves: {
    shuffle: G => ({ ...G, deck: Random.Shuffle(G.deck) }),
    rollDie: (G, ctx, value) => ({ ...G, dice: Random.Die(value) }),
    rollD6: G => ({ ...G, dice: Random.D6() }),
  },
});

export default RandomExample;
