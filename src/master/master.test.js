/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import * as ActionCreators from '../core/action-creators';
import { InMemory } from '../server/db/inmemory';
import {
  Master,
  redactLog,
  getPlayerMetadata,
  doesGameRequireAuthentication,
  isActionFromAuthenticPlayer,
} from './master';
import { error } from '../core/logger';

jest.mock('../core/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
}));

const game = { seed: 0 };

function TransportAPI(send = jest.fn(), sendAll = jest.fn()) {
  return { send, sendAll };
}

describe('sync', () => {
  const send = jest.fn();
  const master = new Master(game, new InMemory(), TransportAPI(send));

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('causes server to respond', async () => {
    await master.onSync('gameID', '0', 2);
    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'sync',
      })
    );
  });

  test('sync a second time does not create a game', async () => {
    await master.onSync('gameID', '0', 2);
    expect(send).toHaveBeenCalled();
  });

  test('should not have metadata', async () => {
    await master.onSync('gameID', '0', 2);
    // [0][0] = first call, first argument
    expect(send.mock.calls[0][0].args[3]).toBeUndefined();
  });

  test('should have metadata', async () => {
    const db = new InMemory();
    const dbMetadata = {
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
    };
    db.set('gameID:metadata', dbMetadata);
    const masterWithMetadata = new Master(game, db, TransportAPI(send));
    await masterWithMetadata.onSync('gameID', '0', 2);

    const expectedMetadata = [{ id: 0, name: 'Alice' }, { id: 1, name: 'Bob' }];
    expect(send.mock.calls[0][0].args[3]).toMatchObject(expectedMetadata);
  });
});

