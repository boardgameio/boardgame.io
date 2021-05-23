/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import * as ActionCreators from '../core/action-creators';
import { InitializeGame } from '../core/initialize';
import { InMemory } from '../server/db/inmemory';
import { Master, redactLog } from './master';
import { error } from '../core/logger';
import type { Game, Server, State, Ctx, LogEntry } from '../types';
import { Auth } from '../server/auth';
import * as StorageAPI from '../server/db/base';
import * as dateMock from 'jest-date-mock';
import { PlayerView } from '../core/player-view';
import { INVALID_MOVE } from '../core/constants';

jest.mock('../core/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
}));

beforeEach(() => {
  dateMock.clear();
});

class InMemoryAsync extends StorageAPI.Async {
  db: InMemory;

  constructor() {
    super();
    this.db = new InMemory();
  }

  async connect() {
    await this.sleep();
  }

  private sleep(): Promise<void> {
    const interval = Math.round(Math.random() * 50 + 50);
    return new Promise((resolve) => void setTimeout(resolve, interval));
  }

  async createMatch(id: string, opts: StorageAPI.CreateMatchOpts) {
    await this.sleep();
    this.db.createMatch(id, opts);
  }

  async setMetadata(matchID: string, metadata: Server.MatchData) {
    await this.sleep();
    this.db.setMetadata(matchID, metadata);
  }

  async setState(matchID: string, state: State, deltalog?: LogEntry[]) {
    await this.sleep();
    this.db.setState(matchID, state, deltalog);
  }

  async fetch<O extends StorageAPI.FetchOpts>(
    matchID: string,
    opts: O
  ): Promise<StorageAPI.FetchResult<O>> {
    await this.sleep();
    return this.db.fetch(matchID, opts);
  }

  async wipe(matchID: string) {
    await this.sleep();
    this.db.wipe(matchID);
  }

  async listMatches(opts?: StorageAPI.ListMatchesOpts): Promise<string[]> {
    await this.sleep();
    return this.db.listMatches(opts);
  }
}

const game = { seed: 0 };

function TransportAPI(send = jest.fn(), sendAll = jest.fn()) {
  return { send, sendAll };
}

function validateNotTransientState(state: any) {
  expect(state).toEqual(
    expect.not.objectContaining({ transients: expect.anything() })
  );
}

describe('sync', () => {
  const send = jest.fn();
  const db = new InMemory();
  const master = new Master(game, db, TransportAPI(send));

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('causes server to respond', async () => {
    await master.onSync('matchID', '0', undefined, 2);
    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'sync',
      })
    );
  });

  test('sync a second time does not create a game', async () => {
    const fetchResult = db.fetch('matchID', { metadata: true });
    await master.onSync('matchID', '0', undefined, 2);
    expect(db.fetch('matchID', { metadata: true })).toMatchObject(fetchResult);
  });

  test('should not have metadata', async () => {
    db.setState('oldGameID', {} as State);
    await master.onSync('oldGameID', '0');
    // [0][0] = first call, first argument
    expect(send.mock.calls[0][0].args[1].filteredMetadata).toBeUndefined();
  });

  test('should have metadata', async () => {
    const db = new InMemory();
    const metadata = {
      gameName: 'tic-tac-toe',
      setupData: {},
      players: {
        '0': {
          id: 0,
          credentials: 'qS2m4Ujb_',
          name: 'Alice',
        },
        '1': {
          id: 1,
          credentials: 'nIQtXFybDD',
          name: 'Bob',
        },
      },
      createdAt: 0,
      updatedAt: 0,
    };
    db.createMatch('matchID', { metadata, initialState: {} as State });
    const masterWithMetadata = new Master(game, db, TransportAPI(send));
    await masterWithMetadata.onSync('matchID', '0', undefined, 2);

    const expectedMetadata = [
      { id: 0, name: 'Alice' },
      { id: 1, name: 'Bob' },
    ];
    expect(send.mock.calls[0][0].args[1].filteredMetadata).toMatchObject(
      expectedMetadata
    );
  });

  test('should not create match for games that require setupData', async () => {
    const game: Game = {
      validateSetupData: () => 'requires setupData',
    };
    const db = new InMemory();
    const master = new Master(game, db, TransportAPI(send));

    const matchID = 'matchID';
    const res = await master.onSync(matchID, '0', undefined, 2);

    expect(res).toEqual({ error: 'game requires setupData' });
    expect(send).not.toHaveBeenCalled();
    expect(db.fetch(matchID, { state: true })).toEqual({ state: undefined });
  });
});

