/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { FlowWithPhases } from './flow';
import { TurnOrder } from './turn-order';

test('turnOrder', () => {
  let flow = FlowWithPhases({
    phases: [{ name: 'A' }],
  });

  let state = { ctx: flow.ctx(10) };
  state = flow.init(state);
  expect(state.ctx.currentPlayer).toBe('0');
  state = flow.processGameEvent(state, { type: 'endTurn' });
  expect(state.ctx.currentPlayer).toBe('1');

  flow = FlowWithPhases({
    phases: [{ name: 'A', turnOrder: TurnOrder.ANY }],
  });

  state = { ctx: flow.ctx(10) };
  state = flow.init(state);
  expect(state.ctx.currentPlayer).toBe('any');
  state = flow.processGameEvent(state, { type: 'endTurn' });
  expect(state.ctx.currentPlayer).toBe('any');

  flow = FlowWithPhases({
    phases: [{ name: 'A', turnOrder: { first: () => '10', next: () => '3' } }],
  });

  state = { ctx: flow.ctx(10) };
  state = flow.init(state);
  expect(state.ctx.currentPlayer).toBe('10');
  state = flow.processGameEvent(state, { type: 'endTurn' });
  expect(state.ctx.currentPlayer).toBe('3');

  flow = FlowWithPhases({
    phases: [{ name: 'A', turnOrder: TurnOrder.SKIP }],
  });

  state = { ctx: flow.ctx(3) };
  state = flow.init(state);
  expect(state.ctx.allPassed).toBe(false);

  state = flow.processGameEvent(state, { type: 'pass' });
  expect(state.ctx.allPassed).toBe(false);

  state = flow.processGameEvent(state, { type: 'endTurn' });
  expect(state.ctx.allPassed).toBe(false);

  state = flow.processGameEvent(state, { type: 'pass' });
  expect(state.ctx.allPassed).toBe(false);
  expect(state.ctx.currentPlayer).toBe('1');

  state = flow.processGameEvent(state, { type: 'endTurn' });
  expect(state.ctx.allPassed).toBe(false);
  expect(state.ctx.currentPlayer).toBe('1');

  state = flow.processGameEvent(state, { type: 'pass' });
  expect(state.ctx.allPassed).toBe(true);
  expect(state.ctx.currentPlayer).toBe(undefined);

  state = flow.processGameEvent(state, { type: 'pass' });
  expect(state.ctx.allPassed).toBe(true);
  expect(state.ctx.currentPlayer).toBe(undefined);
});