describe('update', () => {
  let sendAllReturn;

  const send = jest.fn();
  const sendAll = jest.fn(arg => {
    sendAllReturn = arg;
  });
  const db = new InMemory();
  const master = new Master(game, db, TransportAPI(send, sendAll));
  const action = ActionCreators.gameEvent('endTurn');

  beforeAll(async () => {
    await master.onSync('gameID', '0');
  });

  beforeEach(() => {
    sendAllReturn = undefined;
    jest.clearAllMocks();
  });

  test('basic', async () => {
    await master.onUpdate(action, 0, 'gameID', '0');
    expect(sendAll).toBeCalled();
    expect(sendAllReturn).not.toBeUndefined();

    let value = sendAllReturn('0');
    expect(value.type).toBe('update');
    expect(value.args[0]).toBe('gameID');
    expect(value.args[1]).toMatchObject({
      G: {},
      deltalog: undefined,
      log: undefined,
      _initial: {
        G: {},
        _initial: {},
        _redo: [],
        _stateID: 0,
        _undo: [],
        ctx: {
          _random: { seed: 0 },
          currentPlayer: '0',
          numPlayers: 2,
          phase: null,
          playOrder: ['0', '1'],
          playOrderPos: 0,
          turn: 1,
        },
      },
      _redo: [],
      _stateID: 1,
      _undo: [],
      ctx: {
        _random: undefined,
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

  test('invalid gameID', async () => {
    await master.onUpdate(action, 1, 'default:unknown', '1');
    expect(sendAll).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledWith(
      `game not found, gameID=[default:unknown]`
    );
  });

  test('invalid stateID', async () => {
    await master.onUpdate(action, 100, 'gameID', '1');
    expect(sendAll).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledWith(
      `invalid stateID, was=[100], expected=[1]`
    );
  });

  test('invalid playerID', async () => {
    await master.onUpdate(action, 1, 'gameID', '100');
    await master.onUpdate(ActionCreators.makeMove(), 1, 'gameID', '100');
    expect(sendAll).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledWith(`player not active - playerID=[100]`);
  });

  test('invalid move', async () => {
    await master.onUpdate(ActionCreators.makeMove('move'), 1, 'gameID', '1');
    expect(sendAll).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledWith(
      `move not processed - canPlayerMakeMove=false, playerID=[1]`
    );
  });

  test('valid gameID / stateID / playerID', async () => {
    await master.onUpdate(action, 1, 'gameID', '1');
    expect(sendAll).toHaveBeenCalled();
  });

  test('undo / redo', async () => {
    await master.onUpdate(ActionCreators.undo(), 2, 'gameID', '0');
    expect(error).not.toBeCalled();

    await master.onUpdate(ActionCreators.undo(), 2, 'gameID', '1');
    expect(error).toHaveBeenCalledWith(
      `playerID=[1] cannot undo / redo right now`
    );
  });

  test('game over', async () => {
    let event = ActionCreators.gameEvent('endGame');
    await master.onUpdate(event, 2, 'gameID', '0');
    event = ActionCreators.gameEvent('endTurn');
    await master.onUpdate(event, 3, 'gameID', '0');
    expect(error).toHaveBeenCalledWith(`game over - gameID=[gameID]`);
  });
});

describe('playerView', () => {
  let sendAllReturn;
  let sendReturn;

  const send = jest.fn(arg => {
    sendReturn = arg;
  });
  const sendAll = jest.fn(arg => {
    sendAllReturn = arg;
  });
  const game = {
    playerView: (G, ctx, player) => {
      return { ...G, player };
    },
  };
  const master = new Master(game, new InMemory(), TransportAPI(send, sendAll));

  beforeAll(async () => {
    await master.onSync('gameID', '0');
  });

  beforeEach(() => {
    sendReturn = undefined;
    sendAllReturn = undefined;
    jest.clearAllMocks();
  });

  test('sync', async () => {
    await master.onSync('gameID', '0');
    expect(sendReturn.args[1]).toMatchObject({
      G: { player: '0' },
    });
  });

  test('update', async () => {
    const action = ActionCreators.gameEvent('endTurn');
    await master.onSync('gameID', '0');
    await master.onUpdate(action, 0, 'gameID', '0');

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
    master.executeSynchronously = true;
    master.subscribe(callback);
  });

  test('sync', async () => {
    master.onSync('gameID', '0');
    expect(callback).toBeCalledWith({
      gameID: 'gameID',
      state: expect.objectContaining({ _stateID: 0 }),
    });
  });

  test('update', async () => {
    const action = ActionCreators.gameEvent('endTurn');
    master.onUpdate(action, 0, 'gameID', '0');
    expect(callback).toBeCalledWith({
      gameID: 'gameID',
      action,
      state: expect.objectContaining({ _stateID: 1 }),
    });
  });
});

describe('authentication', () => {
  describe('async', () => {
    const send = jest.fn();
    const sendAll = jest.fn();
    const game = { seed: 0 };
    const gameID = 'gameID';
    const action = ActionCreators.gameEvent('endTurn');
    const storage = new InMemory();

    beforeAll(async () => {
      const master = new Master(game, storage, TransportAPI());
      await master.onSync(gameID, '0');
    });

    test('auth failure', async () => {
      const isActionFromAuthenticPlayer = () => false;
      const master = new Master(
        game,
        storage,
        TransportAPI(send, sendAll),
        isActionFromAuthenticPlayer
      );
      await master.onUpdate(action, 0, gameID, '0');
      expect(sendAll).not.toHaveBeenCalled();
    });

    test('auth success', async () => {
      const isActionFromAuthenticPlayer = () => true;
      const master = new Master(
        game,
        storage,
        TransportAPI(send, sendAll),
        isActionFromAuthenticPlayer
      );
      await master.onUpdate(action, 0, gameID, '0');
      expect(sendAll).toHaveBeenCalled();
    });

    test('default', async () => {
      const master = new Master(
        game,
        storage,
        TransportAPI(send, sendAll),
        true
      );
      await master.onUpdate(action, 0, gameID, '0');
      expect(sendAll).toHaveBeenCalled();
    });
  });

  describe('sync', () => {
    const send = jest.fn();
    const sendAll = jest.fn();
    const game = { seed: 0 };
    const gameID = 'gameID';
    const action = ActionCreators.gameEvent('endTurn');
    const storage = new InMemory();

    beforeAll(() => {
      const master = new Master(game, storage, TransportAPI());
      master.executeSynchronously = true;
      master.onSync(gameID, '0');
    });

    test('auth failure', () => {
      const isActionFromAuthenticPlayer = () => false;
      const master = new Master(
        game,
        storage,
        TransportAPI(send, sendAll),
        isActionFromAuthenticPlayer
      );
      master.executeSynchronously = true;
      master.onUpdate(action, 0, gameID, '0');
      expect(sendAll).not.toHaveBeenCalled();
    });

    test('auth success', () => {
      const isActionFromAuthenticPlayer = () => true;
      const master = new Master(
        game,
        storage,
        TransportAPI(send, sendAll),
        isActionFromAuthenticPlayer
      );
      master.executeSynchronously = true;
      master.onUpdate(action, 0, gameID, '0');
      expect(sendAll).toHaveBeenCalled();
    });

    test('default', () => {
      const master = new Master(
        game,
        storage,
        TransportAPI(send, sendAll),
        true
      );
      master.executeSynchronously = true;
      master.onUpdate(action, 0, gameID, '0');
      expect(sendAll).toHaveBeenCalled();
    });
  });
});

describe('redactLog', () => {
  test('no redactedMoves', () => {
    const logEvents = [{ action: ActionCreators.gameEvent('endTurn') }];
    const result = redactLog(logEvents, '0');
    expect(result).toMatchObject(logEvents);
  });

  test('redacted move is only shown with args to the player that made the move', () => {
    const logEvents = [
      {
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
      { action: ActionCreators.makeMove('unclickCell', [1, 2, 3], '0') },
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
      { action: ActionCreators.makeMove('unclickCell', [1, 2, 3], '0') },
    ];

    // player that made the move
    let result = redactLog(logEvents, '0');
    expect(result).toMatchObject(logEvents);
    // other player
    result = redactLog(logEvents, '1');
    expect(result).toMatchObject(logEvents);
  });

  test('events are not redacted', () => {
    const logEvents = [{ action: ActionCreators.gameEvent('endTurn') }];

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
        A: G => G,
        B: {
          move: G => G,
          redact: true,
        },
      },
    };

    const send = jest.fn();
    const master = new Master(game, new InMemory(), TransportAPI(send));

    const actionA = ActionCreators.makeMove('A', ['not redacted'], '0');
    const actionB = ActionCreators.makeMove('B', ['redacted'], '0');

    // test: ping-pong two moves, then sync and check the log
    await master.onSync('gameID', '0', 2);
    await master.onUpdate(actionA, 0, 'gameID', '0');
    await master.onUpdate(actionB, 1, 'gameID', '0');
    await master.onSync('gameID', '1', 2);

    const log = send.mock.calls[send.mock.calls.length - 1][0].args[2];
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

describe('getPlayerMetadata', () => {
  describe('when metadata is not found', () => {
    test('then playerMetadata is undefined', () => {
      expect(getPlayerMetadata(undefined, '0')).toBeUndefined();
    });
  });

  describe('when metadata does not contain players field', () => {
    test('then playerMetadata is undefined', () => {
      expect(getPlayerMetadata({}, '0')).toBeUndefined();
    });
  });

  describe('when metadata does not contain playerID', () => {
    test('then playerMetadata is undefined', () => {
      expect(getPlayerMetadata({ players: { '1': {} } }, '0')).toBeUndefined();
    });
  });

  describe('when metadata contains playerID', () => {
    test('then playerMetadata is returned', () => {
      const playerMetadata = { credentials: 'SECRET' };
      const result = getPlayerMetadata(
        { players: { '0': playerMetadata } },
        '0'
      );
      expect(result).toBe(playerMetadata);
    });
  });
});

describe('doesGameRequireAuthentication', () => {
  describe('when game metadata is not found', () => {
    test('then authentication is not required', () => {
      const result = doesGameRequireAuthentication();
      expect(result).toBe(false);
    });
  });

  describe('when game has no credentials', () => {
    test('then authentication is not required', () => {
      const gameMetadata = {
        players: {
          '0': {},
        },
      };
      const result = doesGameRequireAuthentication(gameMetadata);
      expect(result).toBe(false);
    });
  });

  describe('when game has credentials', () => {
    test('then authentication is required', () => {
      const gameMetadata = {
        players: {
          '0': {
            credentials: 'SECRET',
          },
        },
      };
      const result = doesGameRequireAuthentication(gameMetadata);
      expect(result).toBe(true);
    });
  });
});

describe('isActionFromAuthenticPlayer', () => {
  let action;
  let playerID;
  let gameMetadata;
  let credentials;
  let playerMetadata;

  beforeEach(() => {
    playerID = '0';

    action = {
      payload: { credentials: 'SECRET' },
    };

    gameMetadata = {
      players: {
        '0': { credentials: 'SECRET' },
      },
    };

    playerMetadata = gameMetadata.players[playerID];
    ({ credentials } = action.payload || {});
  });

  describe('when game has credentials', () => {
    describe('when action contains no payload', () => {
      beforeEach(() => {
        action = {};
        ({ credentials } = action.payload || {});
      });

      test('the action is not authentic', async () => {
        const result = isActionFromAuthenticPlayer(credentials, playerMetadata);
        expect(result).toBe(false);
      });
    });

    describe('when action contains no credentials', () => {
      beforeEach(() => {
        action = {
          payload: { someStuff: 'foo' },
        };
        ({ credentials } = action.payload || {});
      });

      test('then action is not authentic', async () => {
        const result = isActionFromAuthenticPlayer(credentials, playerMetadata);
        expect(result).toBe(false);
      });
    });

    describe('when action credentials do not match game credentials', () => {
      beforeEach(() => {
        action = {
          payload: { credentials: 'WRONG' },
        };
        ({ credentials } = action.payload || {});
      });
      test('then action is not authentic', async () => {
        const result = isActionFromAuthenticPlayer(credentials, playerMetadata);
        expect(result).toBe(false);
      });
    });

    describe('when playerMetadata is not found', () => {
      test('then action is not authentic', () => {
        const result = isActionFromAuthenticPlayer(credentials);
        expect(result).toBe(false);
      });
    });

    describe('when action credentials do match game credentials', () => {
      test('then action is authentic', async () => {
        const result = isActionFromAuthenticPlayer(credentials, playerMetadata);
        expect(result).toBe(true);
      });
    });
  });
});
