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
import type { Master } from '../../master/master';
import type { ChatMessage, State, Store } from '../../types';
import { error } from '../../core/logger';

jest.mock('../../core/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
}));

type UpdateArgs = Parameters<Master['onUpdate']>;
type SyncArgs = Parameters<Master['onSync']>;

class MockSocket {
  callbacks: Record<string, (arg0?: any, arg1?: any) => void>;
  emit: jest.Mock;

  constructor() {
    this.callbacks = {};
    this.emit = jest.fn();
  }

  receive(type: string, ...args) {
    this.callbacks[type](...args);
  }

  on(type: string, callback: (arg0?: any, arg1?: any) => void) {
    this.callbacks[type] = callback;
  }

  close() {}
}

test('defaults', () => {
  const m = new SocketIOTransport();
  expect(typeof m.callback).toBe('function');
  m.callback();
});

class TransportAdapter extends SocketIOTransport {
  socket: SocketIOClient.Socket & {
    io: { engine: any };
  };

  getMatchID() {
    return this.matchID;
  }

  getPlayerID() {
    return this.playerID;
  }

  getCredentials() {
    return this.credentials;
  }

  setStore(store: Store | { dispatch: () => void }) {
    this.store = store as Store;
  }
}

describe('update matchID / playerID / credentials', () => {
  const socket = new MockSocket();
  const m = new TransportAdapter({ socket });
  m.setStore({ dispatch: () => {} });

  beforeEach(() => (socket.emit = jest.fn()));

  test('matchID', () => {
    m.updateMatchID('test');
    expect(m.getMatchID()).toBe('test');
    const args: SyncArgs = ['test', null, undefined, 2];
    expect(socket.emit).lastCalledWith('sync', ...args);
  });

  test('playerID', () => {
    m.updatePlayerID('player');
    expect(m.getPlayerID()).toBe('player');
    const args: SyncArgs = ['test', 'player', undefined, 2];
    expect(socket.emit).lastCalledWith('sync', ...args);
  });

  test('credentials', () => {
    m.updateCredentials('1234');
    expect(m.getCredentials()).toBe('1234');
    const args: SyncArgs = ['test', 'player', '1234', 2];
    expect(socket.emit).lastCalledWith('sync', ...args);
  });
});

