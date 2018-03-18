/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import Game from './game';
import { createGameReducer } from './reducer';
import { makeMove, gameEvent } from './action-creators';
import { Flow, FlowWithPhases } from './flow';

test('Flow', () => {
  const flow = Flow({});
  const state = {};
  expect(flow.processGameEvent(state, { type: 'unknown' })).toBe(state);

  // Check defaults of all arguments
  expect(flow.ctx()).toMatchObject({});
  expect(flow.eventNames.length).toBe(0);
  expect(flow.init({ a: 5 })).toMatchObject({ a: 5 });
  expect(flow.canMakeMove({}, {}, undefined)).toBe(true);
  expect(flow.processMove({ b: 6 })).toMatchObject({ b: 6 });
  expect(flow.optimisticUpdate()).toBe(true);
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
  const onPhaseBegin = jest.fn(G => G);
  const onPhaseEnd = jest.fn(G => G);

  let flow = FlowWithPhases({
    phases: [
      {
        onPhaseBegin,
        onPhaseEnd,
      },
    ],
  });

  let state = { ctx: flow.ctx(2) };

  expect(onPhaseBegin).not.toHaveBeenCalled();
  expect(onPhaseEnd).not.toHaveBeenCalled();

  flow.init(state);
  expect(onPhaseBegin).toHaveBeenCalled();

  flow.processGameEvent(state, { type: 'endPhase' });
  expect(onPhaseEnd).toHaveBeenCalled();
});

test('movesPerTurn', () => {
  {
    let flow = FlowWithPhases({ movesPerTurn: 2 });
    let state = { ctx: flow.ctx(2) };
    expect(state.ctx.turn).toBe(0);
    state = flow.processMove(state, { move: {}, payload: {} });
    expect(state.ctx.turn).toBe(0);
    state = flow.processGameEvent(state, { type: 'endTurn' });
    expect(state.ctx.turn).toBe(0);
    state = flow.processMove(state, { move: {}, payload: {} });
    expect(state.ctx.turn).toBe(1);
  }

  {
    let flow = FlowWithPhases({
      movesPerTurn: 2,
      phases: [{ name: 'A' }, { name: 'B', movesPerTurn: 1 }],
    });
    let state = { ctx: flow.ctx(2) };
    expect(state.ctx.turn).toBe(0);
    state = flow.processMove(state, { move: {}, payload: {} });
    expect(state.ctx.turn).toBe(0);
    state = flow.processGameEvent(state, { type: 'endTurn' });
    expect(state.ctx.turn).toBe(0);
    state = flow.processMove(state, { move: {}, payload: {} });
    expect(state.ctx.turn).toBe(1);

    state = flow.processGameEvent(state, { type: 'endPhase' });

    expect(state.ctx.turn).toBe(1);
    state = flow.processMove(state, { move: {}, payload: {} });
    expect(state.ctx.turn).toBe(2);
  }
});

test('onTurnBegin', () => {
  {
    const onTurnBegin = jest.fn(G => G);
    const onTurnBeginOverride = jest.fn(G => G);

    let flow = FlowWithPhases({
      onTurnBegin,
      phases: [
        { name: 'A' },
        {
          name: 'B',
          onTurnBegin: onTurnBeginOverride,
        },
      ],
    });

    let state = { ctx: flow.ctx(2) };

    expect(onTurnBegin).not.toHaveBeenCalled();

    flow.init(state);

    expect(onTurnBegin).toHaveBeenCalled();
    expect(onTurnBeginOverride).not.toHaveBeenCalled();

    state = flow.processGameEvent(state, { type: 'endPhase' });
    expect(state.ctx.phase).toBe('B');
    expect(onTurnBeginOverride).not.toHaveBeenCalled();

    onTurnBegin.mockReset();
    onTurnBeginOverride.mockReset();

    flow.processGameEvent(state, { type: 'endTurn' });
    expect(onTurnBegin).not.toHaveBeenCalled();
    expect(onTurnBeginOverride).toHaveBeenCalled();
  }
});

