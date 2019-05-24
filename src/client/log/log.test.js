/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import { Client } from '../client';
import { makeMove, automaticGameEvent } from '../../core/action-creators';
import { GameLog } from './log';
import { InitializeGame, CreateGameReducer } from '../../core/reducer';
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

Enzyme.configure({ adapter: new Adapter() });

describe('layout', () => {
  const game = {
    startingPhase: 'A',
    phases: {
      A: { next: 'B' },
      B: { next: 'A' },
    },
  };
  const reducer = CreateGameReducer({ game });
  const state = InitializeGame({ game });

  test('sanity', () => {
    const log = [
      { action: makeMove('moveA'), turn: 0, phase: 'A' },
      { action: automaticGameEvent('endTurn'), turn: 0, phase: 'A' },
      { action: makeMove('moveB'), turn: 1, phase: 'A' },
      { action: automaticGameEvent('endTurn'), turn: 1, phase: 'A' },
    ];

    const root = Enzyme.mount(
      <GameLog log={log} initialState={state} reducer={reducer} />
    );
    const turns = root.find('.turn-marker').map(div => div.text());
    expect(turns).toEqual(['0', '1']);
  });

  test('multiple moves per turn / phase', () => {
    const log = [
      { action: makeMove('moveA'), turn: 0, phase: 'A' },
      { action: makeMove('moveB'), turn: 0, phase: 'A' },
      { action: automaticGameEvent('endPhase'), turn: 0, phase: 'A' },
      { action: makeMove('moveC'), turn: 0, phase: 'B' },
      { action: automaticGameEvent('endTurn'), turn: 0, phase: 'B' },
    ];

    const root = Enzyme.mount(
      <GameLog log={log} initialState={state} reducer={reducer} />
    );

    const turns = root.find('TurnMarker');
    expect(turns).toHaveLength(1);
    expect(turns.at(0).props()).toMatchObject({ numEvents: 3 });

    const phases = root.find('PhaseMarker');
    expect(phases).toHaveLength(2);
    expect(phases.at(0).props()).toMatchObject({ numEvents: 2 });
    expect(phases.at(1).props()).toMatchObject({ numEvents: 1 });
  });
});

describe('time travel', () => {
  let client;
  let root;
  let hoverState;

  beforeAll(() => {
    const game = {
      moves: {
        A: (G, ctx, arg) => {
          return { arg };
        },
      },

      turn: {
        endIf: G => G && G.arg == 42,
      },
    };

    client = Client({ game });
    const initialState = client.getState()._initial;

    client.moves.A(1);
    client.events.endTurn();
    // Also ends the turn automatically.
    client.moves.A(42);
    client.moves.A(2);
    client.events.endTurn();

    hoverState = null;

    root = Enzyme.mount(
      <GameLog
        log={client.log}
        initialState={initialState}
        onHover={({ state }) => {
          hoverState = state;
        }}
        reducer={client.reducer}
      />
    );
  });

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
  const game = {
    moves: {
      A: () => ({ A: true }),
      B: () => ({ B: true }),
    },
  };

  const reducer = CreateGameReducer({ game });
  let state = InitializeGame({ game });
  const initialState = state;
  const log = [
    { action: makeMove('A'), turn: 0, phase: 'default' },
    { action: automaticGameEvent('endTurn'), turn: 0, phase: 'default' },
    { action: makeMove('B'), turn: 1, phase: 'default' },
    { action: automaticGameEvent('endTurn'), turn: 1, phase: 'default' },
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

describe('payload', () => {
  const game = {};
  const reducer = CreateGameReducer({ game });
  const state = InitializeGame({ game });

  const log = [
    {
      action: makeMove('moveA'),
      payload: { test_payload: 'payload123' },
      turn: 0,
      phase: 'default',
    },
  ];

  test('renders custom payload using the default component', () => {
    const root = Enzyme.mount(
      <GameLog log={log} initialState={state} reducer={reducer} />
    );
    const turns = root.find('.log-event').map(div => div.text());
    expect(turns[0]).toContain('payload123');
  });

  test('renders custom payload using a custom component', () => {
    const customPayloadComponent = () => {
      return <div>ignoring props.payload</div>;
    };

    const root = Enzyme.mount(
      <GameLog
        log={log}
        initialState={state}
        reducer={reducer}
        payloadComponent={customPayloadComponent}
      />
    );
    const turns = root.find('.log-event').map(div => div.text());
    expect(turns[0]).toContain('ignoring props.payload');
  });
});
