/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import produce from 'immer';
import type { Plugin } from '../types';
import { INVALID_MOVE } from '../core/constants';

/**
 * Plugin that allows using Immer to make immutable changes
 * to G by just mutating it.
 */
const ImmerPlugin: Plugin = {
  name: 'plugin-immer',

  fnWrap:
    (move) =>
    (context, ...args) => {
      let isInvalid = false;
      const newG = produce(context.G, (G) => {
        const result = move({ ...context, G }, ...args);
        if (result === INVALID_MOVE) {
          isInvalid = true;
          return;
        }
        return result;
      });
      if (isInvalid) return INVALID_MOVE;
      return newG;
    },
};

export default ImmerPlugin;
