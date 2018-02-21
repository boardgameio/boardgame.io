/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { alea } from './random.alea';
import shuffle from 'fast-shuffle';

export function genrandom(G) {
  let randomfn;
  if (G._random === undefined || G._random.prngstate === undefined) {
    // If we are on the client, the seed is not present.
    // Just use a temporary seed to execute the move without
    // crashing it. The move state itself is discarded,
    // so the actual value doesn't matter.
    const seed = (G._random && G._random.seed) || '0';

    // No call to a random function has been made.
    randomfn = new alea(seed, { state: true });
  } else {
    randomfn = new alea('', { state: G._random.prngstate });
  }

  return {
    randomnumber: randomfn(),
    G: {
      ...G,
      _random: {
        ...G._random,
        prngstate: randomfn.state(),
      },
    },
  };
}

const SpotValue = {
  D4: 4,
  D6: 6,
  D8: 8,
  D10: 10,
  D12: 12,
  D20: 20,
};

// generate functions for predefined dice values D4 - D20
const predefined = {};
for (const key in SpotValue) {
  const spotvalue = SpotValue[key];
  predefined[key] = (G, fieldname) => {
    const { randomnumber, G: G2 } = genrandom(G);
    const dievalue = Math.floor(randomnumber * spotvalue) + 1;
    G2[fieldname] = dievalue;
    return G2;
  };
}

export function GenSeed() {
  return (+new Date()).toString(36).slice(-10);
}

// Public API that's imported like:
// import { Random } from 'boardgame.io/core';
export const Random = {
  ...predefined,

  Die: (G, fieldname, spotvalue) => {
    const { randomnumber, G: G2 } = genrandom(G);
    const dievalue = Math.floor(randomnumber * spotvalue) + 1;
    G2[fieldname] = dievalue;
    return G2;
  },

  Number: (G, fieldname) => {
    const { randomnumber, G: G2 } = genrandom(G);
    G2[fieldname] = randomnumber;
    return G2;
  },

  Shuffle: (G, fieldname) => {
    const { randomnumber, G: G2 } = genrandom(G);
    const rng = alea(randomnumber);
    G2[fieldname] = shuffle(G2[fieldname], rng);
    return G2;
  },
};
