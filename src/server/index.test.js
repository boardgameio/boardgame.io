/*
 * Copyright 2017 Google Inc.
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import Server from './index';
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

test('basic', () => {
  const server = Server({});
  expect(server).not.toBe(undefined);
});

test('sync', () => {
  const server = Server({});
  const io = server.context.io;
  expect(server).not.toBe(undefined);

  const spy = jest.spyOn(Redux, 'createStore');

  // Sync causes the server to respond.
  expect(io.socket.emit.mock.calls.length).toBe(0);
  io.socket.receive('sync', 'gameid');
  expect(io.socket.emit.mock.calls.length).toBe(1);
  expect(spy).toHaveBeenCalled();

  // Sync a second time does not create a game.
  spy.mockReset();
  io.socket.receive('sync', 'gameid');
  expect(io.socket.emit.mock.calls.length).toBe(2);
  expect(spy).not.toHaveBeenCalled();

  spy.mockRestore();
});

test('action', () => {
  const server = Server({});
  const io = server.context.io;
  expect(server).not.toBe(undefined);

  let action = ActionCreators.endTurn();
  io.socket.receive('action', action);
  expect(io.socket.broadcast.emit.mock.calls.length).toBe(0);

  // Actions are broadcasted.
  action._gameid = 'gameid';
  action._id = 0;
  io.socket.receive('action', action);
  expect(io.socket.broadcast.emit.mock.calls.length).toBe(1);

  // ... but not if the gameid is not known.
  action._gameid = 'unknown';
  io.socket.receive('action', action);
  expect(io.socket.broadcast.emit.mock.calls.length).toBe(1);

  // ... and not if the _id doesn't match the internal state.
  action._gameid = 'gameid';
  action._id = 0;
  io.socket.receive('action', action);
  expect(io.socket.broadcast.emit.mock.calls.length).toBe(1);

  // Another broadcasted action with proper _gameid and _id.
  action._gameid = 'gameid';
  action._id = 1;
  io.socket.receive('action', action);
  expect(io.socket.broadcast.emit.mock.calls.length).toBe(2);
});
