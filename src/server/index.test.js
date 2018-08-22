/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

jest.mock('./api');

import { Server } from './index';
import Game from '../core/game';
import * as ActionCreators from '../core/action-creators';
import * as Redux from 'redux';
import { createApiServer, isActionFromAuthenticPlayer } from './api';
import { FlowWithPhases } from '../core/flow';

beforeEach(() => {
  jest.resetModules();
  jest.resetAllMocks();
  createApiServer.mockReturnValue({
    listen() {},
  });
  isActionFromAuthenticPlayer.mockReturnValue(true);
});

jest.mock('koa-socket-2', () => {
  class MockSocket {
    constructor() {
      this.id = 'id';
      this.callbacks = {};
      this.emit = jest.fn();
      this.broadcast = { emit: jest.fn() };
    }

    async receive(type, ...args) {
      await this.callbacks[type](args[0], args[1], args[2], args[3], args[4]);
      return;
    }

    on(type, callback) {
      this.callbacks[type] = callback;
    }

    to() {
      return {
        broadcast: this.broadcast,
        emit: this.emit,
      };
    }

    join() {}
  }

  class MockIO {
    constructor() {
      this.socket = new MockSocket();
    }
    attach(app) {
      app.io = app._io = this;
    }
    of() {
      return this;
    }
    on(type, callback) {
      callback(this.socket);
    }
  }

  return MockIO;
});

const game = Game({ seed: 0 });

test('basic', () => {
  const server = Server({ games: [game] });
  server.run();
  expect(server).not.toBe(undefined);
});

test('connect / disconnect', async () => {
  const toObj = m => {
    let o = {};
    m.forEach((value, key) => {
      o[key] = value;
    });
    return o;
  };

  const _clientInfo = new Map();
  const _roomInfo = new Map();

  const server = Server({ games: [game], _clientInfo, _roomInfo });
  const io = server.app.context.io;

  io.socket.id = '0';
  await io.socket.receive('sync', 'gameID', '0', 2);
  io.socket.id = '1';
  await io.socket.receive('sync', 'gameID', '1', 2);

  expect(toObj(_clientInfo)).toEqual({
    '0': { gameID: 'gameID', playerID: '0' },
    '1': { gameID: 'gameID', playerID: '1' },
  });
  expect(toObj(_roomInfo.get('gameID'))).toEqual({ '0': '0', '1': '1' });

  // 0 disconnects.

  io.socket.id = '0';
  await io.socket.receive('disconnect');

  expect(toObj(_clientInfo)).toEqual({
    '1': { gameID: 'gameID', playerID: '1' },
  });
  expect(toObj(_roomInfo.get('gameID'))).toEqual({ '1': '1' });

  // unknown player disconnects.

  io.socket.id = 'unknown';
  await io.socket.receive('disconnect');

  // 1 disconnects.

  io.socket.id = '1';
  await io.socket.receive('disconnect');
  expect(toObj(_clientInfo)).toEqual({});
  expect(toObj(_roomInfo.get('gameID'))).toEqual({});
});

test('sync', async () => {
  const server = Server({ games: [game] });
  const io = server.app.context.io;
  expect(server).not.toBe(undefined);

  const spy = jest.spyOn(Redux, 'createStore');

  // Sync causes the server to respond.
  expect(io.socket.emit).toHaveBeenCalledTimes(0);
  await io.socket.receive('sync', 'gameID');

  expect(io.socket.emit).toHaveBeenCalledTimes(1);
  expect(spy).toHaveBeenCalled();

  // Sync a second time does not create a game.
  spy.mockReset();
  await io.socket.receive('sync', 'gameID');

  expect(io.socket.emit).toHaveBeenCalledTimes(2);
  expect(spy).not.toHaveBeenCalled();

  spy.mockRestore();
});

