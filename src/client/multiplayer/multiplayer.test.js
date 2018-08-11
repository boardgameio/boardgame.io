/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { Multiplayer } from './multiplayer';
import Game from '../../core/game';
import { makeMove } from '../../core/action-creators';
import { CreateGameReducer } from '../../core/reducer';
import * as ActionCreators from '../../core/action-creators';
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

test('Multiplayer defaults', () => {
  const m = new Multiplayer();
  expect(typeof m.callback).toBe('function');
  m.callback();
});

describe('update gameID / playerID', () => {
  const socket = new MockSocket();
  const m = new Multiplayer({ socket });
  const game = Game({});
  m.createStore(CreateGameReducer({ game }));

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
  const m = new Multiplayer({
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
  const m = new Multiplayer({ socket: mockSocket });
  m.connect();
  const game = Game({});
  let store = null;

  beforeEach(() => {
    store = m.createStore(CreateGameReducer({ game }));
  });

  test('returns a valid store', () => {
    expect(store).not.toBe(undefined);
  });

  test('client sends update after action', () => {
    const action = ActionCreators.gameEvent('endTurn');
    mockSocket.emit = jest.fn();
    store.dispatch(action);
    expect(mockSocket.emit).lastCalledWith(
      'update',
      action,
      0,
      'default:default',
      null
    );
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
});

describe('move blacklist', () => {
  const mockSocket = new MockSocket();
  const m = new Multiplayer({ socket: mockSocket });
  const game = Game({});
  const store = m.createStore(CreateGameReducer({ game }));

  mockSocket.emit = jest.fn();

  beforeEach(() => mockSocket.emit.mockReset());

  test('should emit', () => {
    const endTurn = ActionCreators.gameEvent('endTurn');
    store.dispatch(endTurn);
    expect(mockSocket.emit).toHaveBeenCalled();
  });

  test('should emit', () => {
    store.dispatch(ActionCreators.makeMove());
    expect(mockSocket.emit).toHaveBeenCalled();
  });

  test('should not emit', () => {
    store.dispatch(ActionCreators.sync());
    expect(mockSocket.emit).not.toHaveBeenCalled();
  });

  test('should not emit', () => {
    store.dispatch(ActionCreators.update());
    expect(mockSocket.emit).not.toHaveBeenCalled();
  });
});

describe('server option', () => {
  const hostname = 'host';
  const port = '1234';

  test('without protocol', () => {
    const server = hostname + ':' + port;
    const m = new Multiplayer({ server });
    m.connect();
    expect(m.socket.io.engine.hostname).toEqual(hostname);
    expect(m.socket.io.engine.port).toEqual(port);
    expect(m.socket.io.engine.secure).toEqual(false);
  });

  test('https', () => {
    const serverWithProtocol = 'https://' + hostname + ':' + port + '/';
    const m = new Multiplayer({ server: serverWithProtocol });
    m.connect();
    expect(m.socket.io.engine.hostname).toEqual(hostname);
    expect(m.socket.io.engine.port).toEqual(port);
    expect(m.socket.io.engine.secure).toEqual(true);
  });

  test('http', () => {
    const serverWithProtocol = 'http://' + hostname + ':' + port + '/';
    const m = new Multiplayer({ server: serverWithProtocol });
    m.connect();
    expect(m.socket.io.engine.hostname).toEqual(hostname);
    expect(m.socket.io.engine.port).toEqual(port);
    expect(m.socket.io.engine.secure).toEqual(false);
  });

  test('no server set', () => {
    const m = new Multiplayer();
    m.connect();
    expect(m.socket.io.engine.hostname).not.toEqual(hostname);
    expect(m.socket.io.engine.port).not.toEqual(port);
  });
});

test('game server accepts enhanced store', () => {
  let spyDispatcher;
  const spyEnhancer = vanillaCreateStore => (...args) => {
    const vanillaStore = vanillaCreateStore(...args);
    return {
      ...vanillaStore,
      dispatch: (spyDispatcher = jest.fn(vanillaStore.dispatch)),
    };
  };

  const mockSocket = new MockSocket();
  const m = new Multiplayer({ socket: mockSocket });
  m.connect();
  const game = Game({
    moves: {
      A: (G, ctx, arg) => ({ arg }),
    },
  });
  const store = m.createStore(CreateGameReducer({ game }), spyEnhancer);
  // console.log(spyDispatcher.mock);
  expect(spyDispatcher.mock.calls.length).toBe(0);
  store.dispatch(makeMove('A', {}));
  expect(spyDispatcher.mock.calls.length).toBe(1);
});

test('changing a gameID resets the state before resync', () => {
  const m = new Multiplayer();
  const game = Game({});
  const store = m.createStore(CreateGameReducer({ game }));
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
  const m = new Multiplayer();
  const game = Game({});
  const store = m.createStore(CreateGameReducer({ game }));
  const dispatchSpy = jest.spyOn(store, 'dispatch');

  m.updatePlayerID('foo');

  expect(dispatchSpy).toHaveBeenCalledWith(
    expect.objectContaining({
      type: Actions.RESET,
      clientOnly: true,
    })
  );
});
