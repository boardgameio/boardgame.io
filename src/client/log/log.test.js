/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import { Client } from '../client';
import { makeMove, gameEvent } from '../../core/action-creators';
import Game from '../../core/game';
import { GameLog } from './log';
import { CreateGameReducer } from '../../core/reducer';
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

Enzyme.configure({ adapter: new Adapter() });

describe('layout', () => {
  const game = Game({ flow: { phases: [{ name: 'A' }, { name: 'B' }] } });
  const reducer = CreateGameReducer({ game });
  const state = reducer(undefined, { type: 'init' });

  test('sanity', () => {
    const log = [
      { action: makeMove('moveA') },
      { action: gameEvent('endTurn') },
      { action: makeMove('moveB') },
      { action: gameEvent('endTurn') },
    ];

    const root = Enzyme.mount(
      <GameLog log={log} initialState={state} reducer={reducer} />
    );
    const turns = root.find('.turn-marker').map(div => div.text());
    expect(turns).toEqual(['0', '1']);
  });

  test('multiple moves per turn / phase', () => {
    const log = [
      { action: makeMove('moveA') },
      { action: makeMove('moveB') },
      { action: gameEvent('endPhase') },
      { action: makeMove('moveC') },
      { action: gameEvent('endTurn') },
    ];

    const root = Enzyme.mount(
      <GameLog log={log} initialState={state} reducer={reducer} />
    );

    const turns = root.find('TurnMarker');
    expect(turns.length).toBe(1);
    expect(turns.at(0).props()).toMatchObject({ numEvents: 3 });

    const phases = root.find('PhaseMarker');
    expect(phases.length).toBe(2);
    expect(phases.at(0).props()).toMatchObject({ numEvents: 2 });
    expect(phases.at(1).props()).toMatchObject({ numEvents: 1 });
  });
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

  const client = Client({ game });
  const initialState = client.getState()._initial;

  client.moves.A(1);
  client.events.endTurn();
  // Also ends the turn automatically.
  client.moves.A(42);
  client.moves.A(2);
  client.events.endTurn();

  let hoverState = null;

  const root = Enzyme.mount(
    <GameLog
      log={client.log}
      initialState={initialState}
      onHover={({ state }) => {
        hoverState = state;
      }}
      reducer={client.reducer}
    />
  );

  test('before rewind', () => {
    expect(client.getState().G).toMatchObject({ arg: 2 });
  });

  test('regular move', () => {
    root
      .find('.log-event')
      .at(0)
      .simulate('mouseenter');

    expect(hoverState.G).toMatchObject({ arg: 1 });
    expect(hoverState.ctx.turn).toBe(0);
    expect(hoverState.ctx.currentPlayer).toBe('0');
  });

  test('move with automatic event', () => {
    root
      .find('.log-event')
      .at(1)
      .simulate('mouseenter');

    expect(hoverState.G).toMatchObject({ arg: 42 });
    expect(hoverState.ctx.turn).toBe(2);
    expect(hoverState.ctx.currentPlayer).toBe('0');
  });

  test('no replaying automatic event', () => {
    root
      .find('.log-event')
      .at(2)
      .simulate('mouseenter');

    expect(hoverState.G).toMatchObject({ arg: 2 });
    expect(hoverState.ctx.turn).toBe(2);
    expect(hoverState.ctx.currentPlayer).toBe('0');
  });

  test('mouseleave', () => {
    root
      .find('.log-event')
      .at(0)
      .simulate('mouseleave');

    expect(hoverState).toBe(null);
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
    { action: makeMove('A') },
    { action: gameEvent('endTurn') },
    { action: makeMove('B') },
    { action: gameEvent('endTurn') },
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
      .at(1)
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
