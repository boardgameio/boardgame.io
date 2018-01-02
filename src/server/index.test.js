/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import Server from './index';
import Game from '../core/game';
import * as ActionCreators from '../core/action-creators';
import * as Redux from 'redux';

jest.mock('koa-socket', () => {
  class MockSocket {
    constructor() {
      this.id = 'id';
      this.callbacks = {};
      this.emit = jest.fn();
      this.broadcast = { emit: jest.fn() };
    }

    receive(type, ...args) {
      this.callbacks[type](args[0], args[1], args[2], args[3], args[4]);
    }

    on(type, callback) {
      this.callbacks[type] = callback;
    }

    to() {
      return {
        broadcast: this.broadcast,
        emit: this.emit
      };
    }

    join() {}
  }

  class MockIO {
    constructor() {
      this.socket = new MockSocket();
    }
    attach() {}
    on(type, callback) { callback({ socket: this.socket }); }
  }

  return MockIO;
});

const game = Game({});

test('basic', () => {
  const server = Server({game});
  const io = server.context.io;
  expect(server).not.toBe(undefined);
  io.socket.receive('disconnect');
});

test('sync', () => {
  const server = Server({game});
  const io = server.context.io;
  expect(server).not.toBe(undefined);

  const spy = jest.spyOn(Redux, 'createStore');

  // Sync causes the server to respond.
  expect(io.socket.emit).toHaveBeenCalledTimes(0);
  io.socket.receive('sync', 'gameID');
  expect(io.socket.emit).toHaveBeenCalledTimes(1);
  expect(spy).toHaveBeenCalled();

  // Sync a second time does not create a game.
  spy.mockReset();
  io.socket.receive('sync', 'gameID');
  expect(io.socket.emit).toHaveBeenCalledTimes(2);
  expect(spy).not.toHaveBeenCalled();

  spy.mockRestore();
});

test('action', () => {
  const server = Server({game});
  const io = server.context.io;
  const action = ActionCreators.endTurn();

  io.socket.receive('action', action);
  expect(io.socket.emit).toHaveBeenCalledTimes(0);
  io.socket.emit.mockReset();

  io.socket.receive('sync', 'gameID');
  io.socket.id = 'second';
  io.socket.receive('sync', 'gameID');
  io.socket.emit.mockReset();

  // Actions are broadcasted as state updates.
  // The playerID parameter is necessary to account for view-only players.
  io.socket.receive('action', action, 0, 'gameID', '0');
  expect(io.socket.emit).lastCalledWith(
    'sync', 'gameID', {
    G: {},
    ctx: {currentPlayer: '1', numPlayers: 2, turn: 1, winner: null},
    log: [{type: "END_TURN"}],
    _id: 1,
    _initial: {
      G: {}, _id: 0, _initial: {},
      ctx: {currentPlayer: '0', numPlayers: 2, turn: 0, winner: null},
      log: []
    }
  });
  io.socket.emit.mockReset();

  // ... but not if the gameID is not known.
  io.socket.receive('action', action, 1, 'unknown', '1');
  expect(io.socket.emit).toHaveBeenCalledTimes(0);

  // ... and not if the _id doesn't match the internal state.
  io.socket.receive('action', action, 100, 'gameID', '1');
  expect(io.socket.emit).toHaveBeenCalledTimes(0);

  // ... and not if player != currentPlayer
  io.socket.receive('action', action, 1, 'gameID', '100');
  expect(io.socket.emit).toHaveBeenCalledTimes(0);

  // Another broadcasted action.
  io.socket.receive('action', action, 1, 'gameID', '1');
  expect(io.socket.emit).toHaveBeenCalledTimes(1);
});

test('playerView', () => {
  // Write the player into G.
  const game = Game({
    playerView: (G, ctx, player) => {
      return {...G, player};
    }
  });

  const server = Server({game});
  const io = server.context.io;

  io.socket.receive('sync', 'gameID', 0);
  expect(io.socket.emit).lastCalledWith('sync', 'gameID', {
    G: {player: 0},
    ctx: {currentPlayer: '0', numPlayers: 2, turn: 0, winner: null},
    log: [],
    _id: 0,
    _initial: {
      G: {}, _id: 0, _initial: {},
      ctx: {currentPlayer: '0', numPlayers: 2, turn: 0, winner: null},
      log: []
    }
  });
});
