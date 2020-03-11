/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import produce from 'immer';

/**
 * Plugin that allows using Immer to make immutable changes
 * to G by just mutating it.
 */
export default {
  name: 'plugin-immer',
  fnWrap: move => produce(move),
};
