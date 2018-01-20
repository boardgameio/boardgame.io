/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import Game from './game';
import { createStore } from 'redux';
import { createGameReducer } from './reducer';
import { makeMove, gameEvent } from './action-creators';
import {
  Flow,
  SimpleFlow,
  FlowWithPhases,
  createEventDispatchers,
} from './flow';
import { TurnOrder } from './turn-order';

test('Flow', () => {
  const flow = Flow({});
  const state = {};
  expect(flow.processGameEvent(state, { type: 'unknown' })).toBe(state);
});

test('SimpleFlow', () => {
  const flow = SimpleFlow({});

  expect(flow.eventNames).toEqual(['endTurn']);
  let state = { ctx: flow.ctx(2) };
  expect(state.ctx.turn).toBe(0);
  state = flow.processGameEvent(state, { type: 'endTurn' });
  expect(state.ctx.turn).toBe(1);
});

test('FlowWithPhases', () => {
  const flow = FlowWithPhases({
    phases: [{ name: 'A' }, { name: 'B' }, { name: 'C' }, { name: 'D' }],
  });

  let state = { ctx: flow.ctx(2) };
  expect(state.ctx.turn).toBe(0);
  state = flow.processGameEvent(state, { type: 'endTurn' });
  expect(state.ctx.turn).toBe(1);

  expect(state.ctx.phase).toBe('A');
  state = flow.processGameEvent(state, { type: 'endPhase' });
  expect(state.ctx.phase).toBe('B');
  state = flow.processGameEvent(state, { type: 'endPhase' });
  expect(state.ctx.phase).toBe('C');
  state = flow.processGameEvent(state, { type: 'endPhase', args: ['A'] });
  expect(state.ctx.phase).toBe('A');
});

test('callbacks', () => {
  const onPass = jest.fn(G => G);
  const onPhaseBegin = jest.fn(G => G);
  const onPhaseEnd = jest.fn(G => G);

  let flow = FlowWithPhases({
    phases: [
      {
        onPass,
        onPhaseBegin,
        onPhaseEnd,
      },
    ],
  });

  let state = { ctx: flow.ctx(2) };

  expect(onPass).not.toHaveBeenCalled();
  expect(onPhaseBegin).not.toHaveBeenCalled();
  expect(onPhaseEnd).not.toHaveBeenCalled();

  flow.init(state);
  expect(onPhaseBegin).toHaveBeenCalled();

  flow.processGameEvent(state, { type: 'pass' });
  expect(onPass).toHaveBeenCalled();

  flow.processGameEvent(state, { type: 'endPhase' });
  expect(onPhaseEnd).toHaveBeenCalled();
});

test('movesPerTurn', () => {
  {
    let flow = SimpleFlow({ movesPerTurn: 2 });
    let state = { ctx: flow.ctx(2) };
    expect(state.ctx.turn).toBe(0);
    state = flow.processMove(state, { move: {} });
    expect(state.ctx.turn).toBe(0);
    state = flow.processMove(state, { move: {} });
    expect(state.ctx.turn).toBe(1);
  }

  {
    let flow = FlowWithPhases({ movesPerTurn: 2 });
    let state = { ctx: flow.ctx(2) };
    expect(state.ctx.turn).toBe(0);
    state = flow.processMove(state, { move: {} });
    expect(state.ctx.turn).toBe(0);
    state = flow.processMove(state, { move: {} });
    expect(state.ctx.turn).toBe(1);
  }

  {
    let flow = FlowWithPhases({
      movesPerTurn: 2,
      phases: [{ name: 'A' }, { name: 'B', movesPerTurn: 1 }],
    });
    let state = { ctx: flow.ctx(2) };
    expect(state.ctx.turn).toBe(0);
    state = flow.processMove(state, { move: {} });
    expect(state.ctx.turn).toBe(0);
    state = flow.processMove(state, { move: {} });
    expect(state.ctx.turn).toBe(1);

    state = flow.processGameEvent(state, { type: 'endPhase' });

    expect(state.ctx.turn).toBe(1);
    state = flow.processMove(state, { move: {} });
    expect(state.ctx.turn).toBe(2);
  }
});

test('onTurnEnd', () => {
  {
    const onTurnEnd = jest.fn(G => G);
    let flow = SimpleFlow({ onTurnEnd });
    let state = { ctx: flow.ctx(2) };
    flow.init(state);
    flow.processGameEvent(state, { type: 'endTurn' });
    expect(onTurnEnd).toHaveBeenCalled();
  }

  {
    const onTurnEnd = jest.fn(G => G);
    const onTurnEndOverride = jest.fn(G => G);

    let flow = FlowWithPhases({
      onTurnEnd,
      phases: [
        { name: 'A' },
        {
          name: 'B',
          onTurnEnd: onTurnEndOverride,
        },
      ],
    });

    let state = { ctx: flow.ctx(2) };

    expect(onTurnEnd).not.toHaveBeenCalled();
    expect(onTurnEndOverride).not.toHaveBeenCalled();

    flow.init(state);
    expect(state.ctx.phase).toBe('A');

    flow.processGameEvent(state, { type: 'endTurn' });
    expect(onTurnEnd).toHaveBeenCalled();
    expect(onTurnEndOverride).not.toHaveBeenCalled();

    onTurnEnd.mockReset();
    onTurnEndOverride.mockReset();

    state = flow.processGameEvent(state, { type: 'endPhase' });

    flow.processGameEvent(state, { type: 'endTurn' });
    expect(onTurnEnd).not.toHaveBeenCalled();
    expect(onTurnEndOverride).toHaveBeenCalled();
  }
});

