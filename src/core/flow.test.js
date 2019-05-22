/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import Game from './game';
import { InitializeGame, CreateGameReducer } from './reducer';
import { makeMove, gameEvent, undo } from './action-creators';
import { Flow, FlowWithPhases } from './flow';
import { error } from '../core/logger';

jest.mock('../core/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
}));

test('Flow', () => {
  const flow = Flow({});
  const state = {};
  expect(flow.processGameEvent(state, gameEvent('unknown'))).toBe(state);

  // Check defaults of all arguments
  expect(flow.ctx()).toMatchObject({});
  expect(flow.eventNames).toHaveLength(0);
  expect(flow.init({ a: 5 })).toMatchObject({ a: 5 });
  expect(flow.canMakeMove({}, {}, undefined)).toBe(true);
  expect(flow.canUndoMove()).toBe(true);
  expect(flow.processMove({ b: 6 })).toMatchObject({ b: 6 });
  expect(flow.optimisticUpdate()).toBe(true);
});

describe('phases', () => {
  test('invalid startingPhase', () => {
    const flow = FlowWithPhases({
      startingPhase: 'A',
      phases: { B: {} },
    });
    flow.init({ ctx: flow.ctx(2) });
    expect(error).toHaveBeenCalledWith(`invalid startingPhase: A`);
  });

  test('invalid phase name', () => {
    const flow = FlowWithPhases({
      startingPhase: 'A',
      phases: { default: {} },
    });
    flow.init({ ctx: flow.ctx(2) });
    expect(error).toHaveBeenCalledWith(
      `cannot specify phase with name "default"`
    );
  });

  test('onBegin / onEnd', () => {
    const flow = FlowWithPhases({
      startingPhase: 'A',

      phases: {
        A: {
          onBegin: s => ({ ...s, setupA: true }),
          onEnd: s => ({ ...s, cleanupA: true }),
          next: 'B',
        },
        B: {
          onBegin: s => ({ ...s, setupB: true }),
          onEnd: s => ({ ...s, cleanupB: true }),
          next: 'A',
        },
      },

      turn: {
        order: {
          first: G => {
            if (G.setupB && !G.cleanupB) return '1';
            return '0';
          },
        },
      },
    });

    let state = { G: {}, ctx: flow.ctx(2) };
    state = flow.init(state);
    expect(state.G).toMatchObject({ setupA: true });
    expect(state.ctx.currentPlayer).toBe('0');

    state = flow.processGameEvent(state, gameEvent('endPhase'));
    expect(state.G).toMatchObject({
      setupA: true,
      cleanupA: true,
      setupB: true,
    });
    expect(state.ctx.currentPlayer).toBe('1');

    state = flow.processGameEvent(state, gameEvent('endPhase'));
    expect(state.G).toMatchObject({
      setupA: true,
      cleanupA: true,
      setupB: true,
      cleanupB: true,
    });
    expect(state.ctx.currentPlayer).toBe('0');
  });

  test('endIf', () => {
    const flow = FlowWithPhases({
      startingPhase: 'A',
      phases: { A: { endIf: () => true, next: 'B' }, B: {} },
    });

    const state = { ctx: flow.ctx(2) };

    {
      const t = flow.processGameEvent(state, gameEvent('endPhase'));
      expect(t.ctx.phase).toBe('B');
    }

    {
      const t = flow.processGameEvent(state, gameEvent('endTurn'));
      expect(t.ctx.phase).toBe('B');
    }

    {
      const t = flow.processMove(state, makeMove().payload);
      expect(t.ctx.phase).toBe('B');
    }
  });

  test('infinite loop', () => {
    const endIf = () => true;
    const flow = FlowWithPhases({
      startingPhase: 'A',
      phases: {
        A: { endIf, next: 'B' },
        B: { endIf, next: 'A' },
      },
    });

    let state = { ctx: flow.ctx(2) };
    flow.init(state);

    expect(state.ctx.phase).toBe('A');
    state = flow.processGameEvent(state, gameEvent('endPhase'));
    expect(state.ctx.phase).toBe('default');
  });

  test('end phase on move', () => {
    let endPhaseACount = 0;
    let endPhaseBCount = 0;
    const onMove = () => ({ A: true });

    const flow = FlowWithPhases({
      onMove,
      startingPhase: 'A',
      phases: {
        A: {
          turn: { endIf: () => true },
          endIf: () => true,
          onEnd: () => ++endPhaseACount,
          next: 'B',
        },
        B: {
          turn: { endIf: () => false },
          endIf: () => false,
          onEnd: () => ++endPhaseBCount,
        },
      },
    });
    let state = { G: {}, ctx: flow.ctx(2) };

    expect(state.ctx.phase).toBe('A');
    state = flow.processMove(state, makeMove().payload);
    expect(state.ctx.phase).toBe('B');

    expect(endPhaseACount).toEqual(1);
    expect(endPhaseBCount).toEqual(0);
  });

  test('end turn when final phase is reached', () => {
    const flow = FlowWithPhases({
      turn: { endIf: (G, ctx) => ctx.phase === 'C' },
      startingPhase: 'A',
      phases: { A: { next: 'B' }, B: { next: 'C' }, C: {} },
    });

    let state = { G: {}, ctx: flow.ctx(2) };

    expect(state.ctx.phase).toBe('A');
    expect(state.ctx.currentPlayer).toBe('0');

    state = flow.processGameEvent(state, gameEvent('endPhase'));

    expect(state.ctx.phase).toBe('B');
    expect(state.ctx.currentPlayer).toBe('0');

    state = flow.processGameEvent(state, gameEvent('endPhase'));

    expect(state.ctx.phase).toBe('C');
    expect(state.ctx.currentPlayer).toBe('1');
  });
});

