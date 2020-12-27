/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { FlatFile } from './flatfile';
import type { State, Server, LogEntry } from '../../types';

describe('FlatFile', () => {
  let db: FlatFile;

  beforeAll(async () => {
    db = new FlatFile({ dir: './tmp', logging: false });
    await db.connect();
  });

  afterEach(async () => {
    await db.clear();
  });

  test('basic', async () => {
    // Must return undefined when no game exists.
    const result = await db.fetch('matchID', { state: true });
    expect(result.state).toEqual(undefined);

    // Create game.
    const state: unknown = { a: 1 };
    const metadata: unknown = { metadata: true };

    await db.createMatch('matchID', {
      initialState: state as State,
      metadata: metadata as Server.MatchData,
    });

    // Must return created game.
    {
      const result = await db.fetch('matchID', {
        state: true,
        metadata: true,
        initialState: true,
      });
      expect(result.state).toEqual({ a: 1 });
      expect(result.initialState).toEqual(result.state);
      expect(result.metadata).toEqual({ metadata: true });
    }

    // Must return all keys
    const keys = await db.listMatches();
    expect(keys).toEqual(['matchID']);

    // Must remove match from DB
    await db.wipe('matchID');
    expect(
      await db.fetch('matchID', { metadata: true, state: true, log: true })
    ).toEqual({});

    // Shall not return error
    await db.wipe('matchID');

    // Shall create match, then clear DB, then check whether DB is cleared
    await db.setState('game2', state as State);
    await db.clear();
    const keys2 = await db.listMatches();
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

    await db.setState('matchID', null, [logEntry1]);
    await db.setState('matchID', null, [logEntry2]);

    const result = await db.fetch('matchID', { log: true });
    expect(result.log).toEqual([logEntry1, logEntry2]);
  });

  describe('listMatches', () => {
    beforeEach(async () => {
      const state: unknown = { a: 1 };

      await db.createMatch('matchID', {
        initialState: state as State,
        metadata: {
          gameName: 'game1',
          updatedAt: new Date(2020, 3).getTime(),
        } as Server.MatchData,
      });

      await db.createMatch('matchID2', {
        initialState: state as State,
        metadata: {
          gameName: 'game1',
          gameover: 'gameover',
          updatedAt: new Date(2020, 5).getTime(),
        } as Server.MatchData,
      });

      await db.createMatch('matchID3', {
        initialState: state as State,
        metadata: {
          gameName: 'game2',
          updatedAt: new Date(2020, 4).getTime(),
        } as Server.MatchData,
      });
    });

    test('filter by gameName', async () => {
      let keys = await db.listMatches();
      expect(keys).toEqual(
        expect.arrayContaining(['matchID', 'matchID2', 'matchID3'])
      );

      keys = await db.listMatches({ gameName: 'game1' });
      expect(keys).toEqual(expect.arrayContaining(['matchID', 'matchID2']));

      keys = await db.listMatches({ gameName: 'game2' });
      expect(keys).toEqual(['matchID3']);
    });

    test('filter by isGameover', async () => {
      let keys = await db.listMatches({});

      expect(keys).toEqual(
        expect.arrayContaining(['matchID', 'matchID2', 'matchID3'])
      );

      keys = await db.listMatches({ where: { isGameover: true } });
      expect(keys).toEqual(['matchID2']);

      keys = await db.listMatches({ where: { isGameover: false } });
      expect(keys).toEqual(expect.arrayContaining(['matchID', 'matchID3']));
    });

    test('filter by updatedBefore', async () => {
      const timestamp = new Date(2020, 4);

      let keys = await db.listMatches({});
      expect(keys).toEqual(
        expect.arrayContaining(['matchID', 'matchID2', 'matchID3'])
      );

      keys = await db.listMatches({
        where: { updatedBefore: timestamp.getTime() },
      });
      expect(keys).toEqual(expect.arrayContaining(['matchID']));
    });

    test('filter by updatedAfter', async () => {
      const timestamp = new Date(2020, 4);

      let keys = await db.listMatches({});
      expect(keys).toEqual(
        expect.arrayContaining(['matchID', 'matchID2', 'matchID3'])
      );

      keys = await db.listMatches({
        where: { updatedAfter: timestamp.getTime() },
      });
      expect(keys).toEqual(['matchID2']);
    });

    test('filter combined', async () => {
      const timestamp = new Date(2020, 4);
      const timestamp2 = new Date(2020, 2, 15);
      let keys = await db.listMatches({
        gameName: 'chess',
        where: { isGameover: true },
      });
      expect(keys).toEqual([]);

      keys = await db.listMatches({
        where: { isGameover: true, updatedBefore: timestamp.getTime() },
      });
      expect(keys).toEqual([]);

      keys = await db.listMatches({
        where: { isGameover: false, updatedBefore: timestamp.getTime() },
      });
      expect(keys).toEqual(['matchID']);

      keys = await db.listMatches({
        where: { isGameover: true, updatedAfter: timestamp.getTime() },
      });
      expect(keys).toEqual(['matchID2']);

      keys = await db.listMatches({
        where: { isGameover: false, updatedAfter: timestamp.getTime() },
      });
      expect(keys).toEqual([]);

      keys = await db.listMatches({
        where: {
          updatedBefore: timestamp.getTime(),
          updatedAfter: timestamp2.getTime(),
        },
      });
      expect(keys).toEqual(['matchID']);
    });
  });
});
