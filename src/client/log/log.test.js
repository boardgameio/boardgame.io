/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import { makeMove, gameEvent } from '../../core/action-creators';
import Game from '../../core/game';
import { GameLog } from './log';
import { CreateGameReducer } from '../../core/reducer';
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

Enzyme.configure({ adapter: new Adapter() });

test('GameLog', () => {
  const log = [
    makeMove('moveA'),
    gameEvent('endTurn'),
    makeMove('moveB'),
    gameEvent('endTurn'),
  ];

  const gamelog = Enzyme.mount(<GameLog log={log} initialState={{}} />);
  const turns = gamelog.find('.id').map(div => div.text());
  expect(turns).toEqual(['Turn #1', 'Turn #2']);
});

test('GameLog rewind', () => {
  const game = Game({
    moves: {
      A: (G, ctx, arg) => {
        return { arg };
      },
    },

    flow: {
      endTurnIf: G => G && G.arg == 42,
    },
  });

  const reducer = CreateGameReducer({ game });
  let state = reducer(undefined, { type: 'init' });
  const initialState = state;

  state = reducer(state, makeMove('A', [1]));
  state = reducer(state, gameEvent('endTurn'));
  // Also ends turn automatically.
  state = reducer(state, makeMove('A', [42]));
  state = reducer(state, makeMove('A', [2]));
  state = reducer(state, gameEvent('endTurn'));

  const root = Enzyme.mount(
    <GameLog
      log={state.log}
      initialState={initialState}
      onHover={({ state: t }) => {
        state = t;
      }}
      reducer={reducer}
    />
  );

  expect(state.G).toMatchObject({ arg: 2 });

  root
    .find('.log-turn')
    .at(0)
    .simulate('mouseenter');

  expect(state.G).toMatchObject({ arg: 1 });

  root
    .find('.log-turn')
    .at(1)
    .simulate('mouseenter');

  expect(state.G).toMatchObject({ arg: 42 });

  root
    .find('.log-turn')
    .at(0)
    .simulate('mouseleave');

  expect(state).toBe(null);
});
