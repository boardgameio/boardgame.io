/*
 * Copyright 2017 Google Inc.
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import Server from './index';
import Game from '../both/game';
import * as ActionCreators from '../both/action-creators';
import * as Redux from 'redux';

jest.mock('koa-socket', () => {
  class MockSocket {
    constructor() {
      this.callbacks = {};
      this.emit = jest.fn();
      this.broadcast = { emit: jest.fn() };
    }

    receive(type, data) {
      this.callbacks[type](data);
    }

    on(type, callback) {
      this.callbacks[type] = callback;
    }
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
  expect(server).not.toBe(undefined);
});

test('sync', () => {
  const server = Server({game});
  const io = server.context.io;
  expect(server).not.toBe(undefined);

  const spy = jest.spyOn(Redux, 'createStore');

  // Sync causes the server to respond.
  expect(io.socket.emit).toHaveBeenCalledTimes(0);
  io.socket.receive('sync', 'gameid');
  expect(io.socket.emit).toHaveBeenCalledTimes(1);
  expect(spy).toHaveBeenCalled();

  // Sync a second time does not create a game.
  spy.mockReset();
  io.socket.receive('sync', 'gameid');
  expect(io.socket.emit).toHaveBeenCalledTimes(2);
  expect(spy).not.toHaveBeenCalled();

  spy.mockRestore();
});

test('action', () => {
  const server = Server({game});
  const io = server.context.io;
  expect(server).not.toBe(undefined);

  let action = ActionCreators.endTurn();
  io.socket.receive('action', action);
  expect(io.socket.broadcast.emit).toHaveBeenCalledTimes(0);

  io.socket.receive('sync', 'gameid');

  // Actions are broadcasted as state updates.
  action._gameid = 'gameid';
  action._id = 0;
  io.socket.receive('action', action);
  expect(io.socket.broadcast.emit).toHaveBeenCalledTimes(1);
  expect(io.socket.broadcast.emit).lastCalledWith('sync', {
    G: {},
    ctx: {currentPlayer: 1, numPlayers: 2, turn: 1},
    log: [{_gameid: "gameid", _id: 0, type: "END_TURN"}],
    _id: 1,
    _initial: {
      G: {}, _id: 0, _initial: {},
      ctx: {currentPlayer: 0, numPlayers: 2, turn: 0},
      log: []
    }
  });

  // ... but not if the gameid is not known.
  action._gameid = 'unknown';
  io.socket.receive('action', action);
  expect(io.socket.broadcast.emit).toHaveBeenCalledTimes(1);

  // ... and not if the _id doesn't match the internal state.
  action._gameid = 'gameid';
  action._id = 0;
  io.socket.receive('action', action);
  expect(io.socket.broadcast.emit).toHaveBeenCalledTimes(1);

  // ... and not if player != currentPlayer
  action._gameid = 'gameid';
  action._player = 100;
  action._id = 0;
  io.socket.receive('action', action);
  expect(io.socket.broadcast.emit).toHaveBeenCalledTimes(1);

  // Another broadcasted action.
  action._gameid = 'gameid';
  action._player = 1;
  action._id = 1;
  io.socket.receive('action', action);
  expect(io.socket.broadcast.emit).toHaveBeenCalledTimes(2);
});

test('playerView', () => {
  // Write the currentPlayer into G.
  const game = Game({
    playerView: (G, ctx) => {
      return {...G, currentPlayer: ctx.currentPlayer};
    }
  });

  const server = Server({game});
  const io = server.context.io;

  io.socket.receive('sync', 'gameid');
  expect(io.socket.emit).lastCalledWith('sync', {
    G: {currentPlayer: 0},
    ctx: {currentPlayer: 0, numPlayers: 2, turn: 0},
    log: [],
    _id: 0,
    _initial: {
      G: {}, _id: 0, _initial: {},
      ctx: {currentPlayer: 0, numPlayers: 2, turn: 0},
      log: []
    }
  });
});
