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
import { createGameReducer } from '../../core/reducer';
import { createStore } from 'redux';
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

  const store = {
    getState: () => ({ log }),
  };

  const gamelog = Enzyme.mount(<GameLog store={store} />);
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
  const reducer = createGameReducer({ game });
  const store = createStore(reducer);

  store.dispatch(makeMove('A', [1]));
  store.dispatch(gameEvent('endTurn'));
  // Also ends turn automatically.
  store.dispatch(makeMove('A', [42]));
  store.dispatch(makeMove('A', [2]));
  store.dispatch(gameEvent('endTurn'));

  const root = Enzyme.mount(<GameLog store={store} />);

  expect(store.getState().G).toMatchObject({ arg: 2 });
  root
    .find('.log-turn')
    .at(0)
    .simulate('mouseover');
  expect(store.getState().G).toMatchObject({ arg: 1 });
  root
    .find('.log-turn')
    .at(0)
    .simulate('mouseout');
  expect(store.getState().G).toMatchObject({ arg: 2 });
  root
    .find('.log-turn')
    .at(1)
    .simulate('mouseover');
  expect(store.getState().G).toMatchObject({ arg: 42 });
  root
    .find('.log-turn')
    .at(0)
    .simulate('mouseout');
  expect(store.getState().G).toMatchObject({ arg: 2 });
});
