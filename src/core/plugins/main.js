/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import PluginImmer from './plugin-immer';

/**
 * List of plugins that are always added.
 */
const DEFAULT_PLUGINS = [PluginImmer];

/**
 * Applies the provided plugins to the given move / flow function.
 *
 * @param {function} fn - The move function or trigger to apply the plugins to.
 * @param {Array} plugins - Array of plugins.
 */
export const FnWrap = (fn, plugins) => {
  const reducer = (acc, { fnWrap }) => fnWrap(acc);
  return [...DEFAULT_PLUGINS, ...plugins]
    .filter(plugin => plugin.fnWrap !== undefined)
    .reduce(reducer, fn);
};

/**
 * Applies the provided plugins to ctx.
 *
 * @param {object} ctx - The ctx object.
 * @param {Array} plugins - Array of plugins.
 */
export const SetupCtx = (ctx, plugins) => {
  [...DEFAULT_PLUGINS, ...plugins]
    .filter(plugin => plugin.setupCtx !== undefined)
    .forEach(plugin => {
      ctx = plugin.setupCtx(ctx);
    });
  return ctx;
};

/**
 * Applies the provided plugins to G.
 *
 * @param {object} G - The G object.
 * @param {object} ctx - The ctx object.
 * @param {Array} plugins - Array of plugins.
 */
export const SetupG = (G, ctx, plugins) => {
  [...DEFAULT_PLUGINS, ...plugins]
    .filter(plugin => plugin.setupG !== undefined)
    .forEach(plugin => {
      G = plugin.setupG(G, ctx);
    });
  return G;
};
