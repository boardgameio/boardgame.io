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
import { ProcessGameConfig } from '../../core/game';
import { ActionErrorType } from '../../core/errors';

jest.mock('../../core/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
}));

type UpdateArgs = Parameters<Master['onUpdate']>;
type SyncArgs = Parameters<Master['onSync']>;

class MockSocket {
  callbacks: Record<string, (...args: any[]) => void>;
  emit: jest.Mock;

  constructor() {
    this.callbacks = {};
    this.emit = jest.fn();
  }

  receive(type: string, ...args) {
    this.callbacks[type](...args);
  }

  on(type: string, callback: (...args: any[]) => void) {
    this.callbacks[type] = callback;
  }

  close() {}
}

test('defaults', () => {
  const m = new SocketIOTransport({
    transportDataCallback: () => {},
    game: ProcessGameConfig({}),
    gameKey: {},
  });
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
  const m = new TransportAdapter({
    socket,
    transportDataCallback: () => {},
    game: ProcessGameConfig({}),
    gameKey: {},
  });

  beforeEach(() => (socket.emit = jest.fn()));

  test('matchID', () => {
    m.updateMatchID('test');
    expect(m.getMatchID()).toBe('test');
    const args: SyncArgs = ['test', null, undefined, 2];
    expect(socket.emit).toHaveBeenLastCalledWith('sync', ...args);
  });

  test('playerID', () => {
    m.updatePlayerID('player');
    expect(m.getPlayerID()).toBe('player');
    const args: SyncArgs = ['test', 'player', undefined, 2];
    expect(socket.emit).toHaveBeenLastCalledWith('sync', ...args);
  });

  test('credentials', () => {
    m.updateCredentials('1234');
    expect(m.getCredentials()).toBe('1234');
    const args: SyncArgs = ['test', 'player', '1234', 2];
    expect(socket.emit).toHaveBeenLastCalledWith('sync', ...args);
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
      game: ProcessGameConfig({}),
      gameKey: {},
      numPlayers: 2,
      transportDataCallback: () => {},
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
    const transportDataCallback = jest.fn();
    const transport = new SocketIOTransport({
      transportDataCallback,
      game: ProcessGameConfig({}),
      gameKey: {},
    });
    transport.requestSync();
    expect(transportDataCallback).not.toHaveBeenCalled();
  });
});

describe('multiplayer', () => {
  const mockSocket = new MockSocket();
  const transportDataCallback = jest.fn();
  const transport = new TransportAdapter({
    socket: mockSocket,
    transportDataCallback,
    game: ProcessGameConfig({}),
    gameKey: {},
  });
  transport.connect();

  beforeEach(jest.clearAllMocks);

  test('receive update', () => {
    const restored: { restore: boolean; _stateID?: number } = { restore: true };
    mockSocket.receive('update', 'default', restored);
    expect(transportDataCallback).toHaveBeenCalledWith({
      type: 'update',
      args: ['default', restored, undefined],
    });
  });

  test('receive sync', () => {
    const restored = { restore: true };
    mockSocket.receive('sync', 'default', { state: restored });
    expect(transportDataCallback).toHaveBeenCalledWith({
      type: 'sync',
      args: ['default', { state: restored }],
    });
  });

  test('receive matchData', () => {
    const matchData = [{ id: '0', name: 'Alice' }];
    mockSocket.receive('matchData', 'default', matchData);
    expect(transportDataCallback).toHaveBeenCalledWith({
      type: 'matchData',
      args: ['default', matchData],
    });
  });

  test('send update', () => {
    const action = makeMove(undefined, undefined, undefined);
    const state = { _stateID: 0 } as State;
    transport.sendAction(state, action, 7);
    const args: UpdateArgs = [action, state._stateID, 'default', null, 7];
    expect(mockSocket.emit).toHaveBeenLastCalledWith('update', ...args);
  });

  test('receive chat-message', () => {
    const chatData = { message: 'foo' };
    mockSocket.receive('chat', 'default', chatData);
    expect(transportDataCallback).toHaveBeenCalledWith({
      type: 'chat',
      args: ['default', chatData],
    });
  });

  test('receive action result', () => {
    const result = {
      error: {
        type: ActionErrorType.InvalidMove,
        payload: { reason: 'not allowed' },
      },
    };
    mockSocket.receive('actionResult', 'default', 7, result);
    expect(transportDataCallback).toHaveBeenCalledWith({
      type: 'actionResult',
      args: ['default', 7, result],
    });
  });

  test('send chat-message', () => {
    const message: ChatMessage = {
      id: '0',
      sender: '0',
      payload: { message: 'foo' },
    };
    transport.sendChatMessage('matchID', message);
    expect(mockSocket.emit).toHaveBeenLastCalledWith(
      'chat',
      'matchID',
      message,
      transport.getCredentials(),
    );
  });
});

