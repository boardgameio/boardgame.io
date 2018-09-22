/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

const LRU = require('lru-cache');

const ENGINE_FIRESTORE = 'Firestore';
const ENGINE_RTDB = 'RTDB';

/**
 * Firebase RTDB/Firestore connector.
 */
export class Firebase {
  /**
   * Creates a new Firebase connector object.
   * The default engine is Firestore.
   * @constructor
   */
  constructor({ config, dbname, engine, cacheSize }) {
    if (cacheSize === undefined) {
      cacheSize = 1000;
    }

    if (dbname === undefined) {
      dbname = 'bgio';
    }

    // // TODO: better handling for possible errors
    if (config === undefined) {
      config = {};
    }

    this.client = require('firebase');
    this.engine = engine === ENGINE_RTDB ? engine : ENGINE_FIRESTORE;
    this.config = config;
    this.dbname = dbname;
    this.cache = new LRU({ max: cacheSize });
  }

  /**
   * Connect to the instance.
   */
  async connect() {
    this.client.initializeApp(this.config);
    this.db =
      this.engine === ENGINE_FIRESTORE
        ? this.client.firestore()
        : this.client.database().ref();
    return;
  }

  /**
   * Write the game state.
   * @param {string} id - The game id.
   * @param {object} store - A game state to persist.
   */
  async set(id, state) {
    const cacheValue = this.cache.get(id);
    if (cacheValue && cacheValue._stateID >= state._stateID) {
      return;
    }

    this.cache.set(id, state);

    const col =
      this.engine === ENGINE_RTDB
        ? this.db.child(id)
        : this.db.collection(this.dbname).doc(id);
    delete state._id;
    await col.set(state);

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

    let col, doc, data;
    if (this.engine === ENGINE_RTDB) {
      col = this.db.child(id);
      data = await col.once('value');
      doc = data.val()
        ? Object.assign({}, data.val(), { _id: id })
        : data.val();
    } else {
      col = this.db.collection(this.dbname).doc(id);
      data = await col.get();
      doc = data.data()
        ? Object.assign({}, data.data(), { _id: id })
        : data.data();
    }

    let oldStateID = 0;
    cacheValue = this.cache.get(id);
    /* istanbul ignore next line */
    if (cacheValue !== undefined) {
      /* istanbul ignore next line */
      oldStateID = cacheValue._stateID;
    }

    let newStateID = -1;
    if (doc) {
      newStateID = doc._stateID;
    }

    // Update the cache, but only if the read
    // value is newer than the value already in it.
    // A race condition might overwrite the
    // cache with an older value, so we need this.
    if (newStateID >= oldStateID) {
      this.cache.set(id, doc);
    }

    return doc;
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

    let col, data, exists;
    if (this.engine === ENGINE_RTDB) {
      col = this.db.child(id);
      data = await col.once('value');
      exists = data.exists();
    } else {
      col = this.db.collection(this.dbname).doc(id);
      data = await col.get();
      exists = data.exists;
    }

    return exists;
  }

  /**
   * Remove the game state from the DB.
   * @param {string} id - The game id.
   */
  async remove(id) {
    if (!await this.has(id)) return;

    let col;
    if (this.engine === ENGINE_RTDB) {
      col = this.db.child(id);
      await col.remove();
    } else {
      col = this.db.collection(this.dbname).doc(id);
      await col.delete();
    }

    // Update the cache
    this.cache.del(id);
  }

  /**
   * Return all keys.
   * @returns {array} - Array of keys (strings)
   */
  async list() {
    if (this.engine === ENGINE_RTDB) {
      // firebase RTDB
      const cols = await this.db.once('value');
      return cols.ref.sortedDataKeys;
    } else {
      // firestore
      const docs = await this.db.collection(this.dbname).get();
      let ids = [];
      docs.forEach(doc => ids.push(doc.id));
      return ids;
    }
  }
}
