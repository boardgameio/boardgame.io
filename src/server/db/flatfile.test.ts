/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { FlatFile } from './flatfile';
import { State, Server, LogEntry } from '../../types';

describe('FlatFile', () => {
  let db;

  beforeAll(async () => {
    db = new FlatFile({ dir: './tmp', logging: false });
    await db.connect();
  });

  afterEach(async () => {
    await db.clear();
  });

  test('basic', async () => {
    // Must return undefined when no game exists.
    let { state } = await db.fetch('gameID', { state: true });
    expect(state).toEqual(undefined);

    // Create game.
    state = { a: 1 };
    let metadata: unknown = { metadata: true };
    await db.setState('gameID', state as State);
    await db.setMetadata('gameID', metadata as Server.GameMetadata);

    // Must return created game.
    const result = await db.fetch('gameID', { state: true, metadata: true });
    expect(result.state).toEqual({ a: 1 });
    expect(result.metadata).toEqual({ metadata: true });

    // Must return all keys
    let keys = await db.listGames();
    expect(keys).toEqual(['gameID']);

    // Must remove game from DB
    await db.remove('gameID');
    expect(
      await db.fetch('gameID', { metadata: true, state: true, log: true })
    ).toEqual({});

    // Shall not return error
    await db.remove('gameID');

    // Shall create game, then clear DB, then check whether DB is cleared
    await db.setState('game2', state as State);
    await db.clear();
    let keys2 = await db.listGames();
    expect(keys2).toHaveLength(0);
  });

  test('log', async () => {
    const logEntry1: LogEntry = {
      _stateID: 0,
      action: {
        type: 'MAKE_MOVE',
        payload: { type: '', playerID: '0', args: [] },
      },
      turn: 0,
      phase: '',
    };

    const logEntry2: LogEntry = {
      _stateID: 1,
      action: {
        type: 'MAKE_MOVE',
        payload: { type: '', playerID: '0', args: [] },
      },
      turn: 1,
      phase: '',
    };

    await db.setState('gameID', { deltalog: [logEntry1] });
    await db.setState('gameID', { deltalog: [logEntry2] });

    const result = await db.fetch('gameID', { log: true });
    expect(result.log).toEqual([logEntry1, logEntry2]);
  });
});
