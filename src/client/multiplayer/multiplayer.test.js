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
  const m = new Multiplayer();
  m.updateGameID('test');
  m.updatePlayerID('player');
  expect(m.gameID).toBe('default:test');
  expect(m.playerID).toBe('player');
});

test('connection status', () => {
  const onChangeMock = jest.fn();
  const mockSocket = new MockSocket();
  const m = new Multiplayer({
    socket: mockSocket,
    gameID: 0,
    playerID: 0,
    gameName: 'foo',
    numPlayers: 2,
    onChange: onChangeMock,
  });
  const game = Game({});
  m.createStore(createGameReducer({ game }));
  mockSocket.callbacks['connect']();
  expect(onChangeMock).lastCalledWith(true);
  onChangeMock.mockClear();
  mockSocket.callbacks['disconnect']();
  expect(onChangeMock).lastCalledWith(false);
});

test('multiplayer', () => {
  const mockSocket = new MockSocket();
  const m = new Multiplayer({ socket: mockSocket });
  const game = Game({});
  const store = m.createStore(createGameReducer({ game }));

  // Returns a valid store.
  expect(store).not.toBe(undefined);

  const action = ActionCreators.gameEvent('endTurn');

  // Dispatch a local action.
  mockSocket.emit = jest.fn();
  store.dispatch(action);
  expect(mockSocket.emit).lastCalledWith(
    'action',
    action,
    0,
    'default:default',
    null
  );

  // sync restores state.
  const restored = { restore: true };
  expect(store.getState()).not.toEqual(restored);
  mockSocket.receive('sync', 'unknown gameID', restored);
  expect(store.getState()).not.toEqual(restored);
  mockSocket.receive('sync', 'default:default', restored);
  expect(store.getState()).toEqual(restored);

  // updateGameID causes a sync.
  mockSocket.emit = jest.fn();
  m.updateGameID('id');
  expect(mockSocket.emit).lastCalledWith('sync', 'default:id', null, 2);
});

test('move whitelist', () => {
  const mockSocket = new MockSocket();
  const m = new Multiplayer({ socket: mockSocket });
  const game = Game({});
  const store = m.createStore(createGameReducer({ game }));

  mockSocket.emit = jest.fn();

  const endTurn = ActionCreators.gameEvent('endTurn');

  store.dispatch(endTurn);
  expect(mockSocket.emit).toHaveBeenCalled();
  mockSocket.emit.mockReset();

  store.dispatch(ActionCreators.makeMove());
  expect(mockSocket.emit).toHaveBeenCalled();
  mockSocket.emit.mockReset();

  store.dispatch({ type: 'unknown' });
  expect(mockSocket.emit).not.toHaveBeenCalled();
  mockSocket.emit.mockReset();
});

test('game server is set when provided', () => {
  var hostname = 'host';
  var port = '1234';
  var server = hostname + ':' + port;

  const m = new Multiplayer({ server });
  expect(m.socket.io.engine.hostname).toEqual(hostname);
  expect(m.socket.io.engine.port).toEqual(port);

  const m2 = new Multiplayer();
  expect(m2.socket.io.engine.hostname).not.toEqual(hostname);
  expect(m2.socket.io.engine.port).not.toEqual(port);
});
