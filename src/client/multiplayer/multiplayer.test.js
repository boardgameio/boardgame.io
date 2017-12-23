/*
 * Copyright 2017 Google Inc.
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { Multiplayer } from './multiplayer';
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

test('update gameid / player', () => {
  const m = new Multiplayer(null);

  m.updateGameID('test');
  expect(m.gameid).toBe('test');

  m.updatePlayer('player');
  expect(m.player).toBe('player');
});

test('multiplayer', () => {
  const mockSocket = new MockSocket();
  const m = new Multiplayer(mockSocket);
  const store = m.createStore(createGameReducer({}));

  // Returns a valid store.
  expect(store).not.toBe(undefined);

  const action = ActionCreators.endTurn();

  // Dispatch a local action.
  mockSocket.emit = jest.fn();
  store.dispatch(action);
  expect(mockSocket.emit.mock.calls).toEqual([['action', action]]);

  // sync restores state.
  const restored = { restore: true };
  expect(store.getState()).not.toEqual(restored);
  mockSocket.receive('sync', restored);
  expect(store.getState()).toEqual(restored);

  // updateGameID causes a sync.
  mockSocket.emit = jest.fn();
  m.updateGameID('id');
  expect(mockSocket.emit.mock.calls).toEqual([['sync', 'id']]);
});
