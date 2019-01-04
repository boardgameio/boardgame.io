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
 * Applies the provided plugins to ctx during game setup.
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

/**
 * Applies the provided plugins to ctx before processing a move / event.
 *
 * @param {object} ctx - The ctx object.
 * @param {Array} plugins - Array of plugins.
 */
export const AddToCtx = (ctx, plugins) => {
  [...DEFAULT_PLUGINS, ...plugins]
    .filter(plugin => plugin.addToCtx !== undefined)
    .forEach(plugin => {
      ctx = plugin.addToCtx(ctx);
    });
  return ctx;
};

/**
 * Removes the provided plugins to ctx after processing a move / event.
 *
 * @param {object} ctx - The ctx object.
 * @param {Array} plugins - Array of plugins.
 */
export const RemoveFromCtx = (ctx, plugins) => {
  [...DEFAULT_PLUGINS, ...plugins]
    .filter(plugin => plugin.removeFromCtx !== undefined)
    .forEach(plugin => {
      ctx = plugin.removeFromCtx(ctx);
    });
  return ctx;
};

/**
 * Applies the provided plugins to G before processing a move / event.
 *
 * @param {object} G - The G object.
 * @param {Array} plugins - Array of plugins.
 */
export const AddToG = (G, plugins) => {
  [...DEFAULT_PLUGINS, ...plugins]
    .filter(plugin => plugin.addToG !== undefined)
    .forEach(plugin => {
      G = plugin.addToG(G);
    });
  return G;
};

/**
 * Removes the provided plugins to G after processing a move / event.
 *
 * @param {object} G - The G object.
 * @param {Array} plugins - Array of plugins.
 */
export const RemoveFromG = (G, plugins) => {
  [...DEFAULT_PLUGINS, ...plugins]
    .filter(plugin => plugin.removeFromG !== undefined)
    .forEach(plugin => {
      G = plugin.removeFromG(G);
    });
  return G;
};

/**
 * Applies the provided plugins to the given move / flow function.
 *
 * @param {function} fn - The move function or trigger to apply the plugins to.
 * @param {Array} plugins - Array of plugins.
 */
export const FnWrap = (fn, plugins) => {
  const initialWrap = (G, ctx, ...args) => {
    G = AddToG(G, plugins);
    ctx = AddToCtx(ctx, plugins);
    G = fn(G, ctx, ...args);
    ctx = RemoveFromCtx(ctx, plugins);
    ctx = RemoveFromG(G, plugins);
    return G;
  };

  const reducer = (acc, { fnWrap }) => fnWrap(acc);
  return [...DEFAULT_PLUGINS, ...plugins]
    .filter(plugin => plugin.fnWrap !== undefined)
    .reduce(reducer, initialWrap);
};
