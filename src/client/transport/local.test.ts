/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { createStore } from 'redux';
import { LocalTransport, LocalMaster, Local, GetBotPlayer } from './local';
import { makeMove, gameEvent } from '../../core/action-creators';
import { CreateGameReducer } from '../../core/reducer';
import { ProcessGameConfig } from '../../core/game';
import { InitializeGame } from '../../core/initialize';
import { Client } from '../client';
import { RandomBot } from '../../ai/random-bot';
import { Stage } from '../../core/turn-order';
import type { ChatMessage, Game, State, Store, SyncInfo } from '../../types';

const sleep = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

describe('bots', () => {
  const game: Game = {
    moves: {
      A: (_, ctx) => {
        ctx.events.endTurn();
      },
    },
    ai: {
      enumerate: () => [{ move: 'A' }],
    },
  };

  test('make bot move', async () => {
    const client = Client({
      game: { ...game },
      playerID: '0',
      multiplayer: Local({ bots: { '1': RandomBot } }),
    });

    client.start();
    expect(client.getState().ctx.turn).toBe(1);

    // Make it Player 1's turn and trigger the bot move.
    client.events.endTurn();
    expect(client.getState().ctx.turn).toBe(2);

    // Wait until the bot has hopefully completed its move.
    await sleep();
    expect(client.getState().ctx.turn).toBe(3);
  });

  test('no bot move', async () => {
    const client = Client({
      numPlayers: 3,
      game: { ...game },
      playerID: '0',
      multiplayer: Local({ bots: { '2': RandomBot } }),
    });

    client.start();
    expect(client.getState().ctx.turn).toBe(1);

    // Make it Player 1's turn. No bot move.
    client.events.endTurn();
    expect(client.getState().ctx.currentPlayer).toBe('1');

    // Wait until the bot has hopefully completed its move.
    await sleep();
    expect(client.getState().ctx.currentPlayer).toBe('1');
    expect(client.getState().ctx.numMoves).toBe(0);
  });
});

describe('GetBotPlayer', () => {
  test('stages', () => {
    const result = GetBotPlayer(
      ({
        ctx: {
          activePlayers: {
            '1': Stage.NULL,
          },
        },
      } as unknown) as State,
      {
        '0': {},
        '1': {},
      }
    );
    expect(result).toEqual('1');
  });

  test('no stages', () => {
    const result = GetBotPlayer(
      ({
        ctx: {
          currentPlayer: '0',
        },
      } as unknown) as State,
      { '0': {} }
    );
    expect(result).toEqual('0');
  });

  test('null', () => {
    const result = GetBotPlayer(
      ({
        ctx: {
          currentPlayer: '1',
        },
      } as unknown) as State,
      { '0': {} }
    );
    expect(result).toEqual(null);
  });

  test('gameover', () => {
    const result = GetBotPlayer(
      ({
        ctx: {
          currentPlayer: '0',
          gameover: true,
        },
      } as unknown) as State,
      { '0': {} }
    );
    expect(result).toEqual(null);
  });
});

describe('Local', () => {
  test('transports for same game use shared master', () => {
    const gameKey = {};
    const game = ProcessGameConfig(gameKey);
    const transport1 = Local()({ game, gameKey });
    const transport2 = Local()({ game, gameKey });
    expect(transport1.master).toBe(transport2.master);
  });

  test('transports use shared master with bots', () => {
    const gameKey = {};
    const game = ProcessGameConfig(gameKey);
    const bots = {};
    const transport1 = Local({ bots })({ game, gameKey });
    const transport2 = Local({ bots })({ game, gameKey });
    expect(transport1.master).toBe(transport2.master);
  });

  test('transports use different master for different bots', () => {
    const gameKey = {};
    const game = ProcessGameConfig(gameKey);
    const transport1 = Local({ bots: {} })({ game, gameKey });
    const transport2 = Local({ bots: {} })({ game, gameKey });
    expect(transport1.master).not.toBe(transport2.master);
  });

  describe('with localStorage persistence', () => {
    const game = {
      setup: () => ({ count: 0 }),
      moves: {
        A: (G: any) => {
          G.count++;
        },
      },
    };

    afterEach(() => {
      localStorage.clear();
    });

    test('writes to localStorage', () => {
      const matchID = 'persists-to-ls';
      const multiplayer = Local({ persist: true });
      const client = Client({ playerID: '0', matchID, game, multiplayer });
      client.start();
      expect(client.getState().G).toEqual({ count: 0 });
      client.moves.A();
      expect(client.getState().G).toEqual({ count: 1 });
      client.stop();
      const stored = JSON.parse(localStorage.getItem('bgio_state'));
      const [id, state] = stored.find(([id]) => id === matchID);
      expect(id).toBe(matchID);
      expect(state.G).toEqual({ count: 1 });
    });

    test('reads from localStorage', () => {
      const matchID = 'reads-from-ls';
      const storageKey = 'rfls';
      const stateMap = {
        [matchID]: {
          G: { count: 'foo' },
          ctx: {},
        },
      };
      const entriesString = JSON.stringify(Object.entries(stateMap));
      localStorage.setItem(`${storageKey}_state`, entriesString);
      const multiplayer = Local({ persist: true, storageKey });
      const client = Client({ playerID: '0', matchID, game, multiplayer });
      client.start();
      expect(client.getState().G).toEqual({ count: 'foo' });
      client.stop();
    });
  });
});

