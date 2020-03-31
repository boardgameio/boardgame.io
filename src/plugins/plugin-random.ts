/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { Plugin } from '../types';
import { Random } from './random/random';

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

interface PrivateRandomAPI {
  _obj: {
    isUsed(): boolean;
    getState(): any;
  };
}

const RandomPlugin: Plugin<RandomAPI & PrivateRandomAPI> = {
  name: 'random',

  noClient: ({ api }) => {
    return api._obj.isUsed();
  },

  flush: ({ api }) => {
    return api._obj.getState();
  },

  api: ({ data }) => {
    const random = new Random(data);
    return random.api();
  },

  setup: ({ game }) => {
    let seed = game.seed;
    if (seed === undefined) {
      seed = Random.seed();
    }
    return { seed };
  },
};

export default RandomPlugin;
