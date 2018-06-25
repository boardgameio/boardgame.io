/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

const Sequelize = require('sequelize');
import { SQL } from './sql';

test('SQL', async () => {
  const db = new SQL({ cacheSize: 1000 });
  db.db = new Sequelize('database', 'user', 'password', {
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false,
  });
  db.game = db.db.define('game', {
    id: {
      type: Sequelize.STRING,
      unique: true,
      primaryKey: true,
    },
    state: { type: Sequelize.JSON },
  });
  await db.connect();

  // Must return undefined when no game exists.
  let state = await db.get('gameID');
  expect(state).toEqual(null);

  // Create game.
  await db.set('gameID', { a: 1 });

  // Cache hits.
  {
    // Must return created game.
    state = await db.get('gameID');
    expect(state).toMatchObject({ a: 1 });

    // Must return true if game exists
    const has = await db.has('gameID');
    expect(has).toBe(true);
  }

  // Cache misses.
  {
    // Must return created game.
    db.cache.reset();
    state = await db.get('gameID');
    expect(state).toMatchObject({ a: 1 });

    // Must return true if game exists
    db.cache.reset();
    const has = await db.has('gameID');
    expect(has).toBe(true);
  }

  // Cache size.
  {
    const db = new SQL({ cacheSize: 1 });
    db.db = new Sequelize('database', 'user', 'password', {
      dialect: 'sqlite',
      storage: ':memory:',
      logging: false,
    });
    db.game = db.db.define('game', {
      id: {
        type: Sequelize.STRING,
        unique: true,
        primaryKey: true,
      },
      state: { type: Sequelize.JSON },
    });
    await db.connect();
    await db.set('gameID', { a: 1 });
    await db.set('another', { b: 1 });
    let state = await db.get('gameID');
    // Check that it came from Mongo and not the cache.
    expect(state._id).toBeDefined();
  }

  {
    const db = new SQL({ cacheSize: 1 });
    db.db = new Sequelize('database', 'user', 'password', {
      dialect: 'mysql',
      logging: false,
    });
    const connection = await db.connect();
    expect(connection).toBeInstanceOf(Error);
  }
});

test('SQL - race conditions', async () => {
  const db = new SQL({ cacheSize: 1000 });
  db.db = new Sequelize('database', 'user', 'password', {
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false,
  });
  db.game = db.db.define('game', {
    id: {
      type: Sequelize.STRING,
      unique: true,
      primaryKey: true,
    },
    state: { type: Sequelize.JSON },
  });
  await db.connect();

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
