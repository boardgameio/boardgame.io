/*
 * Copyright 2017 Google Inc.
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
   * @param {function} reducer - The game reducer.
   */
  constructor(reducer) {
    this.reducer = reducer;
    this.obj = {};
  }

  /**
   * Write the game state to the in-memory object.
   * @param {string} id - The game id.
   * @param {object} store - A Redux store to persist.
   */
  set(id, store) {
    this.obj[id] = store;
  }

  /**
   * Read the game state from the in-memory object.
   * @param {string} id - The game id.
   * @returns {object} - A Redux store with the game state, or null
   *                     if no game is found with this id.
   */
  get(id) {
    if (id in this.obj) {
      return this.obj[id];
    }
    return null;
  }
}
