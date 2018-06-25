/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

const LRU = require('lru-cache');

/**
 * SQL connector.
 */
export class SQL {
  constructor({ cacheSize }) {
    if (cacheSize === undefined) cacheSize = 1000;
    this.cache = new LRU({ max: cacheSize });
  }
  /**
   * Connect to the instance.
   */
  async connect() {
    try {
      await this.db.authenticate();
      this.game.sync();
      return;
    } catch (error) {
      return new Error(error);
    }
  }

  /**
   * Write the game state.
   * @param {string} id - The game id.
   * @param {object} store - A game state to persist.
   */
  async set(id, state) {
    // Don't set a value if the cache has a more recent version.
    // This can occur due a race condition.
    //
    // For example:
    //
    // A --sync--> server | DB => 0 --+
    //                                |
    // A <--sync-- server | DB => 0 --+
    //
    // B --sync--> server | DB => 0 ----+
    //                                  |
    // A --move--> server | DB <= 1 --+ |
    //                                | |
    // A <--sync-- server | DB => 1 --+ |
    //                                  |
    // B <--sync-- server | DB => 0 ----+
    //
    const cacheValue = this.cache.get(id);
    if (cacheValue && cacheValue._stateID >= state._stateID) {
      return;
    }

    this.cache.set(id, state);

    // delete state._id;
    await this.game.upsert({ id, ctx: { _id: id, ...state } });

    return;
  }

  /**
   * Read the game state.
   * @param {string} id - The game id.
   * @returns {object} - A game state, or undefined
   *                     if no game is found with this id.
   */
  async get(id) {
    let cacheValue = this.cache.get(id);
    if (cacheValue !== undefined) {
      return cacheValue;
    }

    const doc = await this.game.findOne({ where: { id } });

    let oldStateID = 0;
    cacheValue = this.cache.get(id);
    /* istanbul ignore next line */
    if (cacheValue !== undefined) {
      /* istanbul ignore next line */
      oldStateID = cacheValue._stateID;
    }

    let newStateID = -1;
    if (doc) {
      newStateID = doc.ctx._stateID;
    }

    // Update the cache, but only if the read
    // value is newer than the value already in it.
    // A race condition might overwrite the
    // cache with an older value, so we need this.
    if (newStateID >= oldStateID) {
      this.cache.set(id, { ...doc.ctx });
    }

    return doc ? { ...doc.ctx } : null;
  }

  /**
   * Check if a particular game exists.
   * @param {string} id - The game id.
   * @returns {boolean} - True if a game with this id exists.
   */
  async has(id) {
    const cacheValue = this.cache.get(id);
    if (cacheValue !== undefined) {
      return true;
    }

    const doc = await this.game.findOne({ where: { id } });
    return doc !== null;
  }
}
