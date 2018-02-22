/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { alea } from './random.alea';

class _PRNGState {
  constructor() {
    this.R = undefined;
  }
  get() {
    return this.R;
  }
  set(R) {
    this.R = R;
  }
}

// Singleton that contains the PRNG state.
export const PRNGState = new _PRNGState();

/**
 * Return a random number.
 *
 * Rehydrates the PRNG from PRNGState if possible.
 */
export function random() {
  const R = PRNGState.get();

  let fn;
  if (R === undefined || R.prngstate === undefined) {
    // If we are on the client, the seed is not present.
    // Just use a temporary seed to execute the move without
    // crashing it. The move state itself is discarded,
    // so the actual value doesn't matter.
    const seed = (R && R.seed) || '0';

    // No call to a random function has been made.
    fn = new alea(seed, { state: true });
  } else {
    fn = new alea('', { state: R.prngstate });
  }

  const number = fn();

  PRNGState.set({
    ...R,
    prngstate: fn.state(),
  });

  return number;
}

const SpotValue = {
  D4: 4,
  D6: 6,
  D8: 8,
  D10: 10,
  D12: 12,
  D20: 20,
};

// Generate functions for predefined dice values D4 - D20.
const predefined = {};
for (const key in SpotValue) {
  const spotvalue = SpotValue[key];
  predefined[key] = () => {
    return Math.floor(random() * spotvalue) + 1;
  };
}

export function GenSeed() {
  return (+new Date()).toString(36).slice(-10);
}

// Public API that's imported like:
// import { Random } from 'boardgame.io/core';
export const Random = {
  ...predefined,

  Die: spotvalue => {
    return Math.floor(random() * spotvalue) + 1;
  },

  Number: () => {
    return random();
  },

  Shuffle: deck => {
    let clone = deck.slice(0);
    let srcIndex = deck.length;
    let dstIndex = 0;
    let shuffled = new Array(srcIndex);

    while (srcIndex) {
      let randIndex = (srcIndex * random()) | 0;
      shuffled[dstIndex++] = clone[randIndex];
      clone[randIndex] = clone[--srcIndex];
    }

    return shuffled;
  },
};
