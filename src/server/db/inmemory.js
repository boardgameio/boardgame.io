/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

/**
 * InMemory data storage.
 */
export class InMemory {
  /**
   * Creates a new InMemory storage.
   */
  constructor() {
    this.games = new Map();
  }

  /**
   * Connect.
   * No-op for the InMemory instance.
   */
  connect() {
    return;
  }

  /**
   * Write the game state to the in-memory object.
   * @param {string} id - The game id.
   * @param {object} store - A game state to persist.
   */
  set(id, state) {
    return this.games.set(id, state);
  }

  /**
   * Read the game state from the in-memory object.
   * @param {string} id - The game id.
   * @returns {object} - A game state, or undefined
   *                     if no game is found with this id.
   */
  get(id) {
    return this.games.get(id);
  }

  /**
   * Check if a particular game id exists.
   * @param {string} id - The game id.
   * @returns {boolean} - True if a game with this id exists.
   */
  has(id) {
    return this.games.has(id);
  }

  /**
   * Remove the game state from the in-memory object.
   * @param {string} id - The game id.
   */
  remove(id) {
    if (!this.games.has(id)) return;
    this.games.delete(id);
  }

  /**
   * Return all keys.
   * @returns {array} - Array of keys (strings)
   */
  list() {
    return [...this.games.keys()];
  }
}
