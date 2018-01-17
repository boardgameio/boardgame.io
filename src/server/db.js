// solve runtime issue with async fumctions
import "babel-polyfill";

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
    this.games = new Map()
  }

  /**
   * Write the game state to the in-memory object.
   * @param {string} id - The game id.
   * @param {object} store - A game state to persist.
   */
  async set(id, state) {
    return await this.games.set(id, state);
  }

  /**
   * Read the game state from the in-memory object.
   * @param {string} id - The game id.
   * @returns {object} - A game state, or undefined
   *                     if no game is found with this id.
   */
   async get(id) {
    return await this.games.get(id)
  }
  /**
   * Read the game state from the in-memory object.
   * @param {string} id - The game id.
   * @returns {boolean} - True if a game with this id exists.
   */
  async has(id) {
    return await this.games.has(id);
  }
}
