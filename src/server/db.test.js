/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { InMemory } from './db';
import * as Redux from 'redux';

test('basic', async () => {
  const db = new InMemory();
  const reducer = () => {};
  const store = Redux.createStore(reducer);

  // Must return undefined when no game exists.
  let state = await db.get('gameID');
  expect(state).toEqual(undefined);

  // Create game.
  await db.set('gameID', store.getState());
  // Must return created game.
  state = await db.get('gameID')
  expect(state).toEqual(store.getState());

  // Must return true if game exists
  let has = await db.has('gameID');
  expect(has).toEqual(true);
});
