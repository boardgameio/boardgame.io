/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { FlatFile } from './flatfile';

test('flatfile db', async () => {
  const db = new FlatFile({ dir: './tmp', logging: false });
  await db.connect();

  // Must return undefined when no game exists.
  let state = await db.get('gameID');
  expect(state).toEqual(undefined);

  // Create game.
  await db.set('gameID', { a: 1 });

  // Must return created game.
  state = await db.get('gameID');
  expect(state).toEqual({ a: 1 });

  let has = await db.has('gameID');
  expect(has).toEqual(true);

  // Must return all keys
  let keys = await db.list();
  expect(keys).toEqual(['gameID']);

  // Must remove game from DB
  await db.remove('gameID');
  expect(await db.has('gameID')).toEqual(false);

  // Shall not return error
  await db.remove('gameID');

  // Shall create game, then clear DB, then check whether DB is cleared
  await db.set('game2', { a: 1 });
  await db.clear();
  let keys2 = await db.list();
  expect(keys2).toHaveLength(0);
});