describe('update', async () => {
  const server = Server({ games: [game] });
  const io = server.app.context.io;
  const action = ActionCreators.gameEvent('endTurn');

  beforeEach(() => {
    io.socket.emit.mockReset();
  });

  describe('without clients connected', () => {
    test('no updates sent', async () => {
      await io.socket.receive('update', action);
      expect(io.socket.emit).toHaveBeenCalledTimes(0);
    });
  });

  describe('with clients connected', () => {
    beforeAll(async () => {
      await io.socket.receive('sync', 'gameID');
      io.socket.id = 'second';
      await io.socket.receive('sync', 'gameID');
      io.socket.emit.mockReset();
    });

    test('basic', async () => {
      await io.socket.receive('update', action, 0, 'gameID', '0');
      expect(io.socket.emit).lastCalledWith(
        'update',
        'gameID',
        {
          G: {},
          deltalog: undefined,
          log: undefined,
          _initial: {
            G: {},
            _initial: {},
            _redo: [],
            _stateID: 0,
            _undo: [
              {
                G: {},
                ctx: {
                  _random: { seed: 0 },
                  actionPlayers: ['0'],
                  allPlayed: false,
                  allowedMoves: null,
                  currentPlayer: '0',
                  currentPlayerMoves: 0,
                  numPlayers: 2,
                  phase: 'default',
                  playOrder: ['0', '1'],
                  playOrderPos: 0,
                  stats: {
                    phase: { allPlayed: false, numMoves: {} },
                    turn: { numMoves: {} },
                  },
                  turn: 0,
                },
              },
            ],
            ctx: {
              _random: { seed: 0 },
              actionPlayers: ['0'],
              allPlayed: false,
              allowedMoves: null,
              currentPlayer: '0',
              currentPlayerMoves: 0,
              numPlayers: 2,
              phase: 'default',
              playOrder: ['0', '1'],
              playOrderPos: 0,
              stats: {
                phase: { allPlayed: false, numMoves: {} },
                turn: { allPlayed: false, numMoves: {} },
              },
              turn: 0,
            },
          },
          _redo: [],
          _stateID: 1,
          _undo: [
            {
              G: {},
              ctx: {
                _random: { seed: 0 },
                actionPlayers: ['1'],
                allPlayed: false,
                allowedMoves: null,
                currentPlayer: '1',
                currentPlayerMoves: 0,
                numPlayers: 2,
                phase: 'default',
                playOrder: ['0', '1'],
                playOrderPos: 1,
                stats: {
                  phase: { allPlayed: false, numMoves: {} },
                  turn: { allPlayed: false, numMoves: {} },
                },
                turn: 1,
              },
            },
          ],
          ctx: {
            _random: undefined,
            actionPlayers: ['1'],
            allPlayed: false,
            allowedMoves: null,
            currentPlayer: '1',
            currentPlayerMoves: 0,
            numPlayers: 2,
            phase: 'default',
            playOrder: ['0', '1'],
            playOrderPos: 1,
            stats: {
              phase: { allPlayed: false, numMoves: {} },
              turn: { allPlayed: false, numMoves: {} },
            },
            turn: 1,
          },
        },

        // deltalog
        [
          {
            payload: {
              args: undefined,
              credentials: undefined,
              playerID: undefined,
              type: 'endTurn',
            },
            type: 'GAME_EVENT',
          },
        ]
      );
      io.socket.emit.mockReset();
    });

    test('invalid gameID', async () => {
      await io.socket.receive('update', action, 1, 'unknown', '1');
      expect(io.socket.emit).toHaveBeenCalledTimes(0);
    });

    test('invalid stateID', async () => {
      await io.socket.receive('update', action, 100, 'gameID', '1');
      expect(io.socket.emit).toHaveBeenCalledTimes(0);
    });

    test('invalid playerID', async () => {
      await io.socket.receive('update', action, 1, 'gameID', '100');
      expect(io.socket.emit).toHaveBeenCalledTimes(0);
      await io.socket.receive(
        'update',
        ActionCreators.makeMove(),
        1,
        'gameID',
        '100'
      );
      expect(io.socket.emit).toHaveBeenCalledTimes(0);
    });

    test('valid gameID / stateID / playerID', async () => {
      await io.socket.receive('update', action, 1, 'gameID', '1');
      expect(io.socket.emit).toHaveBeenCalledTimes(2);
    });
  });
});

