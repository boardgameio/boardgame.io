/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import Game from './game';
import { createStore } from 'redux';
import { Flow, createEventDispatchers, DEFAULT } from './flow';

const flow = Flow({
  events: {
    endTurn() {
      return { end: true };
    }
  }
});

const game = Game({ flow: () => flow });

test('basic', () => {
  expect(Flow({}).eventNames).toEqual([]);
  expect(flow.eventNames).toEqual(['endTurn']);
});

test('dispatchers', () => {
  const store = createStore(flow.reducer);
  const api = createEventDispatchers(game.flow.eventNames, store);
  expect(Object.getOwnPropertyNames(api)).toEqual(['endTurn']);
});

test('default flow', () => {
  const flow = DEFAULT(game);

  let ctx = flow.setup(2);
  expect(ctx.turn).toBe(0);
  ctx = flow.reducer(ctx, { type: 'endTurn' });
  expect(ctx.turn).toBe(1);
});