describe('connection status', () => {
  let onChangeMock: jest.Mock;
  let mockSocket: MockSocket;
  let m: SocketIOTransport;

  beforeEach(() => {
    onChangeMock = jest.fn();
    mockSocket = new MockSocket();
    m = new SocketIOTransport({
      socket: mockSocket,
      matchID: '0',
      playerID: '0',
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
  const m = new TransportAdapter({ socket: mockSocket });
  m.connect();
  const game = {};
  let store = null;

  beforeEach(() => {
    const reducer = CreateGameReducer({ game });
    const initialState = InitializeGame({ game });
    store = createStore(reducer, initialState);
    m.setStore(store);
  });

  test('returns a valid store', () => {
    expect(store).not.toBe(undefined);
  });

  test('receive update', () => {
    const restored: { restore: boolean; _stateID?: number } = { restore: true };
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

  test('receive matchData', () => {
    let receivedMatchData: any;
    m.subscribeMatchData((data) => (receivedMatchData = data));
    const matchData = [{ id: '0', name: 'Alice' }];
    mockSocket.receive('matchData', 'unknown matchID', matchData);
    expect(receivedMatchData).toBe(undefined);
    mockSocket.receive('matchData', 'default', matchData);
    expect(receivedMatchData).toMatchObject(matchData);
  });

  test('send update', () => {
    const action = makeMove(undefined, undefined, undefined);
    const state = { _stateID: 0 } as State;
    m.onAction(state, action);
    const args: UpdateArgs = [action, state._stateID, 'default', null];
    expect(mockSocket.emit).lastCalledWith('update', ...args);
  });

  test('receive chat-message', () => {
    let receivedChatData;
    m.subscribeChatMessage((data) => (receivedChatData = data));
    const chatData = { message: 'foo' };
    mockSocket.receive('chat', 'unknown matchID', chatData);
    expect(receivedChatData).toBe(undefined);
    mockSocket.receive('chat', 'default', chatData);
    expect(receivedChatData).toMatchObject(receivedChatData);
  });

  test('send chat-message', () => {
    const message: ChatMessage = {
      id: '0',
      sender: '0',
      payload: { message: 'foo' },
    };
    m.onChatMessage('matchID', message);
    expect(mockSocket.emit).lastCalledWith(
      'chat',
      'matchID',
      message,
      m.getCredentials()
    );
  });
});

describe('multiplayer delta state', () => {
  const mockSocket = new MockSocket();
  const m = new TransportAdapter({ socket: mockSocket });
  m.connect();
  const game = { deltaState: true };
  let store = null;

  beforeEach(() => {
    const reducer = CreateGameReducer({ game });
    const initialState = InitializeGame({ game });
    store = createStore(reducer, initialState);
    m.setStore(store);
  });

  test('returns a valid store', () => {
    expect(store).not.toBe(undefined);
  });

  test('receive patch', () => {
    const originalState = JSON.parse(JSON.stringify(store.getState()));
    mockSocket.receive(
      'patch',
      'unknown matchID',
      0,
      1,
      [{ op: 'replace', path: '/_stateID', value: 1 }],
      []
    );
    expect(store.getState()).toMatchObject(originalState);
    mockSocket.receive(
      'patch',
      'default',
      0,
      1,
      [{ op: 'replace', path: '/_stateID', value: 1 }],
      []
    );
    expect(store.getState()._stateID).toBe(1);
    mockSocket.receive(
      'patch',
      'default',
      1,
      2,
      [{ op: 'replace', path: '/_stateIDD', value: 3 }],
      []
    );
    expect(store.getState()._stateID).toBe(1);
    const args: SyncArgs = ['default', null, undefined, 2];
    expect(mockSocket.emit).lastCalledWith('sync', ...args);
    expect(error).lastCalledWith(
      'Patch [{"op":"replace","path":"/_stateIDD","value":3}] apply failed'
    );
  });
});

describe('server option', () => {
  const hostname = 'host';
  const port = '1234';

  test('without protocol', () => {
    const server = hostname + ':' + port;
    const m = new TransportAdapter({ server });
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
    const m = new TransportAdapter({ server: serverWithProtocol });
    m.connect();
    expect(m.socket.io.engine.hostname).toEqual(hostname);
    expect(m.socket.io.engine.port).toEqual(port);
    expect(m.socket.io.engine.secure).toEqual(true);
  });

  test('http', () => {
    const serverWithProtocol = 'http://' + hostname + ':' + port + '/';
    const m = new TransportAdapter({ server: serverWithProtocol });
    m.connect();
    expect(m.socket.io.engine.hostname).toEqual(hostname);
    expect(m.socket.io.engine.port).toEqual(port);
    expect(m.socket.io.engine.secure).toEqual(false);
  });

  test('no server set', () => {
    const m = new TransportAdapter();
    m.connect();
    expect(m.socket.io.engine.hostname).not.toEqual(hostname);
    expect(m.socket.io.engine.port).not.toEqual(port);
  });
});

test('changing a matchID resets the state before resync', () => {
  const m = new TransportAdapter();
  const game = {};
  const store = createStore(CreateGameReducer({ game }));
  m.setStore(store);
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
  const m = new TransportAdapter();
  const game = {};
  const store = createStore(CreateGameReducer({ game }));
  m.setStore(store);
  const dispatchSpy = jest.spyOn(store, 'dispatch');

  m.updatePlayerID('foo');

  expect(dispatchSpy).toHaveBeenCalledWith(
    expect.objectContaining({
      type: Actions.RESET,
      clientOnly: true,
    })
  );
});

test('changing credentials resets the state before resync', () => {
  const m = new TransportAdapter();
  const game = {};
  const store = createStore(CreateGameReducer({ game }));
  m.setStore(store);
  const dispatchSpy = jest.spyOn(store, 'dispatch');

  m.updateCredentials('foo');

  expect(dispatchSpy).toHaveBeenCalledWith(
    expect.objectContaining({
      type: Actions.RESET,
      clientOnly: true,
    })
  );
});
