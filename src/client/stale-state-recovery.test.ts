/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 *
 * Recovery harness for client/server divergence (stale `_stateID`).
 *
 * When a client optimistically applies a move the server rejects, the client
 * stays one state ahead and the master silently drops every later action from
 * that seat. These tests stand up a real `Master` behind a real
 * `SocketIOTransport` (with a scripted socket acting as the server) and assert
 * the client re-syncs to the server's truth and its next move lands.
 */

import { Client } from './client';
import { SocketIOTransport } from './transport/socketio';
import { Master } from '../master/master';
import { InMemory } from '../server/db/inmemory';
import { getFilterPlayerView } from '../master/filter-player-view';
import { ProcessGameConfig } from '../core/game';
import { INVALID_MOVE } from '../core/constants';
import { PlayerView } from '../core/player-view';
import type { Game, State } from '../types';
import type * as ioNamespace from 'socket.io-client';

jest.mock('../core/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
}));

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

/** Yield the event loop so the client⇄master round trip settles. */
const settle = () => new Promise((resolve) => setTimeout(resolve, 0));

/**
 * A move the client's stripped view lets through but the server rejects:
 * the same verdict divergence that stranded production match AJK4flQ0lpW.
 */
const game: Game = {
  setup: () => ({ secret: 'poison', applied: [] }),
  playerView: PlayerView.STRIP_SECRETS,
  moves: {
    poison: ({ G }) => {
      if (G.secret !== undefined) return INVALID_MOVE;
      G.applied.push('poison');
    },
    safe: ({ G }) => {
      G.applied.push('safe');
    },
  },
};

function setup() {
  const clientGame = ProcessGameConfig(game);
  const filterPlayerView = getFilterPlayerView(clientGame);
  const socket = new MockSocket();
  const db = new InMemory();
  const master = new Master(game, db, {
    send: ({ playerID, ...data }) =>
      socket.receive(data.type, ...filterPlayerView(playerID, data).args),
    sendAll: (data) =>
      socket.receive(data.type, ...filterPlayerView('0', data).args),
  });

  // The client→server half of the socket, mirroring the real socket.io
  // server wiring: rejected actions are reported back as `updateError`.
  socket.emit.mockImplementation((type: string, ...args: any[]) => {
    if (type === 'sync') {
      void master.onSync(...(args as Parameters<Master['onSync']>));
    }
    if (type === 'update') {
      void master
        .onUpdate(...(args as Parameters<Master['onUpdate']>))
        .then((result) => {
          if (result && result.error) {
            socket.receive('updateError', args[2], result.error);
          }
        });
    }
  });

  const client = Client({
    game,
    matchID: 'matchID',
    playerID: '0',
    multiplayer: (transportOpts) =>
      new SocketIOTransport({
        ...transportOpts,
        socket: socket as unknown as ioNamespace.Socket,
      }),
  });

  return { client, socket, db };
}

describe('stale state recovery', () => {
  test('client one state ahead resyncs to the server and its next move lands', async () => {
    const { client, socket, db } = setup();

    client.start();
    socket.callbacks['connect']();
    await settle();
    expect(client.getState()._stateID).toBe(0);

    // The client optimistically applies a move the server rejects.
    client.moves.poison();
    expect(client.getState()._stateID).toBe(1);
    expect(client.getState().G.applied).toEqual(['poison']);
    await settle();

    // The client has accepted the server's truth: the rejected move is gone.
    expect(client.getState()._stateID).toBe(0);
    expect(client.getState().G.applied).toEqual([]);

    // The next move is accepted and lands on both sides.
    client.moves.safe();
    await settle();
    expect(client.getState()._stateID).toBe(1);
    expect(client.getState().G.applied).toEqual(['safe']);
    const { state } = db.fetch('matchID', { state: true }) as {
      state: State;
    };
    expect(state.G.applied).toEqual(['safe']);

    client.stop();
  });

  test('an in-sync client whose move the server rejects also resyncs', async () => {
    const { client, socket, db } = setup();

    client.start();
    socket.callbacks['connect']();
    await settle();
    expect(client.getState()._stateID).toBe(0);

    client.moves.poison();
    await settle();

    // Same outcome as the stale case, reached on the first rejection
    // (before any subsequent action can go stale).
    expect(client.getState()._stateID).toBe(0);
    expect(client.getState().G.applied).toEqual([]);
    const { state } = db.fetch('matchID', { state: true }) as {
      state: State;
    };
    expect(state.G.applied).toEqual([]);

    client.stop();
  });

  test('sync info reaches the client filtered', async () => {
    const { client, socket } = setup();

    client.start();
    socket.callbacks['connect']();
    await settle();

    // STRIP_SECRETS removed the poison trigger from the client's view.
    expect(client.getState().G.secret).toBeUndefined();

    client.stop();
  });
});
