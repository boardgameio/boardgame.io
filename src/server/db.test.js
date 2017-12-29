/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { InMemory } from './db';
import * as Redux from 'redux';

test('basic', () => {
  const db = new InMemory();
  const reducer = () => {};
  const store = Redux.createStore(reducer);

  // Must return undefined when no game exists.
  expect(db.get('gameID')).toEqual(undefined);
  // Create game.
  db.set('gameID', store);
  // Must return created game.
  expect(db.get('gameID')).toEqual(store);

  // Must return true if game exists
  expect(db.has('gameID')).toEqual(true);
});
