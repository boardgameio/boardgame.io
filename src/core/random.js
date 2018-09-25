/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { alea } from './random.alea';

/**
 * Random
 *
 * Calls that require a pseudorandom number generator.
 * Uses a seed from ctx, and also persists the PRNG
 * state in ctx so that moves can stay pure.
 */
export class Random {
  /**
   * constructor
   * @param {object} ctx - The ctx object to initialize from.
   */
  constructor(ctx) {
    // If we are on the client, the seed is not present.
    // Just use a temporary seed to execute the move without
    // crashing it. The move state itself is discarded,
    // so the actual value doesn't matter.
    this.state = ctx._random || { seed: '0' };
  }

  /**
   * Updates ctx with the PRNG state.
   * @param {object} ctx - The ctx object to update.
   */
  update(state) {
    const ctx = { ...state.ctx, _random: this.state };
    return { ...state, ctx };
  }

  /**
   * Attaches the Random API to ctx.
   * @param {object} ctx - The ctx object to attach to.
   */
  attach(ctx) {
    return { ...ctx, random: this._api() };
  }

  /**
   * Generate a random number.
   */
  _random() {
    const R = this.state;

    let fn;
    if (R.prngstate === undefined) {
      // No call to a random function has been made.
      fn = new alea(R.seed, { state: true });
    } else {
      fn = new alea('', { state: R.prngstate });
    }

    const number = fn();

    this.state = {
      ...R,
      prngstate: fn.state(),
    };

    return number;
  }

  _api() {
    const random = this._random.bind(this);

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
      predefined[key] = diceCount => {
        if (diceCount === undefined) {
          return Math.floor(random() * spotvalue) + 1;
        } else {
          return [...new Array(diceCount).keys()].map(
            () => Math.floor(random() * spotvalue) + 1
          );
        }
      };
    }

    return {
      /**
       * Similar to Die below, but with fixed spot values.
       * Supports passing a diceCount
       *    if not defined, defaults to 1 and returns the value directly.
       *    if defined, returns an array containing the random dice values.
       *
       * D4: (diceCount) => value
       * D6: (diceCount) => value
       * D8: (diceCount) => value
       * D10: (diceCount) => value
       * D12: (diceCount) => value
       * D20: (diceCount) => value
       */
      ...predefined,

      /**
       * Roll a die of specified spot value.
       *
       * @param {number} spotvalue - The die dimension (default: 6).
       * @param {number} diceCount - number of dice to throw.
       *                             if not defined, defaults to 1 and returns the value directly.
       *                             if defined, returns an array containing the random dice values.
       */
      Die: (spotvalue, diceCount) => {
        if (spotvalue === undefined) {
          spotvalue = 6;
        }

        if (diceCount === undefined) {
          return Math.floor(random() * spotvalue) + 1;
        } else {
          return [...new Array(diceCount).keys()].map(
            () => Math.floor(random() * spotvalue) + 1
          );
        }
      },

      /**
       * Generate a random number between 0 and 1.
       */
      Number: () => {
        return random();
      },

      /**
       * Shuffle an array.
       *
       * @param {Array} deck - The array to shuffle. Does not mutate
       *                       the input, but returns the shuffled array.
       */
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
  }
}

/**
 * Removes the attached Random api from ctx.
 *
 * @param {object} ctx - The ctx object with the Random API attached.
 * @returns {object} A plain ctx object without the Random API.
 */
Random.detach = function(ctx) {
  const { random, ...rest } = ctx; // eslint-disable-line no-unused-vars
  return rest;
};

/**
 * Generates a new seed from the current date / time.
 */
Random.seed = function() {
  return (+new Date()).toString(36).slice(-10);
};
