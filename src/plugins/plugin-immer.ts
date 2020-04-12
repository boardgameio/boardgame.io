/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import produce from 'immer';
import { Plugin } from '../types';

/**
 * Plugin that allows using Immer to make immutable changes
 * to G by just mutating it.
 */
const ImmerPlugin: Plugin = {
  name: 'plugin-immer',
  fnWrap: move => produce(move),
};

export default ImmerPlugin;
