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

export const Setup = {
  /**
   * Applies the provided plugins to G during game setup.
   *
   * @param {object} G - The G object.
   * @param {object} ctx - The ctx object.
   * @param {object} game - The game object.
   */
  G: (G, ctx, game) => {
    [...DEFAULT_PLUGINS, ...game.plugins]
      .filter(plugin => plugin.setup !== undefined)
      .filter(plugin => plugin.setup.G !== undefined)
      .forEach(plugin => {
        G = plugin.setup.G(G, ctx, game);
      });
    return G;
  },

  /**
   * Applies the provided plugins to ctx during game setup.
   *
   * @param {object} ctx - The ctx object.
   * @param {object} game - The game object.
   */
  ctx: (ctx, game) => {
    [...DEFAULT_PLUGINS, ...game.plugins]
      .filter(plugin => plugin.setup !== undefined)
      .filter(plugin => plugin.setup.ctx !== undefined)
      .forEach(plugin => {
        ctx = plugin.setup.ctx(ctx, game);
      });
    return ctx;
  },
};

/**
 * Applies the provided plugins to the given move / flow function.
 *
 * @param {function} fn - The move function or trigger to apply the plugins to.
 * @param {object} plugins - The list of plugins.
 */
export const FnWrap = (fn, plugins) => {
  const reducer = (acc, { fnWrap }) => fnWrap(acc, plugins);
  return [...DEFAULT_PLUGINS, ...plugins]
    .filter(plugin => plugin.fnWrap !== undefined)
    .reduce(reducer, fn);
};

/**
 * Applies the provided plugins before a move.
 *
 * @param {object} state - The game state.
 * @param {object} plugins - The list of plugins.
 */
export const BeforeMove = (state, plugins) => {
  [...DEFAULT_PLUGINS, ...plugins]
    .filter(plugin => plugin.beforeMove !== undefined)
    .forEach(plugin => {
      state = plugin.beforeMove(state);
    });
  return state;
};

/**
 * Applies the provided plugins before an event.
 *
 * @param {object} state - The game state.
 * @param {object} plugins - The list of plugins.
 */
export const BeforeEvent = (state, plugins) => {
  [...DEFAULT_PLUGINS, ...plugins]
    .filter(plugin => plugin.beforeEvent !== undefined)
    .forEach(plugin => {
      state = plugin.beforeEvent(state);
    });
  return state;
};

/**
 * Applies the provided plugins after a move (and it's triggers).
 *
 * @param {object} state - The game state.
 * @param {object} plugins - The list of plugins.
 */
export const AfterMove = (state, plugins) => {
  [...DEFAULT_PLUGINS, ...plugins]
    .filter(plugin => plugin.afterMove !== undefined)
    .forEach(plugin => {
      state = plugin.afterMove(state);
    });
  return state;
};

/**
 * Applies the provided plugins after an event (and it's triggers).
 *
 * @param {object} state - The game state.
 * @param {object} plugins - The list of plugins.
 */
export const AfterEvent = (state, plugins) => {
  [...DEFAULT_PLUGINS, ...plugins]
    .filter(plugin => plugin.afterEvent !== undefined)
    .forEach(plugin => {
      state = plugin.afterEvent(state);
    });
  return state;
};
