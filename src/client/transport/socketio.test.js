/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { createStore } from 'redux';
import { SocketIOTransport } from './socketio';
import { makeMove } from '../../core/action-creators';
import { CreateGameReducer } from '../../core/reducer';
import { InitializeGame } from '../../core/initialize';
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

  close() {}
}

test('defaults', () => {
  const m = new SocketIOTransport();
  expect(typeof m.callback).toBe('function');
  m.callback();
});

describe('update matchID / playerID', () => {
  const socket = new MockSocket();
  const m = new SocketIOTransport({ socket });
  m.store = { dispatch: () => {} };

  beforeEach(() => (socket.emit = jest.fn()));

  test('matchID', () => {
    m.updateMatchID('test');
    expect(m.matchID).toBe('test');
    expect(socket.emit).lastCalledWith('sync', 'test', null, 2);
  });

  test('playerID', () => {
    m.updatePlayerID('player');
    expect(m.playerID).toBe('player');
    expect(socket.emit).lastCalledWith('sync', 'test', 'player', 2);
  });
});

describe('connection status', () => {
  let onChangeMock;
  let mockSocket;
  let m;

  beforeEach(() => {
    onChangeMock = jest.fn();
    mockSocket = new MockSocket();
    m = new SocketIOTransport({
      socket: mockSocket,
      matchID: 0,
      playerID: 0,
      gameName: 'foo',
      numPlayers: 2,
    });
    m.subscribe(onChangeMock);
    m.connect();
  });

  test('connect', () => {
    mockSocket.callbacks['connect']();
    expect(onChangeMock).toHaveBeenCalled();
    expect(m.isConnected).toBe(true);
  });

  test('disconnect', () => {
    mockSocket.callbacks['disconnect']();
    expect(onChangeMock).toHaveBeenCalled();
    expect(m.isConnected).toBe(false);
  });

  test('close socket', () => {
    mockSocket.callbacks['connect']();
    expect(m.isConnected).toBe(true);
    m.disconnect();
    expect(m.isConnected).toBe(false);
  });
});

describe('multiplayer', () => {
  const mockSocket = new MockSocket();
  const m = new SocketIOTransport({ socket: mockSocket });
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
    mockSocket.receive('update', 'unknown matchID', restored);
    expect(store.getState()).not.toMatchObject(restored);
    mockSocket.receive('update', 'default', restored);
    expect(store.getState()).not.toMatchObject(restored);

    // Only if the stateID is not stale.
    restored._stateID = 1;
    mockSocket.receive('update', 'default', restored);
    expect(store.getState()).toMatchObject(restored);
  });

  test('receive sync', () => {
    const restored = { restore: true };
    expect(store.getState()).not.toMatchObject(restored);
    mockSocket.receive('sync', 'unknown matchID', { state: restored });
    expect(store.getState()).not.toMatchObject(restored);
    mockSocket.receive('sync', 'default', { state: restored });
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
      'default',
      null
    );
  });
});

describe('server option', () => {
  const hostname = 'host';
  const port = '1234';

  test('without protocol', () => {
    const server = hostname + ':' + port;
    const m = new SocketIOTransport({ server });
    m.connect();
    expect(m.socket.io.engine.hostname).toEqual(hostname);
    expect(m.socket.io.engine.port).toEqual(port);
    expect(m.socket.io.engine.secure).toEqual(false);
  });

  test('without trailing slash', () => {
    const server = 'http://' + hostname + ':' + port;
    const m = new SocketIOTransport({ server });
    m.connect();
    expect(m.socket.io.uri).toEqual(server + '/default');
  });

  test('https', () => {
    const serverWithProtocol = 'https://' + hostname + ':' + port + '/';
    const m = new SocketIOTransport({ server: serverWithProtocol });
    m.connect();
    expect(m.socket.io.engine.hostname).toEqual(hostname);
    expect(m.socket.io.engine.port).toEqual(port);
    expect(m.socket.io.engine.secure).toEqual(true);
  });

  test('http', () => {
    const serverWithProtocol = 'http://' + hostname + ':' + port + '/';
    const m = new SocketIOTransport({ server: serverWithProtocol });
    m.connect();
    expect(m.socket.io.engine.hostname).toEqual(hostname);
    expect(m.socket.io.engine.port).toEqual(port);
    expect(m.socket.io.engine.secure).toEqual(false);
  });

  test('no server set', () => {
    const m = new SocketIOTransport();
    m.connect();
    expect(m.socket.io.engine.hostname).not.toEqual(hostname);
    expect(m.socket.io.engine.port).not.toEqual(port);
  });
});

test('changing a matchID resets the state before resync', () => {
  const m = new SocketIOTransport();
  const game = {};
  const store = createStore(CreateGameReducer({ game }));
  m.store = store;
  const dispatchSpy = jest.spyOn(store, 'dispatch');

  m.updateMatchID('foo');

  expect(dispatchSpy).toHaveBeenCalledWith(
    expect.objectContaining({
      type: Actions.RESET,
      clientOnly: true,
    })
  );
});

test('changing a playerID resets the state before resync', () => {
  const m = new SocketIOTransport();
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