describe('playerView', () => {
  test('sync', async () => {
    // Write the player into G.
    const game = Game({
      playerView: (G, ctx, player) => {
        return Object.assign({}, G, { player });
      },
    });

    const server = Server({ games: [game] });
    const io = server.app.context.io;

    await io.socket.receive('sync', 'gameID', 0);
    expect(io.socket.emit).toHaveBeenCalledTimes(1);
    expect(io.socket.emit.mock.calls[0][2].G).toEqual({ player: 0 });
  });

  test('update', async () => {
    const game = Game({
      playerView: (G, ctx, player) => {
        return Object.assign({}, G, { player });
      },
    });
    const server = Server({ games: [game] });
    const io = server.app.context.io;
    const action = ActionCreators.gameEvent('endTurn');

    io.socket.id = 'first';
    await io.socket.receive('sync', 'gameID', '0', 2);
    io.socket.id = 'second';
    await io.socket.receive('sync', 'gameID', '1', 2);
    io.socket.emit.mockReset();

    await io.socket.receive('update', action, 0, 'gameID', '0');
    expect(io.socket.emit).toHaveBeenCalledTimes(2);

    const G_player0 = io.socket.emit.mock.calls[0][2].G;
    const G_player1 = io.socket.emit.mock.calls[1][2].G;

    expect(G_player0.player).toBe('0');
    expect(G_player1.player).toBe('1');
  });
});

test('custom db implementation', async () => {
  let getId = null;

  class Custom {
    constructor() {
      this.games = new Map();
    }
    async connect() {
      return;
    }
    async get(id) {
      getId = id;
      return await this.games.get(id);
    }
    async set(id, state) {
      return await this.games.set(id, state);
    }
  }

  const game = Game({});
  const server = Server({ games: [game], db: new Custom() });
  const io = server.app.context.io;

  await io.socket.receive('sync', 'gameID');
  expect(getId).toBe('gameID');
});

test('auth failure', async () => {
  isActionFromAuthenticPlayer.mockReturnValue(false);

  const server = Server({ games: [game] });
  const io = server.app.context.io;
  const action = ActionCreators.gameEvent('endTurn');

  await io.socket.receive('sync', 'gameID');
  io.socket.emit.mockReset();

  await io.socket.receive('update', action, 0, 'gameID', '0');
  expect(io.socket.emit).toHaveBeenCalledTimes(0);
});

describe('error log', () => {
  const game2 = Game({
    seed: 0,
    flow: FlowWithPhases({ setActionPlayers: true }),
  });
  const log = jest.fn();
  const server = Server({ games: [game2], log });
  const io = server.app.context.io;
  const endTurnEvent = ActionCreators.gameEvent('endTurn');

  beforeAll(async () => {
    // create game called "gameID"
    await io.socket.receive('sync', 'gameID');
  });

  beforeEach(() => {
    io.socket.emit.mockReset();
    log.mockReset();
  });

  test('writes log when gameID not found', async () => {
    await io.socket.receive('update', endTurnEvent, 1, 'unknown', '0');
    expect(log).toHaveBeenCalledWith(`game not found, gameID=[unknown]`);
  });

  test('writes log on an invalid stateID', async () => {
    await io.socket.receive('update', endTurnEvent, 100, 'gameID', '0');
    expect(log).toHaveBeenCalledWith(
      `invalid stateID, was=[100], expected=[0]`
    );
  });

  test('writes log when a player is not on turn', async () => {
    await io.socket.receive('update', endTurnEvent, 0, 'gameID', '100');
    expect(log).toHaveBeenCalledWith(
      `event not processed - invalid playerID=[100]`
    );
  });

  test('writes log when player is not an action player', async () => {
    const setActionPlayersEvent = ActionCreators.gameEvent('setActionPlayers', [
      '1',
    ]);
    await io.socket.receive('update', setActionPlayersEvent, 0, 'gameID', '0');

    const move = ActionCreators.makeMove('move');
    await io.socket.receive('update', move, 1, 'gameID', '0');
    expect(log).toHaveBeenCalledWith(
      `move not processed - canPlayerMakeMove=false, playerID=[0]`
    );
  });
});
