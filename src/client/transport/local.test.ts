/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { LocalTransport, LocalMaster, Local, GetBotPlayer } from './local';
import { gameEvent } from '../../core/action-creators';
import { ProcessGameConfig } from '../../core/game';
import { Client } from '../client';
import { RandomBot } from '../../ai/random-bot';
import { Stage } from '../../core/turn-order';
import type { Game, State } from '../../types';

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
      {
        ctx: {
          activePlayers: {
            '1': Stage.NULL,
          },
        },
      } as unknown as State,
      {
        '0': {},
        '1': {},
      }
    );
    expect(result).toEqual('1');
  });

  test('no stages', () => {
    const result = GetBotPlayer(
      {
        ctx: {
          currentPlayer: '0',
        },
      } as unknown as State,
      { '0': {} }
    );
    expect(result).toEqual('0');
  });

  test('null', () => {
    const result = GetBotPlayer(
      {
        ctx: {
          currentPlayer: '1',
        },
      } as unknown as State,
      { '0': {} }
    );
    expect(result).toEqual(null);
  });

  test('gameover', () => {
    const result = GetBotPlayer(
      {
        ctx: {
          currentPlayer: '0',
          gameover: true,
        },
      } as unknown as State,
      { '0': {} }
    );
    expect(result).toEqual(null);
  });
});

describe('Local', () => {
  test('transports for same game use shared master', () => {
    const gameKey = {};
    const game = ProcessGameConfig(gameKey);
    const transport1 = Local()({
      game,
      gameKey,
      transportDataCallback: () => {},
    });
    const transport2 = Local()({
      game,
      gameKey,
      transportDataCallback: () => {},
    });
    expect(transport1.master).toBe(transport2.master);
  });

  test('transports use shared master with bots', () => {
    const gameKey = {};
    const game = ProcessGameConfig(gameKey);
    const bots = {};
    const transport1 = Local({ bots })({
      game,
      gameKey,
      transportDataCallback: () => {},
    });
    const transport2 = Local({ bots })({
      game,
      gameKey,
      transportDataCallback: () => {},
    });
    expect(transport1.master).toBe(transport2.master);
  });

  test('transports use different master for different bots', () => {
    const gameKey = {};
    const game = ProcessGameConfig(gameKey);
    const transport1 = Local({ bots: {} })({
      game,
      gameKey,
      transportDataCallback: () => {},
    });
    const transport2 = Local({ bots: {} })({
      game,
      gameKey,
      transportDataCallback: () => {},
    });
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
  let master: LocalMaster;
  let player0Callback: jest.Mock;
  let player1Callback: jest.Mock;

  beforeEach(() => {
    master = new LocalMaster({ game: {} });
    player0Callback = jest.fn();
    player1Callback = jest.fn();
    master.connect('0', player0Callback);
    master.connect('1', player1Callback);
    master.onSync('matchID', '0');
    master.onSync('matchID', '1');
  });

  test('sync', () => {
    expect(player0Callback).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'sync' })
    );
    expect(player1Callback).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'sync' })
    );
  });

  test('update', () => {
    master.onUpdate(gameEvent('endTurn'), 0, 'matchID', '0');
    expect(player0Callback).toBeCalledWith(
      expect.objectContaining({ type: 'update' })
    );
    expect(player1Callback).toBeCalledWith(
      expect.objectContaining({ type: 'update' })
    );
  });

  test('connect without callback', () => {
    expect(() => {
      master.connect('0', undefined);
      master.onSync('matchID', '0');
    }).not.toThrow();
  });
});

describe('LocalTransport', () => {
  describe('update matchID / playerID', () => {
    const master = {
      connect: jest.fn(),
      onSync: jest.fn(),
    } as unknown as LocalMaster;
    class WrappedLocalTransport extends LocalTransport {
      getMatchID() {
        return this.matchID;
      }
      getPlayerID() {
        return this.playerID;
      }
    }
    const transport = new WrappedLocalTransport({
      master,
      transportDataCallback: () => {},
      game: ProcessGameConfig({}),
      gameKey: {},
    });
    jest.spyOn(transport, 'requestSync');

    beforeEach(() => {
      jest.resetAllMocks();
    });

    test('matchID', () => {
      transport.updateMatchID('test');
      expect(transport.getMatchID()).toBe('test');
      expect(transport.requestSync).toBeCalled();
    });

    test('playerID', () => {
      transport.updatePlayerID('player');
      expect(transport.getPlayerID()).toBe('player');
      expect(master.connect).toBeCalled();
    });
  });

  describe('multiplayer', () => {
    const game: Game = {
      setup: () => ({ initial: true }),
      moves: {
        A: () => ({ A: true }),
      },
    };
    const multiplayer = Local();
    const matchID = 'local-multiplayer';
    const client1 = Client({ game, multiplayer, matchID, playerID: '0' });
    const client2 = Client({ game, multiplayer, matchID, playerID: '1' });

    beforeAll(() => {
      client1.start();
      client2.start();
    });

    afterAll(() => {
      client1.stop();
      client2.stop();
    });

    test('send/receive update', () => {
      expect(client1.getState().G).toStrictEqual({ initial: true });
      expect(client2.getState().G).toStrictEqual({ initial: true });
      client1.moves.A();
      expect(client1.getState().G).toStrictEqual({ A: true });
      expect(client2.getState().G).toStrictEqual({ A: true });
    });

    test('receive sync', () => {
      const newClient = Client({ game, multiplayer, matchID });
      newClient.start();
      expect(newClient.getState().G).toStrictEqual({ A: true });
      newClient.stop();
    });

    test('send chat-message', () => {
      const payload = { message: 'foo' };
      client1.sendChatMessage(payload);
      expect(client2.chatMessages).toStrictEqual([
        { id: expect.any(String), sender: '0', payload },
      ]);
    });
  });
});
