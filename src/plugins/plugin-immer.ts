/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { current, isDraft, produce } from 'immer';
import isPlainObject from 'lodash.isplainobject';
import type { Plugin } from '../types';
import { Invalid, INVALID_MOVE, isInvalidMoveResult } from '../core/constants';
import type { InvalidMoveResult } from '../core/constants';

/** Snapshot any Immer drafts nested in a JSON-like payload. */
const snapshotDrafts = (value: unknown): unknown => {
  if (isDraft(value)) return current(value);
  if (Array.isArray(value)) return value.map((item) => snapshotDrafts(item));
  if (isPlainObject(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, snapshotDrafts(item)]),
    );
  }
  return value;
};

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
          invalidResult =
            result === INVALID_MOVE
              ? result
              : Invalid(snapshotDrafts(result.payload));
          return;
        }
        return result;
      });
      if (invalidResult !== undefined) return invalidResult;
      return newG;
    },
};

export default ImmerPlugin;