describe('LocalMaster', () => {
  const game = {};
  const master = new LocalMaster({ game });

  const storeA = ({
    dispatch: jest.fn(),
    getState: () => ({ _stateID: 0 }),
  } as unknown) as Store;
  const storeB = ({
    dispatch: jest.fn(),
    getState: () => ({ _stateID: 0 }),
  } as unknown) as Store;

  const localA = new LocalTransport({ master, store: storeA, playerID: '0' });
  const localB = new LocalTransport({ master, store: storeB, playerID: '1' });

  beforeEach(() => {
    storeA.dispatch = jest.fn();
    storeB.dispatch = jest.fn();
  });

  test('connect', () => {
    localA.connect();
    localB.connect();
    localA.subscribe();

    expect(storeA.dispatch).toBeCalledWith(
      expect.objectContaining({
        type: 'SYNC',
      })
    );
    expect(storeB.dispatch).toBeCalledWith(
      expect.objectContaining({
        type: 'SYNC',
      })
    );
  });

  test('update', () => {
    localA.onAction(
      ({ _stateID: 0 } as unknown) as State,
      gameEvent('endTurn')
    );

    expect(storeA.dispatch).toBeCalledWith(
      expect.objectContaining({
        type: 'UPDATE',
      })
    );
    expect(storeB.dispatch).toBeCalledWith(
      expect.objectContaining({
        type: 'UPDATE',
      })
    );
  });

  test('connect without callback', () => {
    expect(() => {
      master.connect('matchID', '0', undefined);
      master.onSync('matchID', '0');
    }).not.toThrow();
  });

  test('disconnect', () => {
    expect(() => {
      localA.disconnect();
      localB.disconnect();
    }).not.toThrow();
  });
});

describe('LocalTransport', () => {
  describe('update matchID / playerID', () => {
    const master = ({
      connect: jest.fn(),
      onSync: jest.fn(),
    } as unknown) as LocalMaster;
    const store = ({ dispatch: () => {} } as unknown) as Store;
    class WrappedLocalTransport extends LocalTransport {
      getMatchID() {
        return this.matchID;
      }
      getPlayerID() {
        return this.playerID;
      }
    }
    const m = new WrappedLocalTransport({ master, store });

    beforeEach(() => {
      jest.resetAllMocks();
    });

    test('matchID', () => {
      m.updateMatchID('test');
      expect(m.getMatchID()).toBe('test');
      expect(master.connect).toBeCalled();
    });

    test('playerID', () => {
      m.updatePlayerID('player');
      expect(m.getPlayerID()).toBe('player');
      expect(master.connect).toBeCalled();
    });
  });

  describe('multiplayer', () => {
    const master = ({
      onSync: jest.fn(),
      onUpdate: jest.fn(),
      onChatMessage: jest.fn(),
    } as unknown) as LocalMaster;
    class WrappedLocalTransport extends LocalTransport {
      setStore(store: Store) {
        this.store = store;
      }
    }
    const m = new WrappedLocalTransport({ master });
    const game = {};
    let store: Store | null = null;

    beforeEach(() => {
      const reducer = CreateGameReducer({ game });
      const initialState = InitializeGame({ game });
      store = createStore(reducer, initialState);
      m.setStore(store);
    });

    test('returns a valid store', () => {
      expect(store).not.toBe(undefined);
    });

    test('receive update', () => {
      const restored = ({ restore: true } as unknown) as State;
      expect(store.getState()).not.toMatchObject(restored);
      m.onUpdate('unknown matchID', restored, []);
      expect(store.getState()).not.toMatchObject(restored);
      m.onUpdate('default', restored, []);
      expect(store.getState()).not.toMatchObject(restored);

      // Only if the stateID is not stale.
      restored._stateID = 1;
      m.onUpdate('default', restored, []);
      expect(store.getState()).toMatchObject(restored);
    });

    test('receive sync', () => {
      const restored = ({ restore: true } as unknown) as State;
      expect(store.getState()).not.toMatchObject(restored);
      m.onSync('unknown matchID', { state: restored } as SyncInfo);
      expect(store.getState()).not.toMatchObject(restored);
      m.onSync('default', { state: restored } as SyncInfo);
      expect(store.getState()).toMatchObject(restored);
    });

    test('send update', () => {
      const action = makeMove('move');
      const state = ({ _stateID: 0 } as unknown) as State;
      m.onAction(state, action);
      expect(m.master.onUpdate).lastCalledWith(
        action,
        state._stateID,
        'default',
        null
      );
    });

    test('send chat-message', () => {
      const msg: ChatMessage = {
        id: '0',
        sender: '0',
        payload: { message: 'foo' },
      };
      m.onChatMessage('matchID', msg);
      expect(m.master.onChatMessage).lastCalledWith('matchID', msg, undefined);
    });
  });
});
