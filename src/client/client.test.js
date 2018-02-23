/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { createStore } from 'redux';
import { createGameReducer } from '../core/reducer';
import {
  Client,
  createEventDispatchers,
  createMoveDispatchers,
} from './client';
import Game from '../core/game';

test('move api', () => {
  const client = Client({
    game: Game({
      moves: {
        A: (G, ctx, arg) => ({ arg }),
      },
    }),
  });

  expect(client.store.getState().G).toEqual({});
  client.moves.A(42);
  expect(client.store.getState().G).toEqual({ arg: 42 });
});

test('multiplayer server set when provided', () => {
  let host = 'host';
  let port = '4321';

  const client = Client({
    game: Game({}),
    multiplayer: { server: host + ':' + port },
  });

  client.connect();

  expect(client.multiplayerClient.socket.io.engine.hostname).toEqual(host);
  expect(client.multiplayerClient.socket.io.engine.port).toEqual(port);
});

test('event dispatchers', () => {
  {
    const game = Game({});
    const reducer = createGameReducer({ game, numPlayers: 2 });
    const store = createStore(reducer);
    const api = createEventDispatchers(game.flow.eventNames, store);
    expect(Object.getOwnPropertyNames(api)).toEqual(['endTurn']);
    expect(store.getState().ctx.turn).toBe(0);
    api.endTurn();
    expect(store.getState().ctx.turn).toBe(1);
  }

  {
    const game = Game({
      flow: {
        endPhase: true,
      },
    });
    const reducer = createGameReducer({ game, numPlayers: 2 });
    const store = createStore(reducer);
    const api = createEventDispatchers(game.flow.eventNames, store);
    expect(Object.getOwnPropertyNames(api)).toEqual(['endTurn', 'endPhase']);
    expect(store.getState().ctx.turn).toBe(0);
    api.endTurn();
    expect(store.getState().ctx.turn).toBe(1);
  }

  {
    const game = Game({
      flow: {
        endTurn: false,
      },
    });
    const reducer = createGameReducer({ game, numPlayers: 2 });
    const store = createStore(reducer);
    const api = createEventDispatchers(game.flow.eventNames, store);
    expect(Object.getOwnPropertyNames(api)).toEqual([]);
  }
});

test('move dispatchers', () => {
  const game = Game({
    moves: {
      A: G => G,
      B: () => ({ moved: true }),
      C: () => ({ victory: true }),
    },
    flow: {
      endGameIf: (G, ctx) => (G.victory ? ctx.currentPlayer : undefined),
    },
  });

  const reducer = createGameReducer({ game });
  const store = createStore(reducer);
  const api = createMoveDispatchers(game.moveNames, store);

  expect(Object.getOwnPropertyNames(api)).toEqual(['A', 'B', 'C']);
  expect(api.unknown).toBe(undefined);

  api.A();
  expect(store.getState().G).not.toMatchObject({ moved: true });
  expect(store.getState().G).not.toMatchObject({ victory: true });

  api.B();
  expect(store.getState().G).toMatchObject({ moved: true });

  api.C();
  expect(store.getState().G).toMatchObject({ victory: true });
});
