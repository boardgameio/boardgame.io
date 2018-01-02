/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import Game from './game';
import { createGameFlow } from './flow';
import { endTurn } from './action-creators';

const game = Game({});

test('basic', () => {
  const reducer = createGameFlow({game});

  let state = undefined;
  state = reducer(state, {});
  expect(state.turn).toBe(0);
  state = reducer(state, endTurn());
  expect(state.turn).toBe(1);
});

test('flow reducer override', () => {
  const flow = () => {};
  const game = Game({ flow });
  const reducer = createGameFlow({game});
  expect(reducer).toBe(flow);
});
