/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { Events } from './events';
import { makeMove } from './action-creators';
import Game from './game';
import { CreateGameReducer } from './reducer';

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
  expect(e.dispatch).toEqual([{ key: 'A', args: [] }, { key: 'B', args: [] }]);
});

test('update ctx', () => {
  const game = Game({
    moves: {
      A: (G, ctx) => {
        ctx.events.endTurn();
        return G;
      },
    },
  });
  const reducer = CreateGameReducer({ game, numPlayers: 2 });

  let state = reducer(undefined, { type: 'init' });
  expect(state.ctx.turn).toBe(0);
  state = reducer(state, makeMove('A'));
  expect(state.ctx.turn).toBe(1);
});
