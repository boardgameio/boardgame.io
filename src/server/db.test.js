/*
 * Copyright 2017 Google Inc.
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
  expect(db.get('gameid')).toEqual(undefined);
  // Create game.
  db.set('gameid', store);
  // Must return created game.
  expect(db.get('gameid')).toEqual(store);

  // Must return true if game exists
  expect(db.has('gameid')).toEqual(true);
});
