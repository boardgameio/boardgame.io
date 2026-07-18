/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { produce } from 'immer';
import type { Plugin } from '../types';
import { isInvalidMoveResult } from '../core/constants';
import type { INVALID_MOVE, InvalidMoveResult } from '../core/constants';

/**
 * Plugin that allows using Immer to make immutable changes
 * to G by just mutating it.
 */
const ImmerPlugin: Plugin = {
  name: 'plugin-immer',

  fnWrap:
    (move) =>
    (context, ...args) => {
      let invalidResult: typeof INVALID_MOVE | InvalidMoveResult | undefined;
      const newG = produce(context.G, (G) => {
        const result = move({ ...context, G }, ...args);
        if (isInvalidMoveResult(result)) {
          invalidResult = result;
          return;
        }
        return result;
      });
      if (invalidResult !== undefined) return invalidResult;
      return newG;
    },
};

export default ImmerPlugin;
