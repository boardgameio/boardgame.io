/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { SocketIOTransport } from './socketio';
import type * as ioNamespace from 'socket.io-client';
import { makeMove } from '../../core/action-creators';
import type { Master } from '../../master/master';
import type { ChatMessage, State } from '../../types';

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
  const m = new SocketIOTransport({ clientCallback: () => {} });
  expect(typeof (m as any).connectionStatusCallback).toBe('function');
  (m as any).connectionStatusCallback();
});

class TransportAdapter extends SocketIOTransport {
  declare socket: ioNamespace.Socket & {
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
}

describe('update matchID / playerID / credentials', () => {
  const socket = new MockSocket();
  const m = new TransportAdapter({ socket, clientCallback: () => {} });

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
      clientCallback: () => {},
    });
    m.subscribeToConnectionStatus(onChangeMock);
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

  test('doesn’t crash if syncing before connecting', () => {
    const clientCallback = jest.fn();
    const transport = new SocketIOTransport({ clientCallback });
    transport.requestSync();
    expect(clientCallback).not.toHaveBeenCalled();
  });
});

describe('multiplayer', () => {
  const mockSocket = new MockSocket();
  const clientCallback = jest.fn();
  const transport = new TransportAdapter({
    socket: mockSocket,
    clientCallback,
  });
  transport.connect();

  beforeEach(jest.clearAllMocks);

  test('receive update', () => {
    const restored: { restore: boolean; _stateID?: number } = { restore: true };
    mockSocket.receive('update', 'default', restored);
    expect(clientCallback).toHaveBeenCalledWith({
      type: 'update',
      args: ['default', restored, undefined],
    });
  });

  test('receive sync', () => {
    const restored = { restore: true };
    mockSocket.receive('sync', 'default', { state: restored });
    expect(clientCallback).toHaveBeenCalledWith({
      type: 'sync',
      args: ['default', { state: restored }],
    });
  });

  test('receive matchData', () => {
    const matchData = [{ id: '0', name: 'Alice' }];
    mockSocket.receive('matchData', 'default', matchData);
    expect(clientCallback).toHaveBeenCalledWith({
      type: 'matchData',
      args: ['default', matchData],
    });
  });

  test('send update', () => {
    const action = makeMove(undefined, undefined, undefined);
    const state = { _stateID: 0 } as State;
    transport.sendAction(state, action);
    const args: UpdateArgs = [action, state._stateID, 'default', null];
    expect(mockSocket.emit).lastCalledWith('update', ...args);
  });

  test('receive chat-message', () => {
    const chatData = { message: 'foo' };
    mockSocket.receive('chat', 'default', chatData);
    expect(clientCallback).toHaveBeenCalledWith({
      type: 'chat',
      args: ['default', chatData],
    });
  });

  test('send chat-message', () => {
    const message: ChatMessage = {
      id: '0',
      sender: '0',
      payload: { message: 'foo' },
    };
    transport.sendChatMessage('matchID', message);
    expect(mockSocket.emit).lastCalledWith(
      'chat',
      'matchID',
      message,
      transport.getCredentials()
    );
  });
});

describe('multiplayer delta state', () => {
  const mockSocket = new MockSocket();
  const clientCallback = jest.fn();
  const transport = new TransportAdapter({
    socket: mockSocket,
    clientCallback,
  });
  transport.connect();

  beforeEach(jest.clearAllMocks);

  test('receive patch', () => {
    const patch1 = [
      'default',
      0,
      1,
      [{ op: 'replace', path: '/_stateID', value: 1 }],
      [],
    ];
    mockSocket.receive('patch', ...patch1);
    expect(clientCallback).toHaveBeenCalledWith({
      type: 'patch',
      args: patch1,
    });
  });
});

describe('server option', () => {
  const hostname = 'host';
  const port = '1234';

  test('without protocol', () => {
    const server = hostname + ':' + port;
    const m = new TransportAdapter({ server, clientCallback: () => {} });
    m.connect();
    expect(m.socket.io.engine.hostname).toEqual(hostname);
    expect(m.socket.io.engine.port).toEqual(port);
    expect(m.socket.io.engine.secure).toEqual(false);
  });

  test('without trailing slash', () => {
    const server = 'http://' + hostname + ':' + port;
    const m = new SocketIOTransport({ server, clientCallback: () => {} });
    m.connect();
    expect((m.socket.io as any).uri).toEqual(server + '/default');
  });

  test('https', () => {
    const serverWithProtocol = 'https://' + hostname + ':' + port + '/';
    const m = new TransportAdapter({
      server: serverWithProtocol,
      clientCallback: () => {},
    });
    m.connect();
    expect(m.socket.io.engine.hostname).toEqual(hostname);
    expect(m.socket.io.engine.port).toEqual(port);
    expect(m.socket.io.engine.secure).toEqual(true);
  });

  test('http', () => {
    const serverWithProtocol = 'http://' + hostname + ':' + port + '/';
    const m = new TransportAdapter({
      server: serverWithProtocol,
      clientCallback: () => {},
    });
    m.connect();
    expect(m.socket.io.engine.hostname).toEqual(hostname);
    expect(m.socket.io.engine.port).toEqual(port);
    expect(m.socket.io.engine.secure).toEqual(false);
  });

  test('no server set', () => {
    const m = new TransportAdapter({ clientCallback: () => {} });
    m.connect();
    expect(m.socket.io.engine.hostname).not.toEqual(hostname);
    expect(m.socket.io.engine.port).not.toEqual(port);
  });
});
