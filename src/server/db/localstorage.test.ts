import { nanoid } from 'nanoid';
import { LocalStorage } from './localstorage';
import type { State, Server } from '../../types';

describe('LocaLStorage', () => {
  let db: LocalStorage;

  beforeAll(() => {
    db = new LocalStorage(nanoid());
    db.connect();
  });

  // Must return undefined when no game exists.
  test('must return undefined when no game exists', () => {
    const { state } = db.fetch('gameID', { state: true });
    expect(state).toEqual(undefined);
  });

  test('create game', () => {
    const stateEntry: unknown = { a: 1 };

    // Create game.
    db.createMatch('gameID', {
      metadata: {
        gameName: 'tic-tac-toe',
      } as Server.MatchData,
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
    let keys = db.listMatches({});
    expect(keys).toEqual(['gameID']);
    keys = db.listMatches({ gameName: 'tic-tac-toe' });
    expect(keys).toEqual(['gameID']);
    keys = db.listMatches({ gameName: 'chess' });
    expect(keys).toEqual([]);
  });

  test('remove', () => {
    // Must remove game from DB
    db.wipe('gameID');
    expect(db.fetch('gameID', { state: true })).toEqual({});
    // Shall not return error
    db.wipe('gameID');
  });

  test('must create new empty db if other localstorage key is used', () => {
    // create another localstorage with anothr key
    const db2 = new LocalStorage(nanoid());
    const stateEntry: unknown = { a: 1 };

    // create game in db
    db.createMatch('gameID', {
      metadata: {
        gameName: 'tic-tac-toe',
      } as Server.MatchData,
      initialState: stateEntry as State,
    });

    // game shouldnt be visible in db2
    const { state } = db2.fetch('gameID', { state: true });
    expect(state).toEqual(undefined);
  });
});