test('movesPerTurn', () => {
  {
    const flow = FlowWithPhases({
      turn: {
        movesPerTurn: 2,
      },
    });
    let state = flow.init({ ctx: flow.ctx(2) });
    expect(state.ctx.turn).toBe(0);
    state = flow.processMove(state, makeMove('move', null, '0').payload);
    expect(state.ctx.turn).toBe(0);
    state = flow.processGameEvent(state, gameEvent('endTurn'));
    expect(state.ctx.turn).toBe(0);
    state = flow.processMove(state, makeMove('move', null, '0').payload);
    expect(state.ctx.turn).toBe(1);
  }

  {
    const flow = FlowWithPhases({
      turn: { movesPerTurn: 2 },
      phases: {
        B: {
          turn: {
            movesPerTurn: 1,
          },
        },
      },
    });
    let state = flow.init({ ctx: flow.ctx(2) });
    expect(state.ctx.turn).toBe(0);
    state = flow.processMove(state, makeMove('move', null, '0').payload);
    expect(state.ctx.turn).toBe(0);
    state = flow.processGameEvent(state, gameEvent('endTurn'));
    expect(state.ctx.turn).toBe(0);
    state = flow.processMove(state, makeMove('move', null, '0').payload);
    expect(state.ctx.turn).toBe(1);

    state = flow.processGameEvent(state, gameEvent('endPhase', { next: 'B' }));

    expect(state.ctx.turn).toBe(1);
    state = flow.processMove(state, makeMove('move', null, '1').payload);
    expect(state.ctx.turn).toBe(2);
  }
});

test('turn.onBegin', () => {
  const onBegin = jest.fn(G => G);
  const flow = FlowWithPhases({
    turn: { onBegin },
  });
  const state = { ctx: flow.ctx(2) };

  expect(onBegin).not.toHaveBeenCalled();
  flow.init(state);
  expect(onBegin).toHaveBeenCalled();
});

test('turn.onEnd', () => {
  const onEnd = jest.fn(G => G);
  const flow = FlowWithPhases({
    turn: { onEnd },
  });
  const state = { ctx: flow.ctx(2) };
  flow.init(state);

  expect(onEnd).not.toHaveBeenCalled();
  flow.processGameEvent(state, gameEvent('endTurn'));
  expect(onEnd).toHaveBeenCalled();
});

test('onMove', () => {
  const onMove = () => ({ A: true });

  {
    const flow = FlowWithPhases({ onMove });
    let state = { G: {}, ctx: flow.ctx(2) };
    state = flow.processMove(state, makeMove().payload);
    expect(state.G).toEqual({ A: true });
  }

  {
    const flow = FlowWithPhases({
      onMove,
      phases: { B: { onMove: () => ({ B: true }) } },
    });
    let state = { G: {}, ctx: flow.ctx(2) };
    state = flow.processMove(state, makeMove().payload);
    expect(state.G).toEqual({ A: true });
    state = flow.processGameEvent(state, gameEvent('endPhase', { next: 'B' }));
    state = flow.processMove(state, makeMove().payload);
    expect(state.G).toEqual({ B: true });
  }
});

