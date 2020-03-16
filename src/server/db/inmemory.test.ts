/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { InMemory } from './inmemory';
import { State } from '../../types';

test('inmemory db', async () => {
  const db = new InMemory();
  db.connect();

  // Must return undefined when no game exists.
  let state = await db.getState('gameID');
  expect(state).toEqual(undefined);

  let stateEntry: unknown = { a: 1 };

  // Create game.
  db.setState('gameID', stateEntry as State);
  // Must return created game.
  state = db.getState('gameID');
  expect(state).toEqual(stateEntry);

  // Must return true if game exists
  let has = db.has('gameID');
  expect(has).toEqual(true);

  // Must return all keys
  let keys = db.list();
  expect(keys).toEqual(['gameID']);

  // Must remove game from DB
  db.remove('gameID');
  expect(db.has('gameID')).toEqual(false);
  // Shall not return error
  db.remove('gameID');
});
