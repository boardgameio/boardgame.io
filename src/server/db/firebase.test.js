/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { Firebase } from './firebase';
import firebasemock from 'firebase-mock';

function NewFirebase(args) {
  const mockDatabase = new firebasemock.MockFirebase();
  const mockFirestore = new firebasemock.MockFirestore();

  const config = {
    apiKey: 'apikey',
    authDomain: 'authDomain',
    databaseURL: 'databaseURL',
    projectId: 'projectId',
  };

  var mockSDK = new firebasemock.MockFirebaseSdk(
    // use null if your code does not use RTDB
    () => mockDatabase,
    // use null if your code does not use AUTHENTICATION
    () => null,
    // use null if your code does not use FIRESTORE
    () => mockFirestore,
    // use null if your code does not use STORAGE
    () => null,
    // use null if your code does not use MESSAGING
    () => null
  );

  const db = new Firebase({ ...args, config });
  db.client = mockSDK;
  return db;
}

test('construction', () => {
  const dbname = 'a';
  const db = new Firebase({ dbname });
  expect(db.dbname).toBe(dbname);
  expect(db.config).toEqual({});
});

describe('Firestore', async () => {
  let db = null;

  beforeEach(async () => {
    db = NewFirebase({
      engine: 'Firestore',
    });
    await db.connect();
    db.db.autoFlush();
  });

  test('must return undefined when no game exists', async () => {
    const state = await db.get('gameID');
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

  test('cache size', async () => {
    const db = NewFirebase({
      cacheSize: 1,
      engine: 'Firestore',
    });
    await db.connect();
    db.db.autoFlush();
    await db.set('gameID', { a: 1 });
    await db.set('another', { b: 1 });
    const state = await db.get('gameID');
    // Check that it came from Firebase and not the cache.
    expect(state._id).toBeDefined();
  });

  test('race conditions', async () => {
    // Out of order set()'s.
    await db.set('gameID', { _stateID: 1 });
    await db.set('gameID', { _stateID: 0 });
    expect(await db.get('gameID')).toEqual({ _stateID: 1 });

    // Do not override cache on get() if it is fresher than Firebase.
    await db.set('gameID', { _stateID: 0 });
    db.cache.set('gameID', { _stateID: 1 });
    await db.get('gameID');
    expect(db.cache.get('gameID')).toEqual({ _stateID: 1 });

    // Override if it is staler than Firebase.
    await db.set('gameID', { _stateID: 1 });
    db.cache.reset();
    expect(await db.get('gameID')).toMatchObject({ _stateID: 1 });
    expect(db.cache.get('gameID')).toMatchObject({ _stateID: 1 });
  });

  test('list entries', async () => {
    // Insert 3 entries
    await db.set('gameID_0', { a: 0 });
    await db.set('gameID_2', { a: 2 });
    await db.set('gameID_1', { a: 1 });
    const ids = await db.list();
    expect(ids).toContain('gameID_0');
    expect(ids).toContain('gameID_1');
    expect(ids).toContain('gameID_2');
  });

  test('remove entry', async () => {
    // Insert 2 entries
    await db.set('gameID_0', { a: 0 });
    await db.set('gameID_1', { a: 1 });
    // Remove 1
    await db.remove('gameID_1');
    expect(await db.has('gameID_0')).toBe(true);
    expect(await db.has('gameID_1')).toBe(false);
    await db.remove('gameID_1');
  });
});

describe('RTDB', async () => {
  let db = null;

  beforeEach(async () => {
    db = NewFirebase({
      engine: 'RTDB',
    });
    await db.connect();
    db.db.autoFlush();
  });

  test('must return undefined when no game exists', async () => {
    const state = await db.get('gameID');
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

  test('cache size', async () => {
    const db = NewFirebase({
      cacheSize: 1,
      engine: 'RTDB',
    });
    await db.connect();
    db.db.autoFlush();
    await db.set('gameID', { a: 1 });
    await db.set('another', { b: 1 });
    const state = await db.get('gameID');
    // Check that it came from Firebase and not the cache.
    expect(state._id).toBeDefined();
  });

  test('race conditions', async () => {
    // Out of order set()'s.
    await db.set('gameID', { _stateID: 1 });
    await db.set('gameID', { _stateID: 0 });
    expect(await db.get('gameID')).toEqual({ _stateID: 1 });

    // Do not override cache on get() if it is fresher than Firebase.
    await db.set('gameID', { _stateID: 0 });
    db.cache.set('gameID', { _stateID: 1 });
    await db.get('gameID');
    expect(db.cache.get('gameID')).toEqual({ _stateID: 1 });

    // Override if it is staler than Firebase.
    await db.set('gameID', { _stateID: 1 });
    db.cache.reset();
    expect(await db.get('gameID')).toMatchObject({ _stateID: 1 });
    expect(db.cache.get('gameID')).toMatchObject({ _stateID: 1 });
  });

  test('list entries', async () => {
    // Insert 3 entries
    await db.set('gameID_0', { a: 0 });
    await db.set('gameID_2', { a: 2 });
    await db.set('gameID_1', { a: 1 });
    const ids = await db.list();
    expect(ids).toContain('gameID_0');
    expect(ids).toContain('gameID_1');
    expect(ids).toContain('gameID_2');
  });

  test('remove entry', async () => {
    // Insert 2 entries
    await db.set('gameID_0', { a: 0 });
    await db.set('gameID_1', { a: 1 });
    // Remove 1
    await db.remove('gameID_1');
    expect(await db.has('gameID_0')).toBe(true);
    expect(await db.has('gameID_1')).toBe(false);
    await db.remove('gameID_1');
  });
});
