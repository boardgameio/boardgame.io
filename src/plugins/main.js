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
 * @param {object} game - The game object.
 */
export const SetupCtx = (ctx, game) => {
  [...DEFAULT_PLUGINS, ...game.plugins]
    .filter(plugin => plugin.setupCtx !== undefined)
    .forEach(plugin => {
      ctx = plugin.setupCtx(ctx, game);
    });
  return ctx;
};

/**
 * Applies the provided plugins to G.
 *
 * @param {object} G - The G object.
 * @param {object} ctx - The ctx object.
 * @param {object} game - The game object.
 */
export const SetupG = (G, ctx, game) => {
  [...DEFAULT_PLUGINS, ...game.plugins]
    .filter(plugin => plugin.setupG !== undefined)
    .forEach(plugin => {
      G = plugin.setupG(G, ctx, game);
    });
  return G;
};

/**
 * Applies the provided plugins to ctx before processing a move / event.
 *
 * @param {object} ctx - The ctx object.
 * @param {object} game - The game object.
 */
export const AddToCtx = (ctx, game) => {
  [...DEFAULT_PLUGINS, ...game.plugins]
    .filter(plugin => plugin.addToCtx !== undefined)
    .forEach(plugin => {
      ctx = plugin.addToCtx(ctx, game);
    });
  return ctx;
};

/**
 * Removes the provided plugins to ctx after processing a move / event.
 *
 * @param {object} ctx - The ctx object.
 * @param {object} game - The game object.
 */
export const RemoveFromCtx = (ctx, game) => {
  [...DEFAULT_PLUGINS, ...game.plugins]
    .filter(plugin => plugin.removeFromCtx !== undefined)
    .forEach(plugin => {
      ctx = plugin.removeFromCtx(ctx, game);
    });
  return ctx;
};

/**
 * Applies the provided plugins to G before processing a move / event.
 *
 * @param {object} G - The G object.
 * @param {object} game - The game object.
 */
export const AddToG = (G, game) => {
  [...DEFAULT_PLUGINS, ...game.plugins]
    .filter(plugin => plugin.addToG !== undefined)
    .forEach(plugin => {
      G = plugin.addToG(G, game);
    });
  return G;
};

/**
 * Removes the provided plugins to G after processing a move / event.
 *
 * @param {object} G - The G object.
 * @param {object} game - The game object.
 */
export const RemoveFromG = (G, game) => {
  [...DEFAULT_PLUGINS, ...game.plugins]
    .filter(plugin => plugin.removeFromG !== undefined)
    .forEach(plugin => {
      G = plugin.removeFromG(G, game);
    });
  return G;
};

/**
 * Applies the provided plugins to the given move / flow function.
 *
 * @param {function} fn - The move function or trigger to apply the plugins to.
 * @param {object} game - The game object.
 */
export const FnWrap = (fn, game) => {
  const reducer = (acc, { fnWrap }) => fnWrap(acc);
  const g = [...DEFAULT_PLUGINS, ...game.plugins]
    .filter(plugin => plugin.fnWrap !== undefined)
    .reduce(reducer, fn);

  return (G, ctx, ...args) => {
    G = AddToG(G, game);
    ctx = AddToCtx(ctx, game);
    G = g(G, ctx, ...args);
    ctx = RemoveFromCtx(ctx, game);
    ctx = RemoveFromG(G, game);
    return G;
  };
};
