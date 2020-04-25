/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { BlobServiceClient } from '@azure/storage-blob';
import { State, Server, LogEntry } from '../../types';
import { AzureStorage } from './azurestorage';
import { FlatFile } from './flatfile';

const tests = [
  { name: 'FlatFile', db: new FlatFile({ dir: './tmp', logging: false }) },
  {
    name: 'AzureStorage',
    db: new AzureStorage({
      client: BlobServiceClient.fromConnectionString(
        'UseDevelopmentStorage=true'
      ),
      container: 'test',
    }),
  },
];

for (const { name, db } of tests) {
  describe(name, () => {
    beforeAll(async () => {
      await db.connect();
    });

    afterEach(async () => {
      await db.clear();
    });

    test('basic', async () => {
      // Must return undefined when no game exists.
      const result = await db.fetch('gameID', { state: true });
      expect(result.state).toEqual(undefined);

      // Create game.
      const state: unknown = { a: 1 };
      const metadata: unknown = { metadata: true };

      await db.createGame('gameID', {
        initialState: state as State,
        metadata: metadata as Server.GameMetadata,
      });

      // Must return created game.
      {
        const result = await db.fetch('gameID', {
          state: true,
          metadata: true,
          initialState: true,
        });
        expect(result.state).toEqual({ a: 1 });
        expect(result.initialState).toEqual(result.state);
        expect(result.metadata).toEqual({ metadata: true });
      }

      // Must return all keys
      let keys = await db.listGames();
      expect(keys).toEqual(['gameID']);

      // Must remove game from DB
      await db.wipe('gameID');
      expect(
        await db.fetch('gameID', { metadata: true, state: true, log: true })
      ).toEqual({});

      // Shall not return error
      await db.wipe('gameID');

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

      await db.setState('gameIDlog', null, [logEntry1]);
      await db.setState('gameIDlog', null, [logEntry2]);

      const result = await db.fetch('gameIDlog', { log: true });
      expect(result.log).toEqual([logEntry1, logEntry2]);
    });
  });
}
