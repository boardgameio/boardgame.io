/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import type { Plugin } from '../types';
import type { RandomAPI, PrivateRandomAPI, RandomState } from './random/random';
import { Random } from './random/random';

const RandomPlugin: Plugin<RandomAPI & PrivateRandomAPI, RandomState> = {
  name: 'random',

  noClient: ({ api }) => {
    return api._private.isUsed();
  },

  flush: ({ api }) => {
    return api._private.getState();
  },

  api: ({ data }) => {
    const random = new Random(data);
    return random.api();
  },

  setup: ({ game }) => {
    let { seed } = game;
    if (seed === undefined) {
      seed = Random.seed();
    }
    return { seed };
  },

  playerView: () => undefined,
};

export default RandomPlugin;
