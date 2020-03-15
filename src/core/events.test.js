/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { Events } from './events';
import { Client } from '../client/client';

test('constructor', () => {
  const flow = {};
  const playerID = '0';
  const e = new Events(flow, playerID);
  expect(e.flow).toBe(flow);
  expect(e.playerID).toBe(playerID);
  expect(e.dispatch).toEqual([]);
});

test('attach / detach', () => {
  const flow = { eventNames: ['A', 'B'] };
  const e = new Events(flow);
  const ctx = e.attach({});

  expect(ctx.events.A).toBeDefined();
  expect(ctx.events.B).toBeDefined();

  const t = Events.detach(ctx);
  expect(t.events).not.toBeDefined();
});

test('dispatch', () => {
  const flow = { eventNames: ['A', 'B'] };
  const e = new Events(flow);
  const ctx = e.attach({});

  expect(e.dispatch).toEqual([]);
  ctx.events.A();
  ctx.events.B();
  expect(e.dispatch).toEqual([
    { key: 'A', args: [] },
    { key: 'B', args: [] },
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
