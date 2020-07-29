import { LocalStorage } from './localstorage';
import { State, Server } from '../../types';

// this is not best place for fake string generator

const getRandomString = () =>
  Math.random()
    .toString(36)
    .substring(7);

describe('LocaLStorage', () => {
  let db: LocalStorage;

  beforeAll(() => {
    db = new LocalStorage(getRandomString());
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

  test('must create new empty db if other localstorage key is used', () => {
    // create another localstorage with anothr key
    let db2 = new LocalStorage(getRandomString());
    let stateEntry: unknown = { a: 1 };

    // create game in db
    db.createGame('gameID', {
      metadata: {
        gameName: 'tic-tac-toe',
      } as Server.GameMetadata,
      initialState: stateEntry as State,
    });

    // game shouldnt be visible in db2
    const { state } = db2.fetch('gameID', { state: true });
    expect(state).toEqual(undefined);
  });
});
