/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { Events } from './events';
import { Client } from '../../client/client';
import { error } from '../../core/logger';
import type { Game, Ctx } from '../../types';

jest.mock('../../core/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
}));
afterEach(jest.clearAllMocks);

test('constructor', () => {
  const flow = {} as Game['flow'];
  const playerID = '0';
  const e = new Events(flow, { phase: '', turn: 0 } as Ctx, playerID);
  expect(e.flow).toBe(flow);
  expect(e.playerID).toBe(playerID);
  expect(e.dispatch).toEqual([]);
  expect(e.initialTurn).toEqual(0);
  expect(e.currentPhase).toEqual('');
  expect(e.currentTurn).toEqual(0);
});

test('dispatch', () => {
  const flow = { eventNames: ['A', 'B'] } as Game['flow'];
  const e = new Events(flow, { phase: '', turn: 0 } as Ctx);
  const events = e.api();

  expect(e.dispatch).toEqual([]);
  (events as unknown as { A(): void }).A();
  (events as unknown as { B(): void }).B();
  expect(e.dispatch).toEqual([
    {
      type: 'A',
      args: [],
      phase: '',
      turn: 0,
      calledFrom: undefined,
      error: expect.any(Error),
    },
    {
      type: 'B',
      args: [],
      phase: '',
      turn: 0,
      calledFrom: undefined,
      error: expect.any(Error),
    },
  ]);
});

test('update ctx', () => {
  const game: Game = {
    moves: {
      A: ({ G, events }) => {
        events.endTurn();
        return G;
      },
    },
  };
  const client = Client({ game });
  expect(client.getState().ctx.turn).toBe(1);
  client.moves.A();
  expect(client.getState().ctx.turn).toBe(2);
});

test('no duplicate endTurn', () => {
  const game: Game = {
    turn: {
      onEnd: ({ events }) => {
        events.endTurn();
      },
    },
  };
  const client = Client({ game });
  expect(client.getState().ctx.turn).toBe(1);
  client.events.endTurn();
  expect(client.getState().ctx.turn).toBe(1);
  expect(error).toHaveBeenCalled();
});

test('no duplicate endPhase', () => {
  const game: Game = {
    phases: {
      A: {
        start: true,
        onEnd: ({ events }) => {
          events.setPhase('C');
        },
      },
      B: {},
      C: {},
    },
  };
  const client = Client({ game });
  expect(client.getState().ctx.phase).toBe('A');
  client.events.setPhase('B');
  expect(client.getState().ctx.phase).toBe('A');
  expect(error).toHaveBeenCalled();
});