describe('multiplayer delta state', () => {
  const mockSocket = new MockSocket();
  const transportDataCallback = jest.fn();
  const transport = new TransportAdapter({
    socket: mockSocket,
    transportDataCallback,
    game: ProcessGameConfig({}),
    gameKey: {},
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
    expect(transportDataCallback).toHaveBeenCalledWith({
      type: 'patch',
      args: patch1,
    });
  });
});

describe('server option', () => {
  const hostname = 'host';
  const port = '1234';
  let m: TransportAdapter;
  afterEach(() => {
    m?.disconnect();
  });

  // socketOpts: { autoConnect: false } prevents socket.io-client from opening
  // the engine.io transport. Without it, every `m.connect()` here starts an
  // XHR long-poll that never resolves, leaking handles and forcing jest's
  // worker to be terminated non-gracefully. With autoConnect off, the Manager
  // is constructed and the URL is parsed, but no engine is created — so we
  // assert on the Manager's `uri` (the only post-parse value it exposes
  // before open). hostname/port/secure live on the engine.io Socket, which
  // is never instantiated; see node_modules/engine.io-client/build/cjs/socket.js.
  const noConnect = { socketOpts: { autoConnect: false } };

  test('without protocol', () => {
    const server = hostname + ':' + port;
    m = new TransportAdapter({
      server,
      transportDataCallback: () => {},
      game: ProcessGameConfig({}),
      gameKey: {},
      ...noConnect,
    });
    m.connect();
    expect((m.socket.io as any).uri).toEqual(
      'http://' + hostname + ':' + port + '/default',
    );
  });

  test('without trailing slash', () => {
    const server = 'http://' + hostname + ':' + port;
    m = new TransportAdapter({
      server,
      transportDataCallback: () => {},
      game: ProcessGameConfig({}),
      gameKey: {},
      ...noConnect,
    });
    m.connect();
    expect((m.socket.io as any).uri).toEqual(server + '/default');
  });

  test('https', () => {
    const serverWithProtocol = 'https://' + hostname + ':' + port + '/';
    m = new TransportAdapter({
      server: serverWithProtocol,
      transportDataCallback: () => {},
      game: ProcessGameConfig({}),
      gameKey: {},
      ...noConnect,
    });
    m.connect();
    expect((m.socket.io as any).uri).toEqual(
      'https://' + hostname + ':' + port + '/default',
    );
  });

  test('http', () => {
    const serverWithProtocol = 'http://' + hostname + ':' + port + '/';
    m = new TransportAdapter({
      server: serverWithProtocol,
      transportDataCallback: () => {},
      game: ProcessGameConfig({}),
      gameKey: {},
      ...noConnect,
    });
    m.connect();
    expect((m.socket.io as any).uri).toEqual(
      'http://' + hostname + ':' + port + '/default',
    );
  });

  test('no server set', () => {
    m = new TransportAdapter({
      transportDataCallback: () => {},
      game: ProcessGameConfig({}),
      gameKey: {},
      ...noConnect,
    });
    m.connect();
    expect((m.socket.io as any).uri).not.toContain(hostname + ':' + port);
  });
});
