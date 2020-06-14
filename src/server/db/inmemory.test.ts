/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { InMemory } from './inmemory';
import { State, Server } from '../../types';

describe('InMemory', () => {
  let db: InMemory;

  beforeAll(() => {
    db = new InMemory();
    db.connect();
  });

  // Must return undefined when no game exists.
  test('must return undefined when no game exists', () => {
    const { state } = db.fetch('gameID', { state: true });
    expect(state).toEqual(undefined);
  });

  test('create game', () => {
    let stateEntry: unknown = { a: 1 };

    // Create game.
    db.createGame('gameID', {
      metadata: {
        gameName: 'tic-tac-toe',
        updatedAt: new Date(2020, 1).getTime(),
      } as Server.MatchMetadata,
      initialState: stateEntry as State,
    });

    // Must return created game.
    const { state } = db.fetch('gameID', { state: true });
    expect(state).toEqual(stateEntry);

    // Fetch initial state.
    const { initialState } = db.fetch('gameID', { initialState: true });
    expect(initialState).toEqual(stateEntry);
  });

  describe('listGames', () => {
    test('filter by gameName', () => {
      let keys = db.listGames({});
      expect(keys).toEqual(['gameID']);
      keys = db.listGames({ gameName: 'tic-tac-toe' });
      expect(keys).toEqual(['gameID']);
      keys = db.listGames({ gameName: 'chess' });
      expect(keys).toEqual([]);
    });

    test('filter by isGameover', () => {
      const stateEntry: unknown = { a: 1 };
      db.createGame('gameID2', {
        metadata: {
          gameName: 'tic-tac-toe',
          gameover: 'gameover',
          updatedAt: new Date(2020, 3).getTime(),
        } as Server.MatchMetadata,
        initialState: stateEntry as State,
      });

      let keys = db.listGames({});
      expect(keys).toEqual(['gameID', 'gameID2']);
      keys = db.listGames({ where: { isGameover: true } });
      expect(keys).toEqual(['gameID2']);
      keys = db.listGames({ where: { isGameover: false } });
      expect(keys).toEqual(['gameID']);
    });

    test('filter by updatedBefore', () => {
      const stateEntry: unknown = { a: 1 };
      db.createGame('gameID3', {
        metadata: {
          gameName: 'tic-tac-toe',
          updatedAt: new Date(2020, 5).getTime(),
        } as Server.MatchMetadata,
        initialState: stateEntry as State,
      });
      const timestamp = new Date(2020, 4);

      let keys = db.listGames({});
      expect(keys).toEqual(['gameID', 'gameID2', 'gameID3']);
      keys = db.listGames({ where: { updatedBefore: timestamp.getTime() } });
      expect(keys).toEqual(['gameID', 'gameID2']);
    });

    test('filter by updatedAfter', () => {
      const timestamp = new Date(2020, 4);

      let keys = db.listGames({});
      expect(keys).toEqual(['gameID', 'gameID2', 'gameID3']);
      keys = db.listGames({ where: { updatedAfter: timestamp.getTime() } });
      expect(keys).toEqual(['gameID3']);
    });

    test('filter combined', () => {
      const timestamp = new Date(2020, 4);
      const timestamp2 = new Date(2020, 2, 15);
      let keys = db.listGames({
        gameName: 'chess',
        where: { isGameover: true },
      });
      expect(keys).toEqual([]);
      keys = db.listGames({
        where: { isGameover: true, updatedBefore: timestamp.getTime() },
      });
      expect(keys).toEqual(['gameID2']);
      keys = db.listGames({
        where: { isGameover: false, updatedBefore: timestamp.getTime() },
      });
      expect(keys).toEqual(['gameID']);
      keys = db.listGames({
        where: { isGameover: true, updatedAfter: timestamp.getTime() },
      });
      expect(keys).toEqual([]);
      keys = db.listGames({
        where: { isGameover: false, updatedAfter: timestamp.getTime() },
      });
      expect(keys).toEqual(['gameID3']);
      keys = db.listGames({
        where: {
          updatedBefore: timestamp.getTime(),
          updatedAfter: timestamp2.getTime(),
        },
      });
      expect(keys).toEqual(['gameID2']);
    });
  });

  test('remove', () => {
    // Must remove game from DB
    db.wipe('gameID');
    expect(db.fetch('gameID', { state: true })).toEqual({});
    // Shall not return error
    db.wipe('gameID');
  });
});
