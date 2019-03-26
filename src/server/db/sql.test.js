/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { SQL } from './sql';

test('SQLite db', async () => {
  const db = new SQL(); // defaults to in-memory sqlite database
  await db.connect();

  // Must return undefined when no game exists.
  let state = await db.get('gameID');
  expect(state).toEqual(undefined);

  // Create game.
  await db.set('gameID', { a: 1 });

  // Must return true if game exists
  let has = await db.has('gameID');
  expect(has).toEqual(true);

  // Must return created game.
  state = await db.get('gameID');
  expect(state).toEqual({ a: 1 });

  // Must modify created game.
  await db.set('gameID', { a: 2 });

  // Must return modified game.
  state = await db.get('gameID');
  expect(state).toEqual({ a: 2 });

  // Must return all keys
  let keys = await db.list();
  expect(keys).toEqual(['gameID']);

  // Must remove game from DB
  await db.remove('gameID');
  expect(await db.has('gameID')).toEqual(false);

  // Shall not return error
  await db.remove('gameID');

  // Must return false if game does not exist
  has = await db.has('gameID');
  expect(has).toEqual(false);
});
