/*
 * Copyright 2017 Google Inc.
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { setupMultiplayer, updateGameID, gameid } from './multiplayer';
import { createGameReducer } from '../../both/reducer';
import * as ActionCreators from '../../both/action-creators';

class MockSocket {
  constructor() {
    this.callbacks = {};
    this.emit = jest.fn();
  }

  receive(type, data) {
    this.callbacks[type](data);
  }

  on(type, callback) {
    this.callbacks[type] = callback;
  }
}

test('does not crash even when no socket is present', () => {
  updateGameID('test');
  expect(gameid).toBe('test');
});

test('multiplayer', () => {
  const mockSocket = new MockSocket();
  const store = setupMultiplayer(createGameReducer({}), mockSocket);

  // Returns a valid store.
  expect(store).not.toBe(undefined);

  // Receive a remote action.
  let action = ActionCreators.endTurn();
  action.remote = true;
  mockSocket.emit = jest.fn();
  expect(store.getState().ctx.turn).toBe(0);
  mockSocket.receive('action', action);
  expect(store.getState().ctx.turn).toBe(1);
  expect(mockSocket.emit.mock.calls.length).toBe(0);

  // Dispatch a local action.
  mockSocket.emit = jest.fn();
  action = ActionCreators.endTurn();
  store.dispatch(action);
  expect(mockSocket.emit.mock.calls).toEqual([['action', action]]);

  // sync restores state.
  const restored = { restore: true };
  expect(store.getState()).not.toEqual(restored);
  mockSocket.receive('sync', restored);
  expect(store.getState()).toEqual(restored);

  // updateGameID causes a sync.
  mockSocket.emit = jest.fn();
  updateGameID('id');
  expect(mockSocket.emit.mock.calls).toEqual([['sync', 'id']]);
});
