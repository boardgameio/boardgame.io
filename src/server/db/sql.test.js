/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

const Sequelize = require('sequelize');
import { SQL } from './sql';

function newSQL(args) {
  const db = new SQL({ ...args });
  db.db = new Sequelize('database', 'user', 'password', {
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false,
    operatorsAliases: false,
  });
  db.game = db.db.define('game', {
    id: {
      type: Sequelize.STRING,
      unique: true,
      primaryKey: true,
    },
    state: { type: Sequelize.JSON },
  });
  return db;
}

describe('SQL', async () => {
  let db = null;

  beforeEach(async () => {
    db = newSQL({ cacheSize: 1000 });
    await db.connect();
  });

  test('must return null when no game exists', async () => {
    let state = await db.get('gameID');
    expect(state).toEqual(null);
  });

  test('cache hit', async () => {
    // Create game.
    await db.set('gameID', { a: 1 });

    // Must return created game.
    const state = await db.get('gameID');
    expect(state).toMatchObject({ a: 1 });

    // Must return true if game exists
    const has = await db.has('gameID');
    expect(has).toBe(true);
  });

  test('cache size', async () => {
    const db = newSQL({ cacheSize: 1 });
    await db.connect();
    await db.set('gameID', { a: 1 });
    await db.set('another', { b: 1 });
    const state = await db.get('gameID');
    // Check that it came from SQL and not the cache.
    expect(state._id).toBeDefined();
  });

  test('cache miss', async () => {
    // Create game.
    await db.set('gameID', { a: 1 });

    // Must return created game.
    db.cache.reset();
    const state = await db.get('gameID');
    expect(state).toMatchObject({ a: 1 });

    // Must return true if game exists
    db.cache.reset();
    const has = await db.has('gameID');
    expect(has).toBe(true);
  });

  test('race conditions', async () => {
    // Out of order set()'s.
    await db.set('gameID', { _stateID: 1 });
    await db.set('gameID', { _stateID: 0 });
    expect(await db.get('gameID')).toEqual({ _stateID: 1 });

    // Do not override cache on get() if it is fresher than Mongo.
    await db.set('gameID', { _stateID: 0 });
    db.cache.set('gameID', { _stateID: 1 });
    await db.get('gameID');
    expect(db.cache.get('gameID')).toEqual({ _stateID: 1 });

    // Override if it is staler than Mongo.
    await db.set('gameID', { _stateID: 1 });
    db.cache.reset();
    expect(await db.get('gameID')).toMatchObject({ _stateID: 1 });
    expect(db.cache.get('gameID')).toMatchObject({ _stateID: 1 });
  });

  test('connection error', async () => {
    const db = new SQL({ cacheSize: 1 });
    db.db = new Sequelize('database', 'user', 'password', {
      dialect: 'mysql',
      logging: false,
      operatorsAliases: false,
    });
    const connection = await db.connect();
    expect(connection).toBeInstanceOf(Error);
  });
});
