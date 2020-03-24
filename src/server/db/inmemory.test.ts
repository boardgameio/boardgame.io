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
      } as Server.GameMetadata,
      initialState: stateEntry as State,
    });

    // Must return created game.
    const { state } = db.fetch('gameID', { state: true });
    expect(state).toEqual(stateEntry);

    // Fetch initial state.
    const { initialState } = db.fetch('gameID', { initialState: true });
    expect(initialState).toEqual(stateEntry);
  });

  test('listGames', () => {
    let keys = db.listGames({});
    expect(keys).toEqual(['gameID']);
    keys = db.listGames({ gameName: 'tic-tac-toe' });
    expect(keys).toEqual(['gameID']);
    keys = db.listGames({ gameName: 'chess' });
    expect(keys).toEqual([]);
  });

  test('remove', () => {
    // Must remove game from DB
    db.wipe('gameID');
    expect(db.fetch('gameID', { state: true })).toEqual({});
    // Shall not return error
    db.wipe('gameID');
  });
});
