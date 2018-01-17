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
   * Write the game state to the in-memory object.
   * @param {string} id - The game id.
   * @param {object} store - A Redux store to persist.
   */
  set(id, state) {
    return new Promise((resolve) => {
      const result = this.games.set(id, state);
      resolve(result);
    })
  }

  /**
   * Read the game state from the in-memory object.
   * @param {string} id - The game id.
   * @returns {object} - A Redux store with the game state, or undefined
   *                     if no game is found with this id.
   */
  get(id) {
    return new Promise((resolve) => {
      const state = this.games.get(id);
      resolve(state)
    })
  }

  /**
   * Read the game state from the in-memory object.
   * @param {string} id - The game id.
   * @returns {boolean} - True if a game with this id exists.
   */
  has(id) {
    return new Promise((resolve) => {
      const has = this.games.has(id)
      resolve(has);
    })
  }
}