describe('update', () => {
  let sendAllReturn;

  const send = jest.fn();
  const sendAll = jest.fn((arg) => {
    sendAllReturn = arg;
  });
  const game = {
    moves: {
      A: (G) => G,
    },
  };
  let db;
  let master;
  const action = ActionCreators.gameEvent('endTurn');

  beforeEach(async () => {
    db = new InMemory();
    master = new Master(game, db, TransportAPI(send, sendAll));
    await master.onSync('matchID', '0', undefined, 2);
    sendAllReturn = undefined;
    jest.clearAllMocks();
  });

  test('basic', async () => {
    await master.onUpdate(action, 0, 'matchID', '0');
    expect(sendAll).toBeCalled();
    expect(sendAllReturn).not.toBeUndefined();

    const value = sendAllReturn('0');
    expect(value.type).toBe('update');
    expect(value.args[0]).toBe('matchID');
    expect(value.args[1]).toMatchObject({
      G: {},
      deltalog: undefined,
      _redo: [],
      _stateID: 1,
      _undo: [],
      ctx: {
        currentPlayer: '1',
        numPlayers: 2,
        phase: null,
        playOrder: ['0', '1'],
        playOrderPos: 1,
        turn: 2,
      },
    });

    expect(value.args[2]).toMatchObject([
      {
        action: {
          payload: {
            args: undefined,
            credentials: undefined,
            playerID: undefined,
            type: 'endTurn',
          },
          type: 'GAME_EVENT',
        },
      },
    ]);
  });

  test('invalid matchID', async () => {
    await master.onUpdate(action, 0, 'default:unknown', '1');
    expect(sendAll).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledWith(
      `game not found, matchID=[default:unknown]`
    );
  });

  test('invalid stateID', async () => {
    await master.onUpdate(action, 100, 'matchID', '0');
    expect(sendAll).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledWith(
      `invalid stateID, was=[100], expected=[0] - playerID=[0] - action[endTurn]`
    );
  });

  test('invalid playerID', async () => {
    await master.onUpdate(action, 0, 'matchID', '100');
    await master.onUpdate(ActionCreators.makeMove('move'), 1, 'matchID', '100');
    expect(sendAll).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledWith(
      `player not active - playerID=[100] - action[move]`
    );
  });

  test('invalid move', async () => {
    await master.onUpdate(ActionCreators.makeMove('move'), 0, 'matchID', '0');
    expect(sendAll).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledWith(
      `move not processed - canPlayerMakeMove=false - playerID=[0] - action[move]`
    );
  });

  test('valid matchID / stateID / playerID', async () => {
    await master.onUpdate(action, 0, 'matchID', '0');
    expect(sendAll).toHaveBeenCalled();
  });

  test('allow execution of moves with ignoreStaleStateID truthy', async () => {
    const game = {
      setup: () => {
        const G = {
          players: {
            '0': {
              cards: ['card3'],
            },
            '1': {
              cards: [],
            },
          },
          cards: ['card0', 'card1', 'card2'],
          discardedCards: [],
        };
        return G;
      },
      playerView: PlayerView.STRIP_SECRETS,
      turn: {
        activePlayers: { currentPlayer: { stage: 'A' } },
        stages: {
          A: {
            moves: {
              A: (G, ctx: Ctx) => {
                const card = G.players[ctx.playerID].cards.shift();
                G.discardedCards.push(card);
              },
              B: {
                move: (G, ctx: Ctx) => {
                  const card = G.cards.pop();
                  G.players[ctx.playerID].cards.push(card);
                },
                ignoreStaleStateID: true,
              },
            },
          },
        },
      },
    };

    const send = jest.fn();
    const master = new Master(
      game,
      new InMemory(),
      TransportAPI(send, sendAll)
    );

    const setActivePlayers = ActionCreators.gameEvent(
      'setActivePlayers',
      [{ all: 'A' }],
      '0'
    );
    const actionA = ActionCreators.makeMove('A', null, '0');
    const actionB = ActionCreators.makeMove('B', null, '1');
    const actionC = ActionCreators.makeMove('B', null, '0');

    // test: simultaneous moves
    await master.onSync('matchID', '0', undefined, 2);
    await master.onUpdate(actionA, 0, 'matchID', '0');
    await master.onUpdate(setActivePlayers, 1, 'matchID', '0');
    await Promise.all([
      master.onUpdate(actionB, 2, 'matchID', '1'),
      master.onUpdate(actionC, 2, 'matchID', '0'),
    ]);
    await Promise.all([
      master.onSync('matchID', '0', undefined, 2),
      master.onSync('matchID', '1', undefined, 2),
    ]);

    const G_player0 = sendAllReturn('0').args[1].G;
    const G_player1 = sendAllReturn('1').args[1].G;

    expect(G_player0).toMatchObject({
      players: {
        '0': {
          cards: ['card1'],
        },
      },
      cards: ['card0'],
      discardedCards: ['card3'],
    });
    expect(G_player1).toMatchObject({
      players: {
        '1': {
          cards: ['card2'],
        },
      },
      cards: ['card0'],
      discardedCards: ['card3'],
    });
  });

  describe('undo / redo', () => {
    test('player 0 can undo', async () => {
      const move = ActionCreators.makeMove('A', null, '0');
      await master.onUpdate(move, 0, 'matchID', '0');
      expect(error).not.toHaveBeenCalled();
      await master.onUpdate(ActionCreators.undo(), 1, 'matchID', '0');
      expect(error).not.toHaveBeenCalled();

      // Negative case: All moves already undone.
      await master.onUpdate(ActionCreators.undo(), 2, 'matchID', '0');
      expect(error).toHaveBeenCalledWith(`No moves to undo`);
    });

    test('player 1 can’t undo', async () => {
      await master.onUpdate(ActionCreators.undo(), 2, 'matchID', '1');
      expect(error).toHaveBeenCalledWith(
        `playerID=[1] cannot undo / redo right now`
      );
    });

    test('player can’t undo with multiple active players', async () => {
      const setActivePlayers = ActionCreators.gameEvent(
        'setActivePlayers',
        [{ all: 'A' }],
        '0'
      );
      await master.onUpdate(setActivePlayers, 0, 'matchID', '0');
      await master.onUpdate(ActionCreators.undo('0'), 1, 'matchID', '0');
      expect(error).toHaveBeenCalledWith(
        `playerID=[0] cannot undo / redo right now`
      );
    });

    test('player can undo if they are the only active player', async () => {
      const move = ActionCreators.makeMove('A', null, '0');
      await master.onUpdate(move, 0, 'matchID', '0');
      expect(error).not.toHaveBeenCalled();
      const endStage = ActionCreators.gameEvent('endStage', undefined, '0');
      await master.onUpdate(endStage, 1, 'matchID', '0');
      expect(error).not.toBeCalled();
      await master.onUpdate(ActionCreators.undo(), 2, 'matchID', '0');
      expect(error).not.toBeCalled();

      // Clean-up active players.
      const endStage2 = ActionCreators.gameEvent('endStage', undefined, '1');
      await master.onUpdate(endStage2, 3, 'matchID', '1');
    });
  });

  test('game over', async () => {
    let event = ActionCreators.gameEvent('endGame');
    await master.onUpdate(event, 0, 'matchID', '0');
    event = ActionCreators.gameEvent('endTurn');
    await master.onUpdate(event, 1, 'matchID', '0');
    expect(error).toHaveBeenCalledWith(
      `game over - matchID=[matchID] - playerID=[0] - action[endTurn]`
    );
  });

  test('writes gameover to metadata', async () => {
    const id = 'gameWithMetadata';
    const db = new InMemory();
    const dbMetadata = {
      gameName: 'tic-tac-toe',
      setupData: {},
      players: { '0': { id: 0 }, '1': { id: 1 } },
      createdAt: 0,
      updatedAt: 0,
    };
    db.setMetadata(id, dbMetadata);
    const masterWithMetadata = new Master(game, db, TransportAPI(send));
    await masterWithMetadata.onSync(id, '0', undefined, 2);

    const gameOverArg = 'gameOverArg';
    const event = ActionCreators.gameEvent('endGame', gameOverArg);
    await masterWithMetadata.onUpdate(event, 0, id, '0');
    const { metadata } = db.fetch(id, { metadata: true });
    expect(metadata.gameover).toEqual(gameOverArg);
  });

  test('writes gameover to metadata with async storage API', async () => {
    const id = 'gameWithMetadata';
    const db = new InMemoryAsync();
    const dbMetadata = {
      gameName: 'tic-tac-toe',
      setupData: {},
      players: { '0': { id: 0 }, '1': { id: 1 } },
      createdAt: 0,
      updatedAt: 0,
    };
    await db.setMetadata(id, dbMetadata);
    const masterWithMetadata = new Master(game, db, TransportAPI(send));
    await masterWithMetadata.onSync(id, '0', undefined, 2);

    const gameOverArg = 'gameOverArg';
    const event = ActionCreators.gameEvent('endGame', gameOverArg);
    await masterWithMetadata.onUpdate(event, 0, id, '0');
    const { metadata } = await db.fetch(id, { metadata: true });
    expect(metadata.gameover).toEqual(gameOverArg);
  });

  test('writes updatedAt to metadata with async storage API', async () => {
    const id = 'gameWithMetadata';
    const db = new InMemoryAsync();
    const dbMetadata = {
      gameName: 'tic-tac-toe',
      setupData: {},
      players: { '0': { id: 0 }, '1': { id: 1 } },
      createdAt: 0,
      updatedAt: 0,
    };
    await db.setMetadata(id, dbMetadata);
    const masterWithMetadata = new Master(game, db, TransportAPI(send));
    await masterWithMetadata.onSync(id, '0', undefined, 2);

    const updatedAt = new Date(2020, 3, 4, 5, 6, 7);
    dateMock.advanceTo(updatedAt);
    const event = ActionCreators.gameEvent('endTurn', null, '0');
    await masterWithMetadata.onUpdate(event, 0, id, '0');
    const { metadata } = await db.fetch(id, { metadata: true });
    expect(metadata.updatedAt).toEqual(updatedAt.getTime());
  });

  test('processes update if there is no metadata', async () => {
    const id = 'gameWithoutMetadata';
    const db = new InMemory();
    const masterWithoutMetadata = new Master(game, db, TransportAPI(send));
    // Store state manually to bypass automatic metadata initialization on sync.
    let state = InitializeGame({ game });
    expect(state.ctx.turn).toBe(1);
    db.setState(id, state);
    // Dispatch update to end the turn.
    const event = ActionCreators.gameEvent('endTurn', null, '0');
    await masterWithoutMetadata.onUpdate(event, 0, id, '0');
    // Confirm the turn ended.
    let metadata: undefined | Server.MatchData;
    ({ state, metadata } = db.fetch(id, { state: true, metadata: true }));
    expect(state.ctx.turn).toBe(2);
    expect(metadata).toBeUndefined();
  });

  test('processes update if there is no metadata with async DB', async () => {
    const id = 'gameWithoutMetadata';
    const db = new InMemoryAsync();
    const masterWithoutMetadata = new Master(game, db, TransportAPI(send));
    // Store state manually to bypass automatic metadata initialization on sync.
    let state = InitializeGame({ game });
    expect(state.ctx.turn).toBe(1);
    await db.setState(id, state);
    // Dispatch update to end the turn.
    const event = ActionCreators.gameEvent('endTurn', null, '0');
    await masterWithoutMetadata.onUpdate(event, 0, id, '0');
    // Confirm the turn ended.
    let metadata: undefined | Server.MatchData;
    ({ state, metadata } = await db.fetch(id, { state: true, metadata: true }));
    expect(state.ctx.turn).toBe(2);
    expect(metadata).toBeUndefined();
  });
});