test('triggers', () => {
  const triggers = [
    {
      condition: G => G.milestone,
      action: G => ({ ...G, action: true }),
    },
  ];

  {
    let flow = SimpleFlow({ triggers });
    let state = { G: {}, ctx: flow.ctx(2) };

    state = flow.processMove(state);
    expect(state.G.action).toBe(undefined);
    state.G.milestone = true;
    state = flow.processMove(state);
    expect(state.G.action).toBe(true);
  }

  {
    let flow = FlowWithPhases({ triggers });
    let state = { G: {}, ctx: flow.ctx(2) };

    state = flow.processMove(state);
    expect(state.G.action).toBe(undefined);
    state.G.milestone = true;
    state = flow.processMove(state);
    expect(state.G.action).toBe(true);
  }
});

test('init', () => {
  let flow = FlowWithPhases({
    phases: [{ name: 'A', onPhaseEnd: () => ({ done: true }) }],
  });

  const orig = flow.ctx(2);
  let state = { G: {}, ctx: orig };
  state = flow.processGameEvent(state, { type: 'init' });
  expect(state).toEqual({ G: {}, ctx: orig });

  flow = FlowWithPhases({
    phases: [{ name: 'A', onPhaseBegin: () => ({ done: true }) }],
  });

  state = { ctx: orig };
  state = flow.init(state);
  expect(state.G).toEqual({ done: true });
});

test('pass', () => {
  let flow = FlowWithPhases({
    phases: [{ name: 'A', turnOrder: TurnOrder.ANY }],
  });
  let state = { ctx: flow.ctx(2) };
  expect(state.ctx.allPassed).toBe(false);
  state = flow.processGameEvent(state, { type: 'pass', playerID: '0' });
  expect(state.ctx.allPassed).toBe(false);
  state = flow.processGameEvent(state, { type: 'pass', playerID: '1' });
  expect(state.ctx.allPassed).toBe(true);
});

test('onPhaseBegin / onPhaseEnd', () => {
  const flow = FlowWithPhases({
    phases: [
      {
        name: 'A',
        onPhaseBegin: s => ({ ...s, setupA: true }),
        onPhaseEnd: s => ({ ...s, cleanupA: true }),
      },
      {
        name: 'B',
        onPhaseBegin: s => ({ ...s, setupB: true }),
        onPhaseEnd: s => ({ ...s, cleanupB: true }),
      },
    ],
  });

  let state = { G: {}, ctx: flow.ctx(2) };
  state = flow.init(state);
  expect(state.G).toEqual({ setupA: true });
  state = flow.processGameEvent(state, { type: 'endPhase' });
  expect(state.G).toEqual({ setupA: true, cleanupA: true, setupB: true });
  state = flow.processGameEvent(state, { type: 'endPhase' });
  expect(state.G).toEqual({
    setupA: true,
    cleanupA: true,
    setupB: true,
    cleanupB: true,
  });
});

test('endPhaseIf', () => {
  const flow = FlowWithPhases({
    phases: [{ name: 'A', endPhaseIf: G => G.end }, { name: 'B' }],
  });

  let state = { G: { end: true }, ctx: flow.ctx(2) };

  {
    const t = flow.processGameEvent(state, { type: 'endPhase' });
    expect(t.ctx.phase).toBe('B');
  }

  {
    const t = flow.processGameEvent(state, { type: 'endTurn' });
    expect(t.ctx.phase).toBe('B');
  }

  {
    const t = flow.processMove(state, { type: 'move' });
    expect(t.ctx.phase).toBe('B');
  }
});

test('endGameIf', () => {
  {
    const flow = SimpleFlow({ endGameIf: G => G.win });

    let state = { G: {}, ctx: flow.ctx(2) };
    state = flow.processGameEvent(state, { type: 'endTurn' });
    expect(state.ctx.gameover).toBe(undefined);

    state.G.win = 'A';

    {
      const t = flow.processGameEvent(state, { type: 'endTurn' });
      expect(t.ctx.gameover).toBe('A');
    }

    {
      const t = flow.processMove(state, { type: 'move' });
      expect(t.ctx.gameover).toBe('A');
    }
  }

  {
    const flow = FlowWithPhases({ endGameIf: G => G.win });

    let state = { G: {}, ctx: flow.ctx(2) };
    state = flow.processGameEvent(state, { type: 'endTurn' });
    expect(state.ctx.gameover).toBe(undefined);

    state.G.win = 'A';

    {
      const t = flow.processGameEvent(state, { type: 'endTurn' });
      expect(t.ctx.gameover).toBe('A');
    }

    {
      const t = flow.processGameEvent(state, { type: 'endPhase' });
      expect(t.ctx.gameover).toBe('A');
    }

    {
      const t = flow.processMove(state, { type: 'move' });
      expect(t.ctx.gameover).toBe('A');
    }
  }

  {
    const flow = FlowWithPhases({
      phases: [{ name: 'default', endGameIf: G => G.win }],
    });

    let state = { G: {}, ctx: flow.ctx(2) };
    state = flow.processGameEvent(state, { type: 'endTurn' });
    expect(state.ctx.gameover).toBe(undefined);

    state.G.win = 'A';
    state = flow.processGameEvent(state, { type: 'endTurn' });
    expect(state.ctx.gameover).toBe('A');
  }
});

