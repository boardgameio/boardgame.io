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
  db.get('gameID').then(gameStore =>{
    expect(gameStore).toEqual(undefined);
  })

  // Create game.
  db.set('gameID', store).then(() => {
    // Must return created game.
    db.get('gameID').then(gameStore => {
      expect(gameStore).toEqual(store);
    });
  });

  // Must return true if game exists
  db.has('gameID').then(result => {
    expect(result).toEqual(true);
  })
});
