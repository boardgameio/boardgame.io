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
  const turns = gamelog.find('.turn-marker').map(div => div.text());
  expect(turns).toEqual(['Turn #1', 'Turn #2']);
});

describe('time travel', () => {
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

  test('before rewind', () => {
    expect(state.G).toMatchObject({ arg: 2 });
  });

  test('0 - regular move', () => {
    root
      .find('.log-event')
      .at(0)
      .simulate('mouseenter');

    expect(state.G).toMatchObject({ arg: 1 });
    expect(state.ctx.currentPlayer).toBe('0');
  });

  test('1 - regular event', () => {
    root
      .find('.log-event')
      .at(1)
      .simulate('mouseenter');

    expect(state.G).toMatchObject({ arg: 1 });
    expect(state.ctx.currentPlayer).toBe('1');
  });

  test('2 - move with automatic event', () => {
    root
      .find('.log-event')
      .at(2)
      .simulate('mouseenter');

    expect(state.G).toMatchObject({ arg: 42 });
    expect(state.ctx.currentPlayer).toBe('0');
  });

  test('3 - no replaying automatic event', () => {
    root
      .find('.log-event')
      .at(3)
      .simulate('mouseenter');

    expect(state.G).toMatchObject({ arg: 42 });
    expect(state.ctx.currentPlayer).toBe('0');
  });

  test('mouseleave', () => {
    root
      .find('.log-event')
      .at(0)
      .simulate('mouseleave');

    expect(state).toBe(null);
  });
});

describe('pinning', () => {
  const game = Game({
    moves: {
      A: () => ({ A: true }),
      B: () => ({ B: true }),
    },
  });

  const reducer = CreateGameReducer({ game });
  let state = reducer(undefined, { type: 'init' });
  const initialState = state;
  const log = [
    makeMove('A'),
    gameEvent('endTurn'),
    makeMove('B'),
    gameEvent('endTurn'),
  ];

  test('pin', () => {
    const gamelog = Enzyme.mount(
      <GameLog log={log} initialState={initialState} reducer={reducer} />
    );
    gamelog
      .find('.log-event')
      .at(0)
      .simulate('click');
    expect(gamelog.state().pinned).not.toBe(null);
  });

  test('unpin', () => {
    const gamelog = Enzyme.mount(
      <GameLog log={log} initialState={initialState} reducer={reducer} />
    );
    gamelog
      .find('.log-event')
      .at(0)
      .simulate('click');
    gamelog
      .find('.log-event')
      .at(0)
      .simulate('click');
    expect(gamelog.state().pinned).toBe(null);
  });

  test('hover does not trigger', () => {
    const onHover = jest.fn();
    const gamelog = Enzyme.mount(
      <GameLog
        log={log}
        initialState={initialState}
        onHover={onHover}
        reducer={reducer}
      />
    );

    gamelog
      .find('.log-event')
      .at(0)
      .simulate('mouseenter');
    gamelog
      .find('.log-event')
      .at(0)
      .simulate('mouseleave');
    expect(onHover).toHaveBeenCalledTimes(2);

    expect(gamelog.state().pinned).toBe(null);
    gamelog
      .find('.log-event')
      .at(2)
      .simulate('click');
    expect(gamelog.state().pinned).not.toBe(null);

    onHover.mockReset();
    gamelog
      .find('.log-event')
      .at(0)
      .simulate('mouseenter');
    gamelog
      .find('.log-event')
      .at(0)
      .simulate('mouseleave');
    expect(onHover).not.toHaveBeenCalled();
  });
});

test('playerID', () => {
  const log = [makeMove('moveA', [], '1')];

  const gamelog = Enzyme.mount(<GameLog log={log} initialState={{}} />);

  const text = gamelog.find('.player1').map(div => div.text());
  expect(text).toEqual(['moveA()']);
});

test('phase change', () => {
  const log = [
    makeMove('moveA'),
    gameEvent('endPhase'),
    makeMove('moveB'),
    gameEvent('endPhase'),
  ];

  const gamelog = Enzyme.mount(<GameLog log={log} initialState={{}} />);

  const phase0 = gamelog.find('.phase0').map(div => div.text());
  expect(phase0).toEqual(['moveA()']);
  const phase01 = gamelog.find('.phase0to1').map(div => div.text());
  expect(phase01).toEqual(['endPhase()']);
  const phase1 = gamelog.find('.phase1').map(div => div.text());
  expect(phase1).toEqual(['moveB()']);
});
