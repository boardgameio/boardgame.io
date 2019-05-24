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
 * Applies the provided plugins to ctx before processing a move / event.
 *
 * @param {object} ctx - The ctx object.
 * @param {object} plugins - The list of plugins.
 */
const CtxPreMove = (ctx, plugins) => {
  [...DEFAULT_PLUGINS, ...plugins]
    .filter(plugin => plugin.ctx !== undefined)
    .filter(plugin => plugin.ctx.preMove !== undefined)
    .forEach(plugin => {
      ctx = plugin.ctx.preMove(ctx, plugins);
    });
  return ctx;
};

/**
 * Applies the provided plugins to G before processing a move / event.
 *
 * @param {object} G - The G object.
 * @param {object} plugins - The list of plugins.
 */
const GPreMove = (G, plugins) => {
  [...DEFAULT_PLUGINS, ...plugins]
    .filter(plugin => plugin.G !== undefined)
    .filter(plugin => plugin.G.preMove !== undefined)
    .forEach(plugin => {
      G = plugin.G.preMove(G, plugins);
    });
  return G;
};

/**
 * Postprocesses G after a move / event.
 *
 * @param {object} G - The G object.
 * @param {object} plugins - The list of plugins.
 */
const GPostMove = (G, plugins) => {
  [...DEFAULT_PLUGINS, ...plugins]
    .filter(plugin => plugin.G !== undefined)
    .filter(plugin => plugin.G.postMove !== undefined)
    .forEach(plugin => {
      G = plugin.G.postMove(G, plugins);
    });
  return G;
};

/**
 * Applies the provided plugins to the given move / flow function.
 *
 * @param {function} fn - The move function or trigger to apply the plugins to.
 * @param {object} plugins - The list of plugins.
 */
export const FnWrap = (fn, plugins) => {
  const reducer = (acc, { fnWrap }) => fnWrap(acc, plugins);
  const g = [...DEFAULT_PLUGINS, ...plugins]
    .filter(plugin => plugin.fnWrap !== undefined)
    .reduce(reducer, fn);

  return (G, ctx, ...args) => {
    G = GPreMove(G, plugins);
    ctx = CtxPreMove(ctx, plugins);
    G = g(G, ctx, ...args);
    G = GPostMove(G, plugins);
    return G;
  };
};

export const G = {
  /**
   * Applies the provided plugins to G during game setup.
   *
   * @param {object} G - The G object.
   * @param {object} ctx - The ctx object.
   * @param {object} game - The game object.
   */
  setup: (G, ctx, game) => {
    [...DEFAULT_PLUGINS, ...game.plugins]
      .filter(plugin => plugin.G !== undefined)
      .filter(plugin => plugin.G.setup !== undefined)
      .forEach(plugin => {
        G = plugin.G.setup(G, ctx, game);
      });
    return G;
  },

  /**
   * Applies the provided plugins to G during the beginning of the phase.
   *
   * @param {object} G - The G object.
   * @param {object} ctx - The ctx object.
   * @param {object} plugins - The list of plugins.
   */
  onPhaseBegin: (G, ctx, plugins) => {
    [...DEFAULT_PLUGINS, ...plugins]
      .filter(plugin => plugin.G !== undefined)
      .filter(plugin => plugin.G.onPhaseBegin !== undefined)
      .forEach(plugin => {
        G = plugin.G.onPhaseBegin(G, ctx, plugins);
      });
    return G;
  },
};

export const ctx = {
  /**
   * Applies the provided plugins to ctx during game setup.
   *
   * @param {object} ctx - The ctx object.
   * @param {object} game - The game object.
   */
  setup: (ctx, game) => {
    [...DEFAULT_PLUGINS, ...game.plugins]
      .filter(plugin => plugin.ctx !== undefined)
      .filter(plugin => plugin.ctx.setup !== undefined)
      .forEach(plugin => {
        ctx = plugin.ctx.setup(ctx, game);
      });
    return ctx;
  },

  /**
   * Applies the provided plugins to ctx during the beginning of the phase.
   *
   * @param {object} ctx - The ctx object.
   * @param {object} plugins - The list of plugins.
   */
  onPhaseBegin: (ctx, plugins) => {
    [...DEFAULT_PLUGINS, ...plugins]
      .filter(plugin => plugin.ctx !== undefined)
      .filter(plugin => plugin.ctx.onPhaseBegin !== undefined)
      .forEach(plugin => {
        ctx = plugin.ctx.onPhaseBegin(ctx, plugins);
      });
    return ctx;
  },
};
