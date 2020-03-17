/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { Events } from './events';
import { Client } from '../../client/client';

test('constructor', () => {
  const flow = {};
  const playerID = '0';
  const e = new Events(flow, playerID);
  expect(e.flow).toBe(flow);
  expect(e.playerID).toBe(playerID);
  expect(e.dispatch).toEqual([]);
});

test('dispatch', () => {
  const flow = { eventNames: ['A', 'B'] };
  const e = new Events(flow);
  const events = e.api({ phase: '', turn: 0 });

  expect(e.dispatch).toEqual([]);
  events.A();
  events.B();
  expect(e.dispatch).toEqual([
    { key: 'A', args: [], phase: '', turn: 0 },
    { key: 'B', args: [], phase: '', turn: 0 },
  ]);
});

test('update ctx', () => {
  const game = {
    moves: {
      A: (G, ctx) => {
        ctx.events.endTurn();
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
  const game = {
    turn: {
      onEnd: (G, ctx) => {
        ctx.events.endTurn();
      },
    },
  };
  const client = Client({ game });
  expect(client.getState().ctx.turn).toBe(1);
  client.events.endTurn();
  expect(client.getState().ctx.turn).toBe(2);
});

test('no duplicate endPhase', () => {
  const game = {
    phases: {
      A: {
        start: true,
        onEnd: (G, ctx) => {
          ctx.events.setPhase('C');
        },
      },
      B: {},
      C: {},
    },
  };
  const client = Client({ game });
  expect(client.getState().ctx.phase).toBe('A');
  client.events.setPhase('B');
  expect(client.getState().ctx.phase).toBe('B');
});