describe('patch', () => {
  let sendAllReturn;

  const send = jest.fn();
  const sendAll = jest.fn((arg) => {
    sendAllReturn = arg;
  });
  const db = new InMemory();
  const master = new Master(
    {
      seed: 0,
      deltaState: true,
      setup: () => {
        return {
          players: {
            '0': {
              cards: ['card3'],
            },
            '1': {
              cards: [],
            },
          },
          cards: ['card0', 'card1', 'card2'],
          discardedCards: [],
        };
      },
      playerView: PlayerView.STRIP_SECRETS,
      turn: {
        activePlayers: { currentPlayer: { stage: 'A' } },
        stages: {
          A: {
            moves: {
              Invalid: () => {
                return INVALID_MOVE;
              },
              A: {
                client: false,
                move: (G, ctx: Ctx) => {
                  const card = G.players[ctx.playerID].cards.shift();
                  G.discardedCards.push(card);
                },
              },
              B: {
                client: false,
                ignoreStaleStateID: true,
                move: (G, ctx: Ctx) => {
                  const card = G.cards.pop();
                  G.players[ctx.playerID].cards.push(card);
                },
              },
            },
          },
        },
      },
    },
    db,
    TransportAPI(send, sendAll)
  );
  const move = ActionCreators.makeMove('A', null, '0');
  const action = ActionCreators.gameEvent('endTurn');

  beforeAll(async () => {
    master.subscribe(({ state }) => {
      validateNotTransientState(state);
    });
    await master.onSync('matchID', '0', undefined, 2);
  });

  beforeEach(() => {
    sendAllReturn = undefined;
    jest.clearAllMocks();
  });

  test('basic', async () => {
    await master.onUpdate(move, 0, 'matchID', '0');
    expect(sendAll).toBeCalled();
    expect(sendAllReturn).not.toBeUndefined();

    const value = sendAllReturn('0');
    expect(value.type).toBe('patch');
    expect(value.args[0]).toBe('matchID');
    expect(value.args[1]).toBe(0);
    expect(value.args[2]).toBe(1);
    expect(value.args[3]).toMatchObject([
      { op: 'remove', path: '/G/players/0/cards/0' },
      { op: 'add', path: '/G/discardedCards/-', value: 'card3' },
      { op: 'replace', path: '/ctx/numMoves', value: 1 },
      { op: 'replace', path: '/_stateID', value: 1 },
    ]);

    expect(value.args[4]).toMatchObject([
      {
        action: {
          payload: {
            args: null,
            playerID: '0',
            type: 'A',
          },
          type: 'MAKE_MOVE',
        },
      },
    ]);
  });

  test('invalid matchID', async () => {
    await master.onUpdate(action, 1, 'default:unknown', '1');
    expect(sendAll).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledWith(
      `game not found, matchID=[default:unknown]`
    );
  });

  test('invalid stateID', async () => {
    await master.onUpdate(action, 100, 'matchID', '0');
    expect(sendAll).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledWith(
      `invalid stateID, was=[100], expected=[1] - playerID=[0] - action[endTurn]`
    );
  });

  test('invalid playerID', async () => {
    await master.onUpdate(action, 1, 'matchID', '102');
    await master.onUpdate(ActionCreators.makeMove('move'), 1, 'matchID', '102');
    expect(sendAll).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledWith(
      `player not active - playerID=[102] - action[move]`
    );
  });

  test('disallowed move', async () => {
    await master.onUpdate(ActionCreators.makeMove('move'), 1, 'matchID', '0');
    expect(sendAll).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledWith(
      `move not processed - canPlayerMakeMove=false - playerID=[0] - action[move]`
    );
  });

  test('invalid move', async () => {
    await master.onUpdate(
      ActionCreators.makeMove('Invalid', null, '0'),
      1,
      'matchID',
      '0'
    );
    expect(sendAll).toHaveBeenCalled();
    expect(error).toHaveBeenCalledWith('invalid move: Invalid args: null');
  });

  test('valid matchID / stateID / playerID', async () => {
    await master.onUpdate(action, 1, 'matchID', '0');
    expect(sendAll).toHaveBeenCalled();
  });

  describe('undo / redo', () => {
    test('player 0 can undo', async () => {
      await master.onUpdate(ActionCreators.undo(), 2, 'matchID', '1');
      // The master allows this, but the reducer does not.
      expect(error).toHaveBeenCalledWith(`No moves to undo`);
    });

    test('player 1 can’t undo', async () => {
      await master.onUpdate(ActionCreators.undo(), 2, 'matchID', '0');
      expect(error).toHaveBeenCalledWith(
        `playerID=[0] cannot undo / redo right now`
      );
    });

    test('player can’t undo with multiple active players', async () => {
      const setActivePlayers = ActionCreators.gameEvent(
        'setActivePlayers',
        [{ all: 'A' }],
        '0'
      );
      await master.onUpdate(setActivePlayers, 2, 'matchID', '0');
      await master.onUpdate(ActionCreators.undo('0'), 3, 'matchID', '0');
      expect(error).toHaveBeenCalledWith(
        `playerID=[0] cannot undo / redo right now`
      );
    });

    test('player can undo if they are the only active player', async () => {
      const endStage = ActionCreators.gameEvent('endStage', undefined, '1');
      await master.onUpdate(endStage, 2, 'matchID', '1');
      await master.onUpdate(ActionCreators.undo('0'), 3, 'matchID', '1');
      // The master allows this, but the reducer does not.
      expect(error).toHaveBeenCalledWith(`Cannot undo other players' moves`);

      // Clean-up active players.
      const endStage2 = ActionCreators.gameEvent('endStage', undefined, '1');
      await master.onUpdate(endStage2, 4, 'matchID', '1');
    });
  });

  test('game over', async () => {
    let event = ActionCreators.gameEvent('endGame');
    await master.onUpdate(event, 3, 'matchID', '1');
    event = ActionCreators.gameEvent('endTurn');
    await master.onUpdate(event, 3, 'matchID', '1');
    expect(error).toHaveBeenCalledWith(
      `game over - matchID=[matchID] - playerID=[1] - action[endTurn]`
    );
  });
});

