/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import PluginImmer from './plugin-immer';
import { GameState, State, GameConfig, Plugin, Ctx } from '../types';

interface PluginOpts {
  game: GameConfig;
  isClient?: boolean;
}

/**
 * List of plugins that are always added.
 */
const DEFAULT_PLUGINS = [PluginImmer];

/**
 * The API's created by various plugins are stored in the plugins
 * section of the state object:
 *
 * {
 *   G: {},
 *   ctx: {},
 *   plugins: {
 *     plugin-a: {
 *       data: {},  // this is generated by the plugin at Setup / Flush.
 *       api: {},   // this is ephemeral and generated by Enhance.
 *     }
 *   }
 * }
 *
 * This function takes these API's and stuffs them back into
 * ctx for consumption inside a move function or hook.
 */
export const EnhanceCtx = (state: GameState): Ctx => {
  let ctx = { ...state.ctx };
  const plugins = state.plugins || {};
  Object.entries(plugins).forEach(([name, { api }]) => {
    ctx[name] = api;
  });
  return ctx;
};

/**
 * Applies the provided plugins to the given move / flow function.
 *
 * @param {function} fn - The move function or trigger to apply the plugins to.
 * @param {object} plugins - The list of plugins.
 */
export const FnWrap = (fn: Function, plugins: Plugin[]) => {
  const reducer = (acc, { fnWrap }) => fnWrap(acc, plugins);
  return [...DEFAULT_PLUGINS, ...plugins]
    .filter(plugin => plugin.fnWrap !== undefined)
    .reduce(reducer, fn);
};

/**
 * Allows the plugin to generate its initial state.
 */
export const Setup = (state: GameState, opts: PluginOpts): GameState => {
  [...DEFAULT_PLUGINS, ...opts.game.plugins]
    .filter(plugin => plugin.setup !== undefined)
    .forEach(plugin => {
      const name = plugin.name;
      const data = plugin.setup({
        G: state.G,
        ctx: state.ctx,
        game: opts.game,
      });

      state = {
        ...state,
        plugins: {
          ...state.plugins,
          [name]: { data },
        },
      };
    });
  return state;
};

/**
 * Invokes the plugin before a move or event.
 * The API that the plugin generates is stored inside
 * the `plugins` section of the state (which is subsequently
 * merged into ctx).
 */
export const Enhance = (state: State, opts: PluginOpts): State => {
  [...DEFAULT_PLUGINS, ...opts.game.plugins]
    .filter(plugin => plugin.api !== undefined)
    .forEach(plugin => {
      const name = plugin.name;
      const pluginState = state.plugins[name];

      const api = plugin.api({
        G: state.G,
        ctx: state.ctx,
        data: pluginState.data,
        game: opts.game,
      });

      state = {
        ...state,
        plugins: {
          ...state.plugins,
          [name]: { ...pluginState, api },
        },
      };
    });
  return state;
};

/**
 * Allows plugins to update their state after a move / event.
 */
export const Flush = (state: State, opts: PluginOpts): State => {
  [...DEFAULT_PLUGINS, ...opts.game.plugins]
    .filter(plugin => plugin.flush !== undefined)
    .forEach(plugin => {
      const name = plugin.name;
      const { api, data } = state.plugins[name];
      const newData = plugin.flush({
        G: state.G,
        ctx: state.ctx,
        game: opts.game,
        api,
        data,
      });

      state = {
        ...state,
        plugins: {
          ...state.plugins,
          [plugin.name]: { data: newData },
        },
      };
    });
  return state;
};
