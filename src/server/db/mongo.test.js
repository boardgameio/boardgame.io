/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { Mongo } from './mongo';
import * as MongoDB from 'mongo-mock';

test('Mongo', async () => {
  const mockClient = MongoDB.MongoClient;
  const db = new Mongo({ mockClient, url: 'a' });
  await db.connect();

  // Must return undefined when no game exists.
  let state = await db.get('gameID');
  expect(state).toEqual(undefined);

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
    const db = new Mongo({ mockClient, cacheSize: 1, url: 'a' });
    await db.connect();
    await db.set('gameID', { a: 1 });
    await db.set('another', { b: 1 });
    state = await db.get('gameID');
    // Check that it came from Mongo and not the cache.
    expect(state._id).toBeDefined();
  }

  {
    const db = new Mongo({ url: 'a', dbname: 'test' });
    expect(db.client).toBeDefined();
    expect(db.dbname).toBe('test');
  }
});

test('Mongo - race conditions', async () => {
  const mockClient = MongoDB.MongoClient;
  const db = new Mongo({ mockClient, url: 'a' });
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

test('Mongo - list', async () => {
  const mockClient = MongoDB.MongoClient;
  const db = new Mongo({ mockClient, url: 'a' });
  await db.connect();

  // Insert 3 entries
  await db.set('gameID_0', { a: 0 });
  await db.set('gameID_2', { a: 2 });
  await db.set('gameID_1', { a: 1 });
  const ids = await db.list();
  expect(ids).toContain('gameID_0');
  expect(ids).toContain('gameID_1');
  expect(ids).toContain('gameID_2');
});

test('Mongo - remove', async () => {
  const mockClient = MongoDB.MongoClient;
  const db = new Mongo({ mockClient, url: 'a' });
  await db.connect();

  // Insert 2 entries
  await db.set('gameID_0', { a: 0 });
  await db.set('gameID_1', { a: 1 });
  // Remove 1
  await db.remove('gameID_1');
  expect(await db.has('gameID_0')).toBe(true);
  expect(await db.has('gameID_1')).toBe(false);
  // Shall not throw error
  await db.remove('gameID_1');
});