test('init', () => {
  let flow = FlowWithPhases({
    startingPhase: 'A',
    phases: { A: { onEnd: () => ({ done: true }) } },
  });

  const orig = flow.ctx(2);
  let state = { G: {}, ctx: orig };
  state = flow.processGameEvent(state, gameEvent('init'));
  expect(state).toEqual({ G: {}, ctx: orig });

  flow = FlowWithPhases({
    startingPhase: 'A',
    phases: { A: { onBegin: () => ({ done: true }) } },
  });

  state = { ctx: orig };
  state = flow.init(state);
  expect(state.G).toMatchObject({ done: true });
});

test('endGameIf', () => {
  {
    const flow = FlowWithPhases({ endGameIf: G => G.win });

    let state = flow.init({ G: {}, ctx: flow.ctx(2) });
    state = flow.processGameEvent(state, gameEvent('endTurn'));
    expect(state.ctx.gameover).toBe(undefined);

    state.G.win = 'A';

    {
      const t = flow.processGameEvent(state, gameEvent('endTurn'));
      expect(t.ctx.gameover).toBe('A');
    }

    {
      const t = flow.processMove(state, makeMove('move').payload);
      expect(t.ctx.gameover).toBe('A');
    }
  }

  {
    const flow = FlowWithPhases({
      startingPhase: 'A',
      phases: { A: { endGameIf: G => G.win } },
    });

    let state = flow.init({ G: {}, ctx: flow.ctx(2) });
    state = flow.processGameEvent(state, gameEvent('endTurn'));
    expect(state.ctx.gameover).toBe(undefined);

    state.G.win = 'A';

    {
      const t = flow.processGameEvent(state, gameEvent('endTurn'));
      expect(t.ctx.gameover).toBe('A');
    }

    {
      const t = flow.processGameEvent(state, gameEvent('endPhase'));
      expect(t.ctx.gameover).toBe('A');
    }

    {
      const t = flow.processMove(state, makeMove('move').payload);
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
    const reducer = CreateGameReducer({ game });
    let state = InitializeGame({ game });

    expect(state.ctx.currentPlayer).toBe('0');
    state = reducer(state, makeMove('B'));
    expect(state.ctx.gameover).toBe(undefined);
    expect(state.ctx.currentPlayer).toBe('0');
    state = reducer(state, makeMove('A'));
    expect(state.ctx.gameover).toBe('A');
    expect(state.deltalog[state.deltalog.length - 1].action.payload.type).toBe(
      'endTurn'
    );
  }
});

describe('turn.endIf', () => {
  test('global', () => {
    const flow = FlowWithPhases({
      turn: { endIf: G => G.endTurn },
    });
    const game = Game({
      moves: {
        A: () => ({ endTurn: true }),
        B: G => G,
      },
      flow,
    });
    const reducer = CreateGameReducer({ game });

    let state = InitializeGame({ game });
    expect(state.ctx.currentPlayer).toBe('0');
    state = reducer(state, makeMove('B'));
    expect(state.ctx.currentPlayer).toBe('0');
    state = reducer(state, makeMove('A'));
    expect(state.ctx.currentPlayer).toBe('1');
  });

  test('phase specific', () => {
    const flow = FlowWithPhases({
      startingPhase: 'A',
      phases: {
        A: { turn: { endIf: G => G.endTurn } },
      },
    });
    const game = Game({
      moves: {
        A: () => ({ endTurn: true }),
        B: G => G,
      },
      flow,
    });
    const reducer = CreateGameReducer({ game });

    let state = InitializeGame({ game });
    expect(state.ctx.currentPlayer).toBe('0');
    state = reducer(state, makeMove('B'));
    expect(state.ctx.currentPlayer).toBe('0');
    state = reducer(state, makeMove('A'));
    expect(state.ctx.currentPlayer).toBe('1');
  });

  test('return value', () => {
    const flow = FlowWithPhases({
      turn: { endIf: () => ({ next: '2' }) },
    });
    const game = Game({
      moves: {
        A: G => G,
      },
      flow,
    });
    const reducer = CreateGameReducer({ game });

    let state = InitializeGame({ game, numPlayers: 3 });
    expect(state.ctx.currentPlayer).toBe('0');
    state = reducer(state, makeMove('A'));
    expect(state.ctx.currentPlayer).toBe('2');
  });
});

test('canMakeMove', () => {
  const game = Game({
    moves: {
      A: () => ({ A: true }),
      B: () => ({ B: true }),
      C: () => ({ C: true }),
    },
  });

  const reducer = CreateGameReducer({ game });
  let state = InitializeGame({ game });

  // Basic.
  let flow;
  flow = Flow({});
  expect(flow.canMakeMove(state.G, state.ctx)).toBe(true);
  flow = Flow({ canMakeMove: () => false });
  expect(flow.canMakeMove(state.G, state.ctx)).toBe(false);

  // No moves are allowed after the game is over.
  state.ctx.gameover = true;
  state.G = {};
  state = reducer(state, makeMove('A'));
  expect(state.G).not.toMatchObject({ A: true });
  state = reducer(state, makeMove('B'));
  expect(state.G).not.toMatchObject({ B: true });
});

test('canPlayerMakeMove', () => {
  const playerID = '0';

  let flow = Flow({});
  expect(flow.canPlayerMakeMove({}, {}, playerID)).toBe(false);
  // NOTE: currentPlayer is not allowed to make a move by default.
  // Their playerID must be included in the actionPlayers array.
  expect(flow.canPlayerMakeMove({}, { actionPlayers: ['1'] }, playerID)).toBe(
    false
  );
  expect(flow.canPlayerMakeMove({}, { actionPlayers: ['0'] }, playerID)).toBe(
    true
  );

  // no one can make a move
  flow = Flow({ canPlayerMakeMove: () => false });
  expect(flow.canPlayerMakeMove({}, {}, playerID)).toBe(false);
  expect(flow.canPlayerMakeMove({}, { actionPlayers: [] }, playerID)).toBe(
    false
  );
  expect(flow.canPlayerMakeMove({}, {}, '5')).toBe(false);
});

test('canPlayerCallEvent', () => {
  const playerID = '0';

  const flow = Flow({});
  expect(flow.canPlayerCallEvent({}, {}, playerID)).toBe(false);
  expect(
    flow.canPlayerCallEvent(
      {},
      { currentPlayer: '0', actionPlayers: ['1'] },
      playerID
    )
  ).toBe(false);
  expect(
    flow.canPlayerCallEvent(
      {},
      { currentPlayer: '0', actionPlayers: ['0'] },
      playerID
    )
  ).toBe(true);
});

test('endGame', () => {
  const flow = FlowWithPhases({ endGame: true });
  const state = { ctx: {} };

  {
    const t = flow.processGameEvent(state, gameEvent('endGame'));
    expect(t.ctx.gameover).toBe(true);
  }

  {
    const t = flow.processGameEvent(state, gameEvent('endGame', 42));
    expect(t.ctx.gameover).toBe(42);
  }
});

describe('endTurn / endPhase args', () => {
  const flow = FlowWithPhases({
    startingPhase: 'A',
    phases: { A: { next: 'B' }, B: {}, C: {} },
  });

  const state = { ctx: flow.ctx(3) };

  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('no args', () => {
    let t = state;
    t = flow.processGameEvent(t, gameEvent('endPhase'));
    t = flow.processGameEvent(t, gameEvent('endTurn'));
    expect(t.ctx.playOrderPos).toBe(1);
    expect(t.ctx.currentPlayer).toBe('1');
    expect(t.ctx.phase).toBe('B');
  });

  test('invalid arg to endPhase', () => {
    let t = state;
    t = flow.processGameEvent(t, gameEvent('endPhase', 'C'));
    expect(error).toBeCalledWith(`invalid argument to endPhase: C`);
    expect(t.ctx.phase).toBe('A');
  });

  test('invalid arg to endTurn', () => {
    let t = state;
    t = flow.processGameEvent(t, gameEvent('endTurn', '2'));
    expect(error).toBeCalledWith(`invalid argument to endTurn: 2`);
    expect(t.ctx.currentPlayer).toBe('0');
  });

  test('valid args', () => {
    let t = state;
    t = flow.processGameEvent(t, gameEvent('endPhase', { next: 'C' }));
    t = flow.processGameEvent(t, gameEvent('endTurn', { next: '2' }));
    expect(t.ctx.playOrderPos).toBe(2);
    expect(t.ctx.currentPlayer).toBe('2');
    expect(t.ctx.phase).toBe('C');
  });
});

test('undoable moves', () => {
  const game = Game({
    moves: {
      A: {
        impl: () => ({ A: true }),
        undoable: (G, ctx) => {
          return ctx.phase == 'A';
        },
      },
      B: {
        impl: () => ({ B: true }),
        undoable: false,
      },
      C: () => ({ C: true }),
    },

    startingPhase: 'A',
    phases: {
      A: {},
      B: {},
    },
  });

  const reducer = CreateGameReducer({ game });

  let state = InitializeGame({ game });

  state = reducer(state, makeMove('A'));
  expect(state.G).toEqual({ A: true });
  state = reducer(state, undo());
  expect(state.G).toEqual({});
  state = reducer(state, makeMove('B'));
  expect(state.G).toEqual({ B: true });
  state = reducer(state, undo());
  expect(state.G).toEqual({ B: true });
  state = reducer(state, makeMove('C'));
  expect(state.G).toEqual({ C: true });
  state = reducer(state, undo());
  expect(state.G).toEqual({ B: true });

  state.G = {};
  state = reducer(state, gameEvent('endPhase', { next: 'B' }));
  state = reducer(state, gameEvent('endTurn'));
  expect(state.ctx.phase).toBe('B');

  state = reducer(state, makeMove('A'));
  expect(state.G).toEqual({ A: true });
  state = reducer(state, undo());
  expect(state.G).toEqual({ A: true });
  state = reducer(state, makeMove('B'));
  expect(state.G).toEqual({ B: true });
  state = reducer(state, undo());
  expect(state.G).toEqual({ B: true });
  state = reducer(state, makeMove('C'));
  expect(state.G).toEqual({ C: true });
  state = reducer(state, undo());
  expect(state.G).toEqual({ B: true });
});

test('endTurn is not called twice in one move', () => {
  const flow = FlowWithPhases({
    turn: { endIf: () => true },
    startingPhase: 'A',
    phases: { A: { endIf: G => G.endPhase, next: 'B' }, B: {} },
  });

  let state = flow.init({ G: {}, ctx: flow.ctx(2) });

  expect(state.ctx.phase).toBe('A');
  expect(state.ctx.currentPlayer).toBe('0');
  expect(state.ctx.turn).toBe(0);

  state = flow.processMove(state, makeMove().payload);

  expect(state.ctx.phase).toBe('A');
  expect(state.ctx.currentPlayer).toBe('1');
  expect(state.ctx.turn).toBe(1);

  state.G.endPhase = true;

  // phase.endIf and turn.endIf both return true here,
  // but the turn should only advance once, despite
  // turn.endIf being checked in phase.endIf as well as processMove.
  state = flow.processMove(state, makeMove().payload);

  expect(state.ctx.phase).toBe('B');
  expect(state.ctx.currentPlayer).toBe('0');
  expect(state.ctx.turn).toBe(2);
});

test('allPlayed', () => {
  const game = Game({
    moves: { A: () => ({ A: true }) },
  });

  const reducer = CreateGameReducer({ game });

  let state = InitializeGame({ game });

  state = reducer(state, makeMove('A', null, '0'));
  state = reducer(state, gameEvent('endTurn', null, '0'));
  expect(state.ctx.stats.phase.allPlayed).toBe(false);
  state = reducer(state, makeMove('A', null, '1'));
  state = reducer(state, gameEvent('endTurn', null, '1'));
  expect(state.ctx.stats.phase.allPlayed).toBe(true);
});

describe('endPhase returns to previous phase', () => {
  let state;
  const flow = FlowWithPhases({
    startingPhase: 'A',
    phases: { A: {}, B: {}, C: {} },
  });

  beforeEach(() => {
    state = { G: {}, ctx: flow.ctx(2) };
    state = flow.init(state);
  });

  test('returns to default', () => {
    expect(state.ctx.phase).toBe('A');
    state = flow.processGameEvent(state, gameEvent('endPhase'));
    expect(state.ctx.phase).toBe('default');
  });

  test('returns to previous', () => {
    expect(state.ctx.phase).toBe('A');
    state = flow.processGameEvent(
      state,
      gameEvent('endPhase', [{ next: 'B' }])
    );
    expect(state.ctx.phase).toBe('B');
    state = flow.processGameEvent(state, gameEvent('endPhase'));
    expect(state.ctx.phase).toBe('A');
    state = flow.processGameEvent(state, gameEvent('endPhase'));
    expect(state.ctx.phase).toBe('B');
  });
});
