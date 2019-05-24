/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { createStore } from 'redux';
import { SocketIO } from './socketio';
import { makeMove } from '../../core/action-creators';
import { InitializeGame, CreateGameReducer } from '../../core/reducer';
import * as Actions from '../../core/action-types';

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

test('defaults', () => {
  const m = new SocketIO();
  expect(typeof m.callback).toBe('function');
  m.callback();
});

describe('update gameID / playerID', () => {
  const socket = new MockSocket();
  const m = new SocketIO({ socket });
  m.store = { dispatch: () => {} };

  beforeEach(() => (socket.emit = jest.fn()));

  test('gameID', () => {
    m.updateGameID('test');
    expect(m.gameID).toBe('default:test');
    expect(socket.emit).lastCalledWith('sync', 'default:test', null, 2);
  });

  test('playerID', () => {
    m.updatePlayerID('player');
    expect(m.playerID).toBe('player');
    expect(socket.emit).lastCalledWith('sync', 'default:test', 'player', 2);
  });
});

test('connection status', () => {
  const onChangeMock = jest.fn();
  const mockSocket = new MockSocket();
  const m = new SocketIO({
    socket: mockSocket,
    gameID: 0,
    playerID: 0,
    gameName: 'foo',
    numPlayers: 2,
  });
  m.subscribe(onChangeMock);
  m.connect();

  mockSocket.callbacks['connect']();
  expect(onChangeMock).toHaveBeenCalled();
  expect(m.isConnected).toBe(true);

  onChangeMock.mockClear();
  mockSocket.callbacks['disconnect']();
  expect(onChangeMock).toHaveBeenCalled();
  expect(m.isConnected).toBe(false);
});

describe('multiplayer', () => {
  const mockSocket = new MockSocket();
  const m = new SocketIO({ socket: mockSocket });
  m.connect();
  const game = {};
  let store = null;

  beforeEach(() => {
    const reducer = CreateGameReducer({ game });
    const initialState = InitializeGame({ game });
    m.store = store = createStore(reducer, initialState);
  });

  test('returns a valid store', () => {
    expect(store).not.toBe(undefined);
  });

  test('receive update', () => {
    const restored = { restore: true };
    expect(store.getState()).not.toMatchObject(restored);
    mockSocket.receive('update', 'unknown gameID', restored);
    expect(store.getState()).not.toMatchObject(restored);
    mockSocket.receive('update', 'default:default', restored);
    expect(store.getState()).not.toMatchObject(restored);

    // Only if the stateID is not stale.
    restored._stateID = 1;
    mockSocket.receive('update', 'default:default', restored);
    expect(store.getState()).toMatchObject(restored);
  });

  test('receive sync', () => {
    const restored = { restore: true };
    expect(store.getState()).not.toMatchObject(restored);
    mockSocket.receive('sync', 'unknown gameID', restored);
    expect(store.getState()).not.toMatchObject(restored);
    mockSocket.receive('sync', 'default:default', restored);
    expect(store.getState()).toMatchObject(restored);
  });

  test('send update', () => {
    const action = makeMove();
    const state = { _stateID: 0 };
    m.onAction(state, action);
    expect(mockSocket.emit).lastCalledWith(
      'update',
      action,
      state._stateID,
      'default:default',
      null
    );
  });
});

describe('server option', () => {
  const hostname = 'host';
  const port = '1234';

  test('without protocol', () => {
    const server = hostname + ':' + port;
    const m = new SocketIO({ server });
    m.connect();
    expect(m.socket.io.engine.hostname).toEqual(hostname);
    expect(m.socket.io.engine.port).toEqual(port);
    expect(m.socket.io.engine.secure).toEqual(false);
  });

  test('without trailing slash', () => {
    const server = 'http://' + hostname + ':' + port;
    const m = new SocketIO({ server });
    m.connect();
    expect(m.socket.io.uri).toEqual(server + '/default');
  });

  test('https', () => {
    const serverWithProtocol = 'https://' + hostname + ':' + port + '/';
    const m = new SocketIO({ server: serverWithProtocol });
    m.connect();
    expect(m.socket.io.engine.hostname).toEqual(hostname);
    expect(m.socket.io.engine.port).toEqual(port);
    expect(m.socket.io.engine.secure).toEqual(true);
  });

  test('http', () => {
    const serverWithProtocol = 'http://' + hostname + ':' + port + '/';
    const m = new SocketIO({ server: serverWithProtocol });
    m.connect();
    expect(m.socket.io.engine.hostname).toEqual(hostname);
    expect(m.socket.io.engine.port).toEqual(port);
    expect(m.socket.io.engine.secure).toEqual(false);
  });

  test('no server set', () => {
    const m = new SocketIO();
    m.connect();
    expect(m.socket.io.engine.hostname).not.toEqual(hostname);
    expect(m.socket.io.engine.port).not.toEqual(port);
  });
});

test('changing a gameID resets the state before resync', () => {
  const m = new SocketIO();
  const game = {};
  const store = createStore(CreateGameReducer({ game }));
  m.store = store;
  const dispatchSpy = jest.spyOn(store, 'dispatch');

  m.updateGameID('foo');

  expect(dispatchSpy).toHaveBeenCalledWith(
    expect.objectContaining({
      type: Actions.RESET,
      clientOnly: true,
    })
  );
});

test('changing a playerID resets the state before resync', () => {
  const m = new SocketIO();
  const game = {};
  const store = createStore(CreateGameReducer({ game }));
  m.store = store;
  const dispatchSpy = jest.spyOn(store, 'dispatch');

  m.updatePlayerID('foo');

  expect(dispatchSpy).toHaveBeenCalledWith(
    expect.objectContaining({
      type: Actions.RESET,
      clientOnly: true,
    })
  );
});