describe('connectionChange', () => {
  let sendAllReturn;

  const send = jest.fn();
  const sendAll = jest.fn((arg) => {
    sendAllReturn = arg;
  });

  const db = new InMemory();
  const master = new Master(game, db, TransportAPI(send, sendAll));

  const metadata = {
    gameName: 'tic-tac-toe',
    setupData: {},
    players: {
      '0': {
        id: 0,
        credentials: 'qS2m4Ujb_',
        name: 'Alice',
      },
      '1': {
        id: 1,
        credentials: 'nIQtXFybDD',
        name: 'Bob',
        isConnected: true,
      },
    },
    createdAt: 0,
    updatedAt: 0,
  };
  db.createMatch('matchID', { metadata, initialState: {} as State });

  beforeEach(() => {
    sendAllReturn = undefined;
    master.subscribe(({ state }) => {
      validateNotTransientState(state);
    });
    jest.clearAllMocks();
  });

  test('changes players metadata', async () => {
    await master.onConnectionChange('matchID', '0', undefined, true);

    const expectedPlayerData = { id: 0, name: 'Alice', isConnected: true };
    const {
      metadata: { players },
    } = db.fetch('matchID', { metadata: true });
    expect(players['0']).toMatchObject(expectedPlayerData);
  });

  test('sends metadata to all', async () => {
    await master.onConnectionChange('matchID', '1', undefined, false);
    const expectedMetadata = [
      { id: 0, name: 'Alice', isConnected: true },
      { id: 1, name: 'Bob', isConnected: false },
    ];
    const sentMessage = sendAllReturn('0');
    expect(sentMessage.type).toEqual('matchData');
    expect(sentMessage.args[1]).toMatchObject(expectedMetadata);
  });

  test('invalid matchID', async () => {
    const result = await master.onConnectionChange(
      'invalidMatchID',
      '0',
      undefined,
      true
    );
    expect(error).toHaveBeenCalledWith(
      'metadata not found for matchID=[invalidMatchID]'
    );
    expect(result && result.error).toEqual('metadata not found');
  });

  test('invalid playerID', async () => {
    const result = await master.onConnectionChange(
      'matchID',
      '3',
      undefined,
      true
    );
    expect(error).toHaveBeenCalledWith(
      'Player not in the match, matchID=[matchID] playerID=[3]'
    );
    expect(result && result.error).toEqual('player not in the match');
  });

  test('processes connection change with an async db', async () => {
    const asyncDb = new InMemoryAsync();
    const masterWithAsyncDb = new Master(
      game,
      asyncDb,
      TransportAPI(send, sendAll)
    );
    await asyncDb.createMatch('matchID', {
      metadata,
      initialState: {} as State,
    });

    await masterWithAsyncDb.onConnectionChange('matchID', '0', undefined, true);

    expect(sendAll).toHaveBeenCalled();
  });
});

