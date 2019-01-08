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
    .filter(plugin => plugin.ctx !== undefined)
    .filter(plugin => plugin.ctx.setup !== undefined)
    .forEach(plugin => {
      ctx = plugin.ctx.setup(ctx, game);
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
    .filter(plugin => plugin.G !== undefined)
    .filter(plugin => plugin.G.setup !== undefined)
    .forEach(plugin => {
      G = plugin.G.setup(G, ctx, game);
    });
  return G;
};

/**
 * Applies the provided plugins to ctx before processing a move / event.
 *
 * @param {object} ctx - The ctx object.
 * @param {object} game - The game object.
 */
export const CtxPreMove = (ctx, game) => {
  [...DEFAULT_PLUGINS, ...game.plugins]
    .filter(plugin => plugin.ctx !== undefined)
    .filter(plugin => plugin.ctx.preMove !== undefined)
    .forEach(plugin => {
      ctx = plugin.ctx.preMove(ctx, game);
    });
  return ctx;
};

/**
 * Postprocesses ctx after a move / event.
 *
 * @param {object} ctx - The ctx object.
 * @param {object} game - The game object.
 */
export const CtxPostMove = (ctx, game) => {
  [...DEFAULT_PLUGINS, ...game.plugins]
    .filter(plugin => plugin.ctx !== undefined)
    .filter(plugin => plugin.ctx.postMove !== undefined)
    .forEach(plugin => {
      ctx = plugin.ctx.postMove(ctx, game);
    });
  return ctx;
};

/**
 * Applies the provided plugins to G before processing a move / event.
 *
 * @param {object} G - The G object.
 * @param {object} game - The game object.
 */
export const GPreMove = (G, game) => {
  [...DEFAULT_PLUGINS, ...game.plugins]
    .filter(plugin => plugin.G !== undefined)
    .filter(plugin => plugin.G.preMove !== undefined)
    .forEach(plugin => {
      G = plugin.G.preMove(G, game);
    });
  return G;
};

/**
 * Postprocesses G after a move / event.
 *
 * @param {object} G - The G object.
 * @param {object} game - The game object.
 */
export const GPostMove = (G, game) => {
  [...DEFAULT_PLUGINS, ...game.plugins]
    .filter(plugin => plugin.G !== undefined)
    .filter(plugin => plugin.G.postMove !== undefined)
    .forEach(plugin => {
      G = plugin.G.postMove(G, game);
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
  const reducer = (acc, { fnWrap }) => fnWrap(acc, game);
  const g = [...DEFAULT_PLUGINS, ...game.plugins]
    .filter(plugin => plugin.fnWrap !== undefined)
    .reduce(reducer, fn);

  return (G, ctx, ...args) => {
    G = GPreMove(G, game);
    ctx = CtxPreMove(ctx, game);
    G = g(G, ctx, ...args);
    ctx = CtxPostMove(ctx, game);
    ctx = GPostMove(G, game);
    return G;
  };
};