test('onTurnEnd', () => {
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

test('onMove', () => {
  const onMove = () => ({ A: true });

  {
    let flow = FlowWithPhases({ onMove });
    let state = { G: {}, ctx: flow.ctx(2) };
    state = flow.processMove(state, { payload: {} });
    expect(state.G).toEqual({ A: true });
  }

  {
    let flow = FlowWithPhases({
      onMove,
      phases: [{ name: 'A' }, { name: 'B', onMove: () => ({ B: true }) }],
    });
    let state = { G: {}, ctx: flow.ctx(2) };
    state = flow.processMove(state, { payload: {} });
    expect(state.G).toEqual({ A: true });
    state = flow.processGameEvent(state, { type: 'endPhase' });
    state = flow.processMove(state, { payload: {} });
    expect(state.G).toEqual({ B: true });
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
  expect(state.G).toMatchObject({ done: true });
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
  expect(state.G).toMatchObject({ setupA: true });
  state = flow.processGameEvent(state, { type: 'endPhase' });
  expect(state.G).toMatchObject({ setupA: true, cleanupA: true, setupB: true });
  state = flow.processGameEvent(state, { type: 'endPhase' });
  expect(state.G).toMatchObject({
    setupA: true,
    cleanupA: true,
    setupB: true,
    cleanupB: true,
  });
});

test('endPhaseIf', () => {
  const flow = FlowWithPhases({
    phases: [{ name: 'A', endPhaseIf: () => true }, { name: 'B' }],
  });

  const state = { ctx: flow.ctx(2) };

  {
    const t = flow.processGameEvent(state, { type: 'endPhase' });
    expect(t.ctx.phase).toBe('B');
  }

  {
    const t = flow.processGameEvent(state, { type: 'endTurn' });
    expect(t.ctx.phase).toBe('B');
  }

  {
    const t = flow.processMove(state, { type: 'move', payload: {} });
    expect(t.ctx.phase).toBe('B');
  }

  {
    const endPhaseIf = () => true;
    const flow = FlowWithPhases({
      phases: [
        { name: 'A', endPhaseIf },
        { name: 'B', endPhaseIf },
        { name: 'C', endPhaseIf },
      ],
    });

    const state = { ctx: flow.ctx(2) };
    const t = flow.processGameEvent(state, { type: 'endPhase' });
    expect(t.ctx.phase).toBe('A');
  }
});

test('endGameIf', () => {
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

  // Test that the turn automatically ends.
  {
    const flow = FlowWithPhases({ endGameIf: G => G.win });
    const game = Game({
      moves: {
        A: () => ({ win: 'A' }),
        B: G => G,
      },
      flow,
    });
    const reducer = createGameReducer({ game, numPlayers: 2 });

    let state = reducer(undefined, { type: 'init' });
    expect(state.ctx.currentPlayer).toBe('0');
    state = reducer(state, makeMove('B'));
    expect(state.ctx.gameover).toBe(undefined);
    expect(state.ctx.currentPlayer).toBe('0');
    state = reducer(state, makeMove('A'));
    expect(state.ctx.gameover).toBe('A');
    expect(state.log[state.log.length - 1].type).toBe('endTurn');
  }
});

test('endTurnIf', () => {
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

test('canMakeMove', () => {
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
  expect(flow.canMakeMove(state.G, state.ctx)).toBe(true);
  flow = Flow({ canMakeMove: () => false });
  expect(flow.canMakeMove(state.G, state.ctx)).toBe(false);

  // B is disallowed in phase A.
  state = reducer(state, makeMove('B'));
  expect(state.G).not.toMatchObject({ A: true });
  state = reducer(state, makeMove('A'));
  expect(state.G).toMatchObject({ A: true });

  state = reducer(state, gameEvent('endPhase'));
  state.G = {};
  expect(state.ctx.phase).toBe('B');

  // A is disallowed in phase B.
  state = reducer(state, makeMove('A'));
  expect(state.G).not.toMatchObject({ B: true });
  state = reducer(state, makeMove('B'));
  expect(state.G).toMatchObject({ B: true });

  state = reducer(state, gameEvent('endPhase'));
  state.G = {};
  expect(state.ctx.phase).toBe('C');

  // All moves are allowed in phase C.
  state = reducer(state, makeMove('A'));
  expect(state.G).toMatchObject({ A: true });
  state = reducer(state, makeMove('B'));
  expect(state.G).toMatchObject({ B: true });

  // But not once the game is over.
  state.ctx.gameover = true;
  state.G = {};
  state = reducer(state, makeMove('A'));
  expect(state.G).not.toMatchObject({ A: true });
  state = reducer(state, makeMove('B'));
  expect(state.G).not.toMatchObject({ B: true });

  // the flow runs a user-provided validation
  flow = FlowWithPhases({ canMakeMove: () => true });
  expect(flow.canMakeMove(state.G, state.ctx)).toBe(false);
});

test('undo / redo', () => {
  let game = Game({
    moves: {
      move: (G, ctx, arg) => ({ ...G, [arg]: true }),
    },
  });

  const reducer = createGameReducer({ game, numPlayers: 2 });

  let state = reducer(undefined, { type: 'init' });

  state = reducer(state, makeMove('move', 'A'));
  expect(state.G).toEqual({ A: true });

  state = reducer(state, makeMove('move', 'B'));
  expect(state.G).toEqual({ A: true, B: true });

  state = reducer(state, gameEvent('undo'));
  expect(state.G).toEqual({ A: true });

  state = reducer(state, gameEvent('redo'));
  expect(state.G).toEqual({ A: true, B: true });

  state = reducer(state, gameEvent('redo'));
  expect(state.G).toEqual({ A: true, B: true });

  state = reducer(state, gameEvent('undo'));
  expect(state.G).toEqual({ A: true });

  state = reducer(state, gameEvent('undo'));
  state = reducer(state, gameEvent('undo'));
  state = reducer(state, gameEvent('undo'));
  expect(state.G).toEqual({});

  state = reducer(state, gameEvent('redo'));
  state = reducer(state, makeMove('move', 'C'));
  expect(state.G).toEqual({ A: true, C: true });

  state = reducer(state, gameEvent('undo'));
  expect(state.G).toEqual({ A: true });

  state = reducer(state, gameEvent('redo'));
  expect(state.G).toEqual({ A: true, C: true });

  state = reducer(state, gameEvent('undo'));
  state = reducer(state, gameEvent('undo'));
  state = reducer(state, makeMove('move', 'A'));
  expect(state.G).toEqual({ A: true });

  state = reducer(state, gameEvent('endTurn'));
  state = reducer(state, gameEvent('undo'));
  expect(state.G).toEqual({ A: true });
});

test('undo / redo restricted by undoableMoves', () => {
  let game = Game({
    moves: {
      undoableMove: (G, ctx, arg) => ({ ...G, [arg]: true }),
      move: (G, ctx, arg) => ({ ...G, [arg]: true }),
    },

    flow: {
      undoableMoves: ['undoableMove'],
    },
  });

  const reducer = createGameReducer({ game, numPlayers: 2 });

  let state = reducer(undefined, { type: 'init' });

  state = reducer(state, makeMove('move', 'A'));
  expect(state.G).toEqual({ A: true });

  state = reducer(state, makeMove('undoableMove', 'B'));
  expect(state.G).toEqual({ A: true, B: true });

  state = reducer(state, gameEvent('undo'));
  expect(state.G).toEqual({ A: true });

  state = reducer(state, gameEvent('redo'));
  expect(state.G).toEqual({ A: true, B: true });

  state = reducer(state, gameEvent('redo'));
  expect(state.G).toEqual({ A: true, B: true });

  state = reducer(state, gameEvent('undo'));
  expect(state.G).toEqual({ A: true });

  state = reducer(state, gameEvent('undo'));
  expect(state.G).toEqual({ A: true });

  state = reducer(state, makeMove('undoableMove', 'C'));
  expect(state.G).toEqual({ A: true, C: true });

  state = reducer(state, gameEvent('undo'));
  expect(state.G).toEqual({ A: true });

  state = reducer(state, gameEvent('redo'));
  expect(state.G).toEqual({ A: true, C: true });
});

test('canMakeMove', () => {
  // default behaviour
  const pid = { playerID: 0 };

  let flow = Flow({});
  expect(flow.canMakeMove({}, {}, pid)).toBe(false);
  // NOTE: currentPlayer is not allowed to make a move by default.
  // his playerID must be included in the actionPlayers array.
  expect(flow.canMakeMove({}, { currentPlayer: 0 }, pid)).toBe(false);
  expect(flow.canMakeMove({}, { actionPlayers: ['any'] }, pid)).toBe(true);
  expect(flow.canMakeMove({}, { actionPlayers: [0] }, pid)).toBe(true);
  expect(flow.canMakeMove({}, { actionPlayers: [1, 2, 3] }, pid)).toBe(false);

  // no one can make a move
  flow = Flow({ canMakeMove: () => false });
  expect(flow.canMakeMove({}, {}, pid)).toBe(false);
  expect(flow.canMakeMove({}, { currentPlayer: 0 }, pid)).toBe(false);
  expect(flow.canMakeMove({}, {}, 'any')).toBe(false);

  // flow with phases passes canMakeMove
  flow = FlowWithPhases({ canMakeMove: () => false });
  expect(flow.canMakeMove({}, {}, pid)).toBe(false);
  expect(flow.canMakeMove({}, { currentPlayer: 0 }, pid)).toBe(false);
  expect(flow.canMakeMove({}, {}, 'any')).toBe(false);
});

test('endGame', () => {
  const flow = FlowWithPhases({ endGame: true });
  const state = { ctx: {} };

  {
    const t = flow.processGameEvent(state, gameEvent('endGame').payload);
    expect(t.ctx.gameover).toBe(true);
  }

  {
    const t = flow.processGameEvent(state, gameEvent('endGame', 42).payload);
    expect(t.ctx.gameover).toBe(42);
  }
});
