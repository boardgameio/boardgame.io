/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { Multiplayer } from './multiplayer';
import Game from '../../core/game';
import { createGameReducer } from '../../core/reducer';
import * as ActionCreators from '../../core/action-creators';

class MockSocket {
  constructor() {
    this.callbacks = {};
    this.emit = jest.fn();
  }

  receive(type, ...args) {
    this.callbacks[type](args[0], args[1]);
  }

  on(type, callback) {
    this.callbacks[type] = callback;
  }
}

test('update gameID / playerID', () => {
  const m = new Multiplayer(null);

  m.updateGameID('test');
  expect(m.gameID).toBe('test');

  m.updatePlayerID('player');
  expect(m.playerID).toBe('player');
});

test('multiplayer', () => {
  const mockSocket = new MockSocket();
  const m = new Multiplayer(mockSocket);
  const game = Game({});
  const store = m.createStore(createGameReducer({game}));

  // Returns a valid store.
  expect(store).not.toBe(undefined);

  const action = ActionCreators.gameEvent({
    type: 'endTurn',
  });

  // Dispatch a local action.
  mockSocket.emit = jest.fn();
  store.dispatch(action);
  expect(mockSocket.emit).lastCalledWith(
      'action', action, 0, 'default', null);

  // sync restores state.
  const restored = { restore: true };
  expect(store.getState()).not.toEqual(restored);
  mockSocket.receive('sync', 'unknown gameID', restored);
  expect(store.getState()).not.toEqual(restored);
  mockSocket.receive('sync', 'default', restored);
  expect(store.getState()).toEqual(restored);

  // updateGameID causes a sync.
  mockSocket.emit = jest.fn();
  m.updateGameID('id');
  expect(mockSocket.emit).lastCalledWith('sync', 'id', null);
});

test('move whitelist', () => {
  const mockSocket = new MockSocket();
  const m = new Multiplayer(mockSocket);
  const game = Game({});
  const store = m.createStore(createGameReducer({game}));

  mockSocket.emit = jest.fn();

  const endTurn = ActionCreators.gameEvent({
    type: 'endTurn',
  });
  store.dispatch(endTurn);
  expect(mockSocket.emit).toHaveBeenCalled();
  mockSocket.emit.mockReset();

  store.dispatch(ActionCreators.makeMove({
    type: 'unknown',
  }));
  expect(mockSocket.emit).toHaveBeenCalled();
  mockSocket.emit.mockReset();

  store.dispatch(ActionCreators.restore());
  expect(mockSocket.emit).toHaveBeenCalled();
  mockSocket.emit.mockReset();

  store.dispatch({ type: 'unknown' });
  expect(mockSocket.emit).not.toHaveBeenCalled();
  mockSocket.emit.mockReset();
});