test('endTurnIf', () => {
  {
    const flow = SimpleFlow({ endTurnIf: G => G.endTurn });
    const game = Game({
      moves: {
        A: () => ({ endTurn: true }),
        B: G => G,
      },
      flow,
    });
    const reducer = createGameReducer({ game, numPlayers: 2 });

    let state = reducer(undefined, { type: 'init' });
    expect(state.ctx.currentPlayer).toBe('0');
    state = reducer(state, makeMove('B'));
    expect(state.ctx.currentPlayer).toBe('0');
    state = reducer(state, makeMove('A'));
    expect(state.ctx.currentPlayer).toBe('1');
  }

  {
    const flow = FlowWithPhases({ endTurnIf: G => G.endTurn });
    const game = Game({
      moves: {
        A: () => ({ endTurn: true }),
        B: G => G,
      },
      flow,
    });
    const reducer = createGameReducer({ game, numPlayers: 2 });

    let state = reducer(undefined, { type: 'init' });
    expect(state.ctx.currentPlayer).toBe('0');
    state = reducer(state, makeMove('B'));
    expect(state.ctx.currentPlayer).toBe('0');
    state = reducer(state, makeMove('A'));
    expect(state.ctx.currentPlayer).toBe('1');
  }

  {
    const flow = FlowWithPhases({
      phases: [
        {
          name: 'default',
          endTurnIf: G => G.endTurn,
        },
      ],
    });
    const game = Game({
      moves: {
        A: () => ({ endTurn: true }),
        B: G => G,
      },
      flow,
    });
    const reducer = createGameReducer({ game, numPlayers: 2 });

    let state = reducer(undefined, { type: 'init' });
    expect(state.ctx.currentPlayer).toBe('0');
    state = reducer(state, makeMove('B'));
    expect(state.ctx.currentPlayer).toBe('0');
    state = reducer(state, makeMove('A'));
    expect(state.ctx.currentPlayer).toBe('1');
  }
});

test('validator', () => {
  let game = Game({
    moves: {
      A: () => ({ A: true }),
      B: () => ({ B: true }),
    },

    flow: {
      phases: [
        { name: 'A', allowedMoves: 'A' },
        { name: 'B', allowedMoves: 'B' },
        { name: 'C' },
      ],
    },
  });

  const reducer = createGameReducer({ game, numPlayers: 2 });
  let state = reducer(undefined, { type: 'init' });
  expect(state.ctx.phase).toBe('A');

  // Basic.
  let flow;
  flow = Flow({});
  expect(flow.validator(state.G, state.ctx)).toBe(true);
  flow = Flow({ validator: () => false });
  expect(flow.validator(state.G, state.ctx)).toBe(false);

  // B is disallowed in phase A.
  state = reducer(state, makeMove('B'));
  expect(state.G).toEqual({});
  state = reducer(state, makeMove('A'));
  expect(state.G).toEqual({ A: true });

  state = reducer(state, gameEvent('endPhase'));
  state.G = {};
  expect(state.ctx.phase).toBe('B');

  // A is disallowed in phase B.
  state = reducer(state, makeMove('A'));
  expect(state.G).toEqual({});
  state = reducer(state, makeMove('B'));
  expect(state.G).toEqual({ B: true });

  state = reducer(state, gameEvent('endPhase'));
  state.G = {};
  expect(state.ctx.phase).toBe('C');

  // All moves are allowed in phase C.
  state = reducer(state, makeMove('A'));
  expect(state.G).toEqual({ A: true });
  state = reducer(state, makeMove('B'));
  expect(state.G).toEqual({ B: true });

  // But not once the game is over.
  state.ctx.gameover = true;
  state.G = {};
  state = reducer(state, makeMove('A'));
  expect(state.G).toEqual({});
  state = reducer(state, makeMove('B'));
  expect(state.G).toEqual({});
});

test('dispatchers', () => {
  const game = Game({});
  const reducer = createGameReducer({ game, numPlayers: 2 });
  const store = createStore(reducer);
  const api = createEventDispatchers(game.flow.eventNames, store);
  expect(Object.getOwnPropertyNames(api)).toEqual(['endTurn']);

  expect(store.getState().ctx.turn).toBe(0);
  api.endTurn();
  expect(store.getState().ctx.turn).toBe(1);
});
