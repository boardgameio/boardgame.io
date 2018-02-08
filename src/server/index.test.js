/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import Server from './index';
import Game from '../core/game';
import * as ActionCreators from '../core/action-creators';
import * as Redux from 'redux';

jest.mock('koa-socket', () => {
  class MockSocket {
    constructor() {
      this.id = 'id';
      this.callbacks = {};
      this.emit = jest.fn();
      this.broadcast = { emit: jest.fn() };
    }

    receive(type, ...args) {
      this.callbacks[type](args[0], args[1], args[2], args[3], args[4]);
    }

    on(type, callback) {
      this.callbacks[type] = callback;
    }

    to() {
      return {
        broadcast: this.broadcast,
        emit: this.emit,
      };
    }

    join() {}
  }

  class MockIO {
    constructor() {
      this.socket = new MockSocket();
    }
    attach(app) {
      app.io = app._io = this;
    }
    of() {
      return this;
    }
    on(type, callback) {
      callback(this.socket);
    }
  }

  return MockIO;
});

const game = Game({});

test('basic', () => {
  const server = Server({ games: [game] });
  const io = server.context.io;
  expect(server).not.toBe(undefined);
  io.socket.receive('disconnect');
});

test('sync', () => {
  const server = Server({ games: [game] });
  const io = server.context.io;
  expect(server).not.toBe(undefined);

  const spy = jest.spyOn(Redux, 'createStore');

  // Sync causes the server to respond.
  expect(io.socket.emit).toHaveBeenCalledTimes(0);
  io.socket.receive('sync', 'gameID');
  expect(io.socket.emit).toHaveBeenCalledTimes(1);
  expect(spy).toHaveBeenCalled();

  // Sync a second time does not create a game.
  spy.mockReset();
  io.socket.receive('sync', 'gameID');
  expect(io.socket.emit).toHaveBeenCalledTimes(2);
  expect(spy).not.toHaveBeenCalled();

  spy.mockRestore();
});

test('action', () => {
  const server = Server({ games: [game] });
  const io = server.context.io;
  const action = ActionCreators.gameEvent('endTurn');

  io.socket.receive('action', action);
  expect(io.socket.emit).toHaveBeenCalledTimes(0);
  io.socket.emit.mockReset();

  io.socket.receive('sync', 'gameID', '0', 2);
  io.socket.id = 'second';
  io.socket.receive('sync', 'gameID', '1', 2);
  io.socket.emit.mockReset();

  // View-only players cannot send actions.
  io.socket.receive('action', action, 0, 'gameID', null);
  expect(io.socket.emit).not.toHaveBeenCalled();

  // Actions are broadcasted as state updates.
  // The playerID parameter is necessary to account for view-only players.
  io.socket.receive('action', action, 0, 'gameID', '0');
  expect(io.socket.emit).lastCalledWith('sync', 'gameID', {
    G: {},
    _id: 1,
    _initial: {
      G: {},
      _id: 0,
      _initial: {},
      ctx: {
        currentPlayer: '0',
        currentPlayerMoves: 0,
        numPlayers: 2,
        phase: 'default',
        turn: 0,
      },
      log: [],
    },
    ctx: {
      currentPlayer: '1',
      currentPlayerMoves: 0,
      numPlayers: 2,
      phase: 'default',
      turn: 1,
    },
    log: [
      {
        payload: { args: undefined, playerID: undefined, type: 'endTurn' },
        type: 'GAME_EVENT',
      },
    ],
  });
  io.socket.emit.mockReset();

  // ... but not if the gameID is not known.
  io.socket.receive('action', action, 1, 'unknown', '1');
  expect(io.socket.emit).toHaveBeenCalledTimes(0);

  // ... and not if the _id doesn't match the internal state.
  io.socket.receive('action', action, 100, 'gameID', '1');
  expect(io.socket.emit).toHaveBeenCalledTimes(0);

  // ... and not if player != currentPlayer
  io.socket.receive('action', action, 1, 'gameID', '100');
  expect(io.socket.emit).toHaveBeenCalledTimes(0);

  // Another broadcasted action.
  io.socket.receive('action', action, 1, 'gameID', '1');
  expect(io.socket.emit).toHaveBeenCalledTimes(2);
});

test('playerView (sync)', () => {
  // Write the player into G.
  const game = Game({
    playerView: (G, ctx, player) => {
      return { ...G, player };
    },
  });

  const server = Server({ games: [game] });
  const io = server.context.io;

  io.socket.receive('sync', 'gameID', 0);
  expect(io.socket.emit).toHaveBeenCalledTimes(1);
  expect(io.socket.emit.mock.calls[0][2].G).toEqual({ player: 0 });
});

test('playerView (action)', () => {
  const game = Game({
    playerView: (G, ctx, player) => {
      return { ...G, player };
    },
  });
  const server = Server({ games: [game] });
  const io = server.context.io;
  const action = ActionCreators.gameEvent('endTurn');

  io.socket.id = 'first';
  io.socket.receive('sync', 'gameID', '0', 2);
  io.socket.id = 'second';
  io.socket.receive('sync', 'gameID', '1', 2);
  io.socket.emit.mockReset();

  io.socket.receive('action', action, 0, 'gameID', '0');
  expect(io.socket.emit).toHaveBeenCalledTimes(2);

  const G_player0 = io.socket.emit.mock.calls[0][2].G;
  const G_player1 = io.socket.emit.mock.calls[1][2].G;

  expect(G_player0.player).toBe('0');
  expect(G_player1.player).toBe('1');
});

test('custom db implementation', () => {
  let getId = null;
  class Custom {
    get(id) {
      getId = id;
    }
    set() {}
  }

  const game = Game({});
  const server = Server({ games: [game], db: new Custom() });
  const io = server.context.io;

  io.socket.receive('sync', 'gameID');
  expect(getId).toBe('gameID');
});
