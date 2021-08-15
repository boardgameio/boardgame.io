/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import type { AleaState } from './random.alea';
import { alea } from './random.alea';

export interface RandomState {
  seed: string | number;
  prngstate?: AleaState;
}

export interface RandomAPI {
  D4(): number;
  D4(diceCount: number): number[];
  D6(): number;
  D6(diceCount: number): number[];
  D10(): number;
  D10(diceCount: number): number[];
  D12(): number;
  D12(diceCount: number): number[];
  D20(): number;
  D20(diceCount: number): number[];
  Die(spotvalue?: number): number;
  Die(spotvalue: number, diceCount: number): number[];
  Number(): number;
  Shuffle<T>(deck: T[]): T[];
}

export interface PrivateRandomAPI {
  _private: {
    isUsed(): boolean;
    getState(): RandomState;
  };
}

/**
 * Random
 *
 * Calls that require a pseudorandom number generator.
 * Uses a seed from ctx, and also persists the PRNG
 * state in ctx so that moves can stay pure.
 */
export class Random {
  state: RandomState;
  used: boolean;

  /**
   * Generates a new seed from the current date / time.
   */
  static seed() {
    return Date.now().toString(36).slice(-10);
  }

  /**
   * constructor
   * @param {object} ctx - The ctx object to initialize from.
   */
  constructor(state?: RandomState) {
    // If we are on the client, the seed is not present.
    // Just use a temporary seed to execute the move without
    // crashing it. The move state itself is discarded,
    // so the actual value doesn't matter.
    this.state = state || { seed: '0' };
    this.used = false;
  }

  isUsed() {
    return this.used;
  }

  getState() {
    return this.state;
  }

  /**
   * Generate a random number.
   */
  _random() {
    this.used = true;

    const R = this.state;

    const seed = R.prngstate ? '' : R.seed;
    const rand = alea(seed, R.prngstate);

    const number = rand();

    this.state = {
      ...R,
      prngstate: rand.state(),
    };

    return number;
  }

  api(): RandomAPI & PrivateRandomAPI {
    const random: Random['_random'] = this._random.bind(this);

    const SpotValue = {
      D4: 4,
      D6: 6,
      D8: 8,
      D10: 10,
      D12: 12,
      D20: 20,
    };

    type DieFn = {
      (): number;
      (diceCount: number): number[];
    };

    // Generate functions for predefined dice values D4 - D20.
    const predefined = {} as Record<keyof typeof SpotValue, DieFn>;
    for (const key in SpotValue) {
      const spotvalue = SpotValue[key];
      predefined[key] = (diceCount?: number) => {
        return diceCount === undefined
          ? Math.floor(random() * spotvalue) + 1
          : Array.from({ length: diceCount }).map(
              () => Math.floor(random() * spotvalue) + 1
            );
      };
    }

    function Die(spotValue?: number): number;
    function Die(spotValue: number, diceCount: number): number[];
    function Die(spotvalue = 6, diceCount?: number) {
      return diceCount === undefined
        ? Math.floor(random() * spotvalue) + 1
        : Array.from({ length: diceCount }).map(
            () => Math.floor(random() * spotvalue) + 1
          );
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
      Die,

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
      Shuffle: <T extends any>(deck: T[]) => {
        const clone = [...deck];
        let sourceIndex = deck.length;
        let destinationIndex = 0;
        const shuffled = Array.from<T>({ length: sourceIndex });

        while (sourceIndex) {
          const randomIndex = Math.trunc(sourceIndex * random());
          shuffled[destinationIndex++] = clone[randomIndex];
          clone[randomIndex] = clone[--sourceIndex];
        }

        return shuffled;
      },

      _private: this,
    };
  }
}