describe('playerView', () => {
  let sendAllReturn;
  let sendReturn;

  const send = jest.fn((arg) => {
    sendReturn = arg;
  });
  const sendAll = jest.fn((arg) => {
    sendAllReturn = arg;
  });
  const game = {
    playerView: (G, ctx, player) => {
      return { ...G, player };
    },
  };
  const master = new Master(game, new InMemory(), TransportAPI(send, sendAll));

  beforeAll(async () => {
    await master.onSync('matchID', '0', undefined, 2);
  });

  beforeEach(() => {
    sendReturn = undefined;
    sendAllReturn = undefined;
    jest.clearAllMocks();
  });

  test('sync', async () => {
    await master.onSync('matchID', '0', undefined, 2);
    expect(sendReturn.args[1].state).toMatchObject({
      G: { player: '0' },
    });
  });

  test('update', async () => {
    const action = ActionCreators.gameEvent('endTurn');
    await master.onSync('matchID', '0', undefined, 2);
    await master.onUpdate(action, 0, 'matchID', '0');

    const G_player0 = sendAllReturn('0').args[1].G;
    const G_player1 = sendAllReturn('1').args[1].G;

    expect(G_player0.player).toBe('0');
    expect(G_player1.player).toBe('1');
  });
});

describe('subscribe', () => {
  const callback = jest.fn();

  let master;
  beforeAll(() => {
    master = new Master({}, new InMemory(), TransportAPI(jest.fn(), jest.fn()));
    master.subscribe(callback);
  });

  test('sync', async () => {
    master.onSync('matchID', '0');
    expect(callback).toBeCalledWith({
      matchID: 'matchID',
      state: expect.objectContaining({ _stateID: 0 }),
    });
  });

  test('update', async () => {
    const action = ActionCreators.gameEvent('endTurn');
    master.onUpdate(action, 0, 'matchID', '0');
    expect(callback).toBeCalledWith({
      matchID: 'matchID',
      action,
      state: expect.objectContaining({ _stateID: 1 }),
    });
  });
});

