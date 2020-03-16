/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { FlatFile } from './flatfile';
import { State, Server } from '../../types';

describe('FlatFile', () => {
  let db;

  beforeAll(async () => {
    db = new FlatFile({ dir: './tmp', logging: false });
    await db.connect();
  });

  afterAll(async () => {
    await db.clear();
  });

  test('basic', async () => {
    // Must return undefined when no game exists.
    let state: unknown = await db.getState('gameID');
    expect(state).toEqual(undefined);

    // Create game.
    state = { a: 1 };
    let metadata: unknown = { metadata: true };
    await db.setState('gameID', state as State);
    await db.setMetadata('gameID', metadata as Server.GameMetadata);

    // Must return created game.
    state = await db.getState('gameID');
    metadata = await db.getMetadata('gameID');
    expect(state).toEqual({ a: 1 });
    expect(metadata).toEqual({ metadata: true });

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
    await db.setState('game2', state as State);
    await db.clear();
    let keys2 = await db.list();
    expect(keys2).toHaveLength(0);
  });
});
