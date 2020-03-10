/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import PluginImmer from './plugin-immer';
import { GameState, State, GameConfig, Plugin } from '../types';

/**
 * List of plugins that are always added.
 */
const DEFAULT_PLUGINS = [PluginImmer];

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
 * Applies the provided plugins during game setup.
 *
 * @param {object} state - The game state.
 * @param {object} game - The game config.
 */
export const Setup = (state: GameState, game: GameConfig): GameState => {
  [...DEFAULT_PLUGINS, ...game.plugins]
    .filter(plugin => plugin.setup !== undefined)
    .forEach(plugin => {
      state = plugin.setup(state, game);
    });
  return state;
};

/**
 * Applies the provided plugins to enhance the state.
 * Called at setup, and also before moves / events.
 *
 * @param {object} state - The game state.
 * @param {object} game - The game object.
 */
export const Enhance = (state: State, game: GameConfig): State => {
  [...DEFAULT_PLUGINS, ...game.plugins]
    .filter(plugin => plugin.enhance !== undefined)
    .forEach(plugin => {
      state = plugin.enhance(state, game);
    });
  return state;
};

/**
 * Applies the provided plugins before a move.
 *
 * @param {object} state - The game state.
 * @param {object} game - The game object.
 */
export const BeforeMove = (state: State, game: GameConfig): State => {
  [...DEFAULT_PLUGINS, ...game.plugins]
    .filter(plugin => plugin.beforeMove !== undefined)
    .forEach(plugin => {
      state = plugin.beforeMove(state, game);
    });
  return state;
};

/**
 * Applies the provided plugins before an event.
 *
 * @param {object} state - The game state.
 * @param {object} game - The game object.
 */
export const BeforeEvent = (state: State, game: GameConfig): State => {
  [...DEFAULT_PLUGINS, ...game.plugins]
    .filter(plugin => plugin.beforeEvent !== undefined)
    .forEach(plugin => {
      state = plugin.beforeEvent(state, game);
    });
  return state;
};

/**
 * Applies the provided plugins after a move (and it's triggers).
 *
 * @param {object} state - The game state.
 * @param {object} game - The game object.
 */
export const AfterMove = (state: State, game: GameConfig): State => {
  [...DEFAULT_PLUGINS, ...game.plugins]
    .filter(plugin => plugin.afterMove !== undefined)
    .forEach(plugin => {
      state = plugin.afterMove(state, game);
    });
  return state;
};

/**
 * Applies the provided plugins after an event (and it's triggers).
 *
 * @param {object} state - The game state.
 * @param {object} game - The game object.
 */
export const AfterEvent = (state: State, game: GameConfig): State => {
  [...DEFAULT_PLUGINS, ...game.plugins]
    .filter(plugin => plugin.afterEvent !== undefined)
    .forEach(plugin => {
      state = plugin.afterEvent(state, game);
    });
  return state;
};
