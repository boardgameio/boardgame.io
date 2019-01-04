/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import PluginImmer from './plugin-immer';

/**
 * Applies the provided plugins to the given move function.
 * PluginImmer is always added.
 *
 * @param {function} fn - The move function or trigger to apply the plugins to.
 * @param {Array} plugins - Array of plugins.
 */
export const ApplyPlugins = (fn, plugins) => {
  const reducer = (acc, { fnWrap }) => fnWrap(acc);
  return [PluginImmer, ...plugins]
    .filter(plugin => plugin.fnWrap !== undefined)
    .reduce(reducer, fn);
};
