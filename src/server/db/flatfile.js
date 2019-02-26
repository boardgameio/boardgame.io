/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

/**
 * FlatFile data storage.
 */
export class FlatFile {
  /**
   * Creates a new FlatFile storage.
   */
  constructor({ dir, logging, ttl }) {
    this.games = require('node-persist');
    this.dir = dir;
    this.logging = logging || false;
    this.ttl = ttl || false;
  }

  /**
   * Connect.
   */
  async connect() {
    await this.games.init({
      dir: this.dir,
      logging: this.logging,
      ttl: this.ttl,
    });
    return;
  }

  async clear() {
    return this.games.clear();
  }
  /**
   * Write the game state.
   * @param {string} id - The game id.
   * @param {object} store - A game state to persist.
   */
  async set(id, state) {
    return await this.games.setItem(id, state);
  }

  /**
   * Read the game state.
   * @param {string} id - The game id.
   * @returns {object} - A game state, or undefined
   *                     if no game is found with this id.
   */
  async get(id) {
    return await this.games.getItem(id);
  }

  /**
   * Check if a particular game id exists.
   * @param {string} id - The game id.
   * @returns {boolean} - True if a game with this id exists.
   */
  async has(id) {
    var keys = await this.games.keys();
    return keys.indexOf(id) > -1;
  }

  /**
   * Remove the game state.
   * @param {string} id - The game id.
   */
  async remove(id) {
    var keys = await this.games.keys();
    if (!(keys.indexOf(id) > -1)) return;
    this.games.removeItem(id);
  }

  /**
   * Return all keys.
   * @returns {array} - Array of keys (strings)
   */
  async list() {
    return [...(await this.games.keys())];
  }
}