describe('authentication', () => {
  const send = jest.fn();
  const sendAll = jest.fn();
  const game = { seed: 0 };
  const matchID = 'matchID';
  let storage = new InMemoryAsync();

  const resetTestEnvironment = async () => {
    send.mockReset();
    sendAll.mockReset();
    storage = new InMemoryAsync();
    const master = new Master(game, storage, TransportAPI());
    await master.onSync(matchID, '0', undefined, 2);
  };

  describe('onUpdate', () => {
    const action = ActionCreators.gameEvent('endTurn');

    beforeEach(resetTestEnvironment);

    test('auth failure', async () => {
      const authenticateCredentials = () => false;
      const master = new Master(
        game,
        storage,
        TransportAPI(send, sendAll),
        new Auth({ authenticateCredentials })
      );
      const ret = await master.onUpdate(action, 0, matchID, '0');
      expect(ret && ret.error).toBe('unauthorized action');
      expect(sendAll).not.toHaveBeenCalled();
    });

    test('auth success', async () => {
      const authenticateCredentials = () => true;
      const master = new Master(
        game,
        storage,
        TransportAPI(send, sendAll),
        new Auth({ authenticateCredentials })
      );
      const ret = await master.onUpdate(action, 0, matchID, '0');
      expect(ret).toBeUndefined();
      expect(sendAll).toHaveBeenCalled();
    });

    test('default', async () => {
      const master = new Master(
        game,
        storage,
        TransportAPI(send, sendAll),
        new Auth()
      );
      const ret = await master.onUpdate(action, 0, matchID, '0');
      expect(ret).toBeUndefined();
      expect(sendAll).toHaveBeenCalled();
    });
  });

  describe('onSync', () => {
    beforeEach(resetTestEnvironment);

    test('auth failure', async () => {
      const authenticateCredentials = () => false;
      const master = new Master(
        game,
        storage,
        TransportAPI(send, sendAll),
        new Auth({ authenticateCredentials })
      );
      const ret = await master.onSync(matchID, '0');
      expect(ret && ret.error).toBe('unauthorized');
      expect(send).not.toHaveBeenCalled();
    });

    test('auth success', async () => {
      const authenticateCredentials = () => true;
      const master = new Master(
        game,
        storage,
        TransportAPI(send, sendAll),
        new Auth({ authenticateCredentials })
      );
      const ret = await master.onSync(matchID, '0');
      expect(ret).toBeUndefined();
      expect(send).toHaveBeenCalled();
    });

    test('spectators don’t need to authenticate', async () => {
      const authenticateCredentials = () => false;
      const master = new Master(
        game,
        storage,
        TransportAPI(send, sendAll),
        new Auth({ authenticateCredentials })
      );
      const ret = await master.onSync(matchID, null);
      expect(ret).toBeUndefined();
      expect(send).toHaveBeenCalled();
    });
  });

  describe('onConnectionChange', () => {
    beforeEach(resetTestEnvironment);

    test('auth failure', async () => {
      const authenticateCredentials = () => false;
      const master = new Master(
        game,
        storage,
        TransportAPI(send, sendAll),
        new Auth({ authenticateCredentials })
      );
      const ret = await master.onConnectionChange(matchID, '0', null, true);
      expect(ret && ret.error).toBe('unauthorized');
      expect(sendAll).not.toHaveBeenCalled();
    });

    test('auth success', async () => {
      const authenticateCredentials = () => true;
      const master = new Master(
        game,
        storage,
        TransportAPI(send, sendAll),
        new Auth({ authenticateCredentials })
      );
      const ret = await master.onConnectionChange(matchID, '0', null, true);
      expect(ret).toBeUndefined();
      expect(sendAll).toHaveBeenCalled();
    });

    test('spectators are ignored', async () => {
      const authenticateCredentials = jest.fn();
      const master = new Master(
        game,
        storage,
        TransportAPI(send, sendAll),
        new Auth({ authenticateCredentials })
      );
      const ret = await master.onConnectionChange(matchID, null, null, true);
      expect(ret).toBeUndefined();
      expect(authenticateCredentials).not.toHaveBeenCalled();
      expect(sendAll).not.toHaveBeenCalled();
    });
  });

  describe('onChatMessage', () => {
    const chatMessage = {
      id: 'uuid',
      payload: { message: 'foo' },
      sender: '0',
    };

    beforeEach(resetTestEnvironment);

    test('auth failure', async () => {
      const authenticateCredentials = () => false;
      const master = new Master(
        game,
        storage,
        TransportAPI(send, sendAll),
        new Auth({ authenticateCredentials })
      );
      const ret = await master.onChatMessage(matchID, chatMessage, undefined);
      expect(ret && ret.error).toBe('unauthorized');
      expect(sendAll).not.toHaveBeenCalled();
    });

    test('auth success', async () => {
      const authenticateCredentials = () => true;
      const master = new Master(
        game,
        storage,
        TransportAPI(send, sendAll),
        new Auth({ authenticateCredentials })
      );
      const ret = await master.onChatMessage(matchID, chatMessage, undefined);
      expect(ret).toBeUndefined();
      expect(sendAll).toHaveBeenCalled();
    });

    test('default', async () => {
      const master = new Master(
        game,
        storage,
        TransportAPI(send, sendAll),
        new Auth()
      );
      const ret = await master.onChatMessage(matchID, chatMessage, undefined);
      expect(ret).toBeUndefined();
      expect(sendAll).toHaveBeenCalled();
    });
  });
});

