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
  let db;

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
    db.setMetadata('gameID', {
      gameName: 'tic-tac-toe',
    } as Server.GameMetadata);
    db.setState('gameID', stateEntry as State);
    // Must return created game.
    const { state } = db.fetch('gameID', { state: true });
    expect(state).toEqual(stateEntry);
  });

  test('listGames', () => {
    let keys = db.listGames();
    expect(keys).toEqual(['gameID']);
    keys = db.listGames('tic-tac-toe');
    expect(keys).toEqual(['gameID']);
    keys = db.listGames('chess');
    expect(keys).toEqual([]);
  });

  test('remove', () => {
    // Must remove game from DB
    db.remove('gameID');
    expect(db.fetch('gameID', { state: true })).toEqual({});
    // Shall not return error
    db.remove('gameID');
  });
});