describe('redactLog', () => {
  test('no-op with undefined log', () => {
    const result = redactLog(undefined, '0');
    expect(result).toBeUndefined();
  });

  test('no redactedMoves', () => {
    const logEvents = [
      {
        _stateID: 0,
        turn: 0,
        phase: '',
        action: ActionCreators.gameEvent('endTurn'),
      },
    ];
    const result = redactLog(logEvents, '0');
    expect(result).toMatchObject(logEvents);
  });

  test('redacted move is only shown with args to the player that made the move', () => {
    const logEvents = [
      {
        _stateID: 0,
        turn: 0,
        phase: '',
        action: ActionCreators.makeMove('clickCell', [1, 2, 3], '0'),
        redact: true,
      },
    ];

    // player that made the move
    let result = redactLog(logEvents, '0');
    expect(result).toMatchObject(logEvents);

    // other player
    result = redactLog(logEvents, '1');
    expect(result).toMatchObject([
      {
        _stateID: 0,
        turn: 0,
        phase: '',
        action: {
          type: 'MAKE_MOVE',
          payload: {
            credentials: undefined,
            playerID: '0',
            type: 'clickCell',
          },
        },
      },
    ]);
  });

  test('not redacted move is shown to all', () => {
    const logEvents = [
      {
        _stateID: 0,
        turn: 0,
        phase: '',
        action: ActionCreators.makeMove('unclickCell', [1, 2, 3], '0'),
      },
    ];

    // player that made the move
    let result = redactLog(logEvents, '0');
    expect(result).toMatchObject(logEvents);
    // other player
    result = redactLog(logEvents, '1');
    expect(result).toMatchObject(logEvents);
  });

  test('can explicitly set showing args to true', () => {
    const logEvents = [
      {
        _stateID: 0,
        turn: 0,
        phase: '',
        action: ActionCreators.makeMove('unclickCell', [1, 2, 3], '0'),
      },
    ];

    // player that made the move
    let result = redactLog(logEvents, '0');
    expect(result).toMatchObject(logEvents);
    // other player
    result = redactLog(logEvents, '1');
    expect(result).toMatchObject(logEvents);
  });

  test('events are not redacted', () => {
    const logEvents = [
      {
        _stateID: 0,
        turn: 0,
        phase: '',
        action: ActionCreators.gameEvent('endTurn'),
      },
    ];

    // player that made the move
    let result = redactLog(logEvents, '0');
    expect(result).toMatchObject(logEvents);
    // other player
    result = redactLog(logEvents, '1');
    expect(result).toMatchObject(logEvents);
  });

  test('make sure sync redacts the log', async () => {
    const game = {
      moves: {
        A: (G) => G,
        B: {
          move: (G) => G,
          redact: true,
        },
      },
    };

    const send = jest.fn();
    const master = new Master(game, new InMemory(), TransportAPI(send));

    const actionA = ActionCreators.makeMove('A', ['not redacted'], '0');
    const actionB = ActionCreators.makeMove('B', ['redacted'], '0');

    // test: ping-pong two moves, then sync and check the log
    await master.onSync('matchID', '0', undefined, 2);
    await master.onUpdate(actionA, 0, 'matchID', '0');
    await master.onUpdate(actionB, 1, 'matchID', '0');
    await master.onSync('matchID', '1', undefined, 2);

    const { log } = send.mock.calls[send.mock.calls.length - 1][0].args[1];
    expect(log).toMatchObject([
      {
        action: {
          type: 'MAKE_MOVE',
          payload: {
            type: 'A',
            args: ['not redacted'],
            playerID: '0',
          },
        },
        _stateID: 0,
      },
      {
        action: {
          type: 'MAKE_MOVE',
          payload: {
            type: 'B',
            args: null,
            playerID: '0',
          },
        },
        _stateID: 1,
      },
    ]);
  });
});

describe('chat', () => {
  let sendAllReturn;
  const send = jest.fn();
  const sendAll = jest.fn((arg) => {
    sendAllReturn = arg;
  });
  const db = new InMemory();
  const master = new Master(game, db, TransportAPI(send, sendAll));

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Sends chat messages to all', async () => {
    master.onChatMessage(
      'matchID',
      { id: 'uuid', sender: '0', payload: { message: 'foo' } },
      undefined
    );
    expect(sendAllReturn('0')).toEqual({
      type: 'chat',
      args: [
        'matchID',
        { id: 'uuid', sender: '0', payload: { message: 'foo' } },
      ],
    });
  });
});
