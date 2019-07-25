/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { makeMove, gameEvent } from './action-creators';
import { Client } from '../client/client';
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
  expect(flow.processMove({ b: 6 })).toMatchObject({ b: 6 });
});

describe('phases', () => {
  test('invalid phase name', () => {
    const flow = FlowWithPhases({
      phases: { '': {} },
    });
    flow.init({ ctx: flow.ctx(2) });
    expect(error).toHaveBeenCalledWith('cannot specify phase with empty name');
  });

  test('onBegin / onEnd', () => {
    const flow = FlowWithPhases({
      phases: {
        A: {
          start: true,
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
      phases: { A: { start: true, endIf: () => true, next: 'B' }, B: {} },
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
      phases: {
        A: { endIf, next: 'B', start: true },
        B: { endIf, next: 'A' },
      },
    });

    let state = { ctx: flow.ctx(2) };
    flow.init(state);

    expect(state.ctx.phase).toBe('A');
    state = flow.processGameEvent(state, gameEvent('endPhase'));
    expect(state.ctx.phase).toBe('');
  });

  test('end phase on move', () => {
    let endPhaseACount = 0;
    let endPhaseBCount = 0;

    const flow = FlowWithPhases({
      phases: {
        A: {
          start: true,
          endIf: () => true,
          onEnd: () => ++endPhaseACount,
          next: 'B',
        },
        B: {
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
});

test('moveLimit', () => {
  {
    const flow = FlowWithPhases({
      turn: {
        moveLimit: 2,
      },
    });
    let state = flow.init({ ctx: flow.ctx(2) });
    expect(state.ctx.turn).toBe(1);
    state = flow.processMove(state, makeMove('move', null, '0').payload);
    expect(state.ctx.turn).toBe(1);
    state = flow.processGameEvent(state, gameEvent('endTurn'));
    expect(state.ctx.turn).toBe(1);
    state = flow.processMove(state, makeMove('move', null, '0').payload);
    expect(state.ctx.turn).toBe(2);
  }

  {
    const flow = FlowWithPhases({
      turn: { moveLimit: 2 },
      phases: {
        B: {
          turn: {
            moveLimit: 1,
          },
        },
      },
    });
    let state = flow.init({ ctx: flow.ctx(2) });
    expect(state.ctx.turn).toBe(1);
    state = flow.processMove(state, makeMove('move', null, '0').payload);
    expect(state.ctx.turn).toBe(1);
    state = flow.processGameEvent(state, gameEvent('endTurn'));
    expect(state.ctx.turn).toBe(1);
    state = flow.processMove(state, makeMove('move', null, '0').payload);
    expect(state.ctx.turn).toBe(2);

    state = flow.processGameEvent(state, gameEvent('endPhase', { next: 'B' }));

    expect(state.ctx.phase).toBe('B');
    expect(state.ctx.turn).toBe(3);
    state = flow.processMove(state, makeMove('move', null, '0').payload);
    expect(state.ctx.turn).toBe(4);
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
    const flow = FlowWithPhases({ turn: { onMove } });
    let state = { G: {}, ctx: flow.ctx(2) };
    state = flow.processMove(state, makeMove().payload);
    expect(state.G).toEqual({ A: true });
  }

  {
    const flow = FlowWithPhases({
      turn: { onMove },
      phases: { B: { turn: { onMove: () => ({ B: true }) } } },
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
    phases: { A: { start: true, onEnd: () => ({ done: true }) } },
  });

  const orig = flow.ctx(2);
  let state = { G: {}, ctx: orig };
  state = flow.processGameEvent(state, gameEvent('init'));
  expect(state).toEqual({ G: {}, ctx: orig });

  flow = FlowWithPhases({
    phases: { A: { start: true, onBegin: () => ({ done: true }) } },
  });

  state = { ctx: orig };
  state = flow.init(state);
  expect(state.G).toMatchObject({ done: true });
});

test('endIf', () => {
  {
    const flow = FlowWithPhases({ endIf: G => G.win });

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

  // Test that the phase automatically ends.
  {
    const game = {
      moves: {
        A: () => ({ win: 'A' }),
        B: G => G,
      },
      endIf: G => G.win,
    };
    const client = Client({ game });

    expect(client.getState().ctx.currentPlayer).toBe('0');
    client.moves.B();
    expect(client.getState().ctx.gameover).toBe(undefined);

    expect(client.getState().ctx.currentPlayer).toBe('0');
    client.moves.A();
    expect(client.getState().ctx.gameover).toBe('A');
    expect(
      client.getState().deltalog[client.getState().deltalog.length - 1].action
        .payload.type
    ).toBe('endPhase');
  }
});

describe('turn.endIf', () => {
  test('global', () => {
    const game = {
      moves: {
        A: () => ({ endTurn: true }),
        B: G => G,
      },
      turn: { endIf: G => G.endTurn },
    };
    const client = Client({ game });

    expect(client.getState().ctx.currentPlayer).toBe('0');
    client.moves.B();
    expect(client.getState().ctx.currentPlayer).toBe('0');
    client.moves.A();
    expect(client.getState().ctx.currentPlayer).toBe('1');
  });

  test('phase specific', () => {
    const game = {
      moves: {
        A: () => ({ endTurn: true }),
        B: G => G,
      },
      phases: {
        A: { start: true, turn: { endIf: G => G.endTurn } },
      },
    };
    const client = Client({ game });

    expect(client.getState().ctx.currentPlayer).toBe('0');
    client.moves.B();
    expect(client.getState().ctx.currentPlayer).toBe('0');
    client.moves.A();
    expect(client.getState().ctx.currentPlayer).toBe('1');
  });

  test('return value', () => {
    const game = {
      moves: {
        A: G => G,
      },
      turn: { endIf: () => ({ next: '2' }) },
    };
    const client = Client({ game, numPlayers: 3 });

    expect(client.getState().ctx.currentPlayer).toBe('0');
    client.moves.A();
    expect(client.getState().ctx.currentPlayer).toBe('2');
  });
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

describe('endGame', () => {
  let client;
  beforeEach(() => {
    const game = {
      events: { endGame: true },
    };
    client = Client({ game });
  });

  test('without arguments', () => {
    client.events.endGame();
    expect(client.getState().ctx.gameover).toBe(true);
  });

  test('with arguments', () => {
    client.events.endGame(42);
    expect(client.getState().ctx.gameover).toBe(42);
  });
});

describe('endTurn / endPhase args', () => {
  const flow = FlowWithPhases({
    phases: { A: { start: true, next: 'B' }, B: {}, C: {} },
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
    expect(t.ctx.phase).toBe('');
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
  const game = {
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

    phases: {
      A: { start: true },
      B: {},
    },
  };

  const client = Client({ game });

  client.moves.A();
  expect(client.getState().G).toEqual({ A: true });
  client.undo();
  expect(client.getState().G).toEqual({});
  client.moves.B();
  expect(client.getState().G).toEqual({ B: true });
  client.undo();
  expect(client.getState().G).toEqual({ B: true });
  client.moves.C();
  expect(client.getState().G).toEqual({ C: true });
  client.undo();
  expect(client.getState().G).toEqual({ B: true });

  client.reset();
  client.events.endPhase({ next: 'B' });
  client.events.endTurn();
  expect(client.getState().ctx.phase).toBe('B');

  client.moves.A();
  expect(client.getState().G).toEqual({ A: true });
  client.undo();
  expect(client.getState().G).toEqual({ A: true });
  client.moves.B();
  expect(client.getState().G).toEqual({ B: true });
  client.undo();
  expect(client.getState().G).toEqual({ B: true });
  client.moves.C();
  expect(client.getState().G).toEqual({ C: true });
  client.undo();
  expect(client.getState().G).toEqual({ B: true });
});

test('endTurn is not called twice in one move', () => {
  const flow = FlowWithPhases({
    turn: { endIf: () => true },
    phases: { A: { start: true, endIf: G => G.endPhase, next: 'B' }, B: {} },
  });

  let state = flow.init({ G: {}, ctx: flow.ctx(2) });

  expect(state.ctx.phase).toBe('A');
  expect(state.ctx.currentPlayer).toBe('0');
  expect(state.ctx.turn).toBe(1);

  state = flow.processMove(state, makeMove().payload);

  expect(state.ctx.phase).toBe('A');
  expect(state.ctx.currentPlayer).toBe('1');
  expect(state.ctx.turn).toBe(2);

  state.G.endPhase = true;

  state = flow.processMove(state, makeMove().payload);

  expect(state.ctx.phase).toBe('B');
  expect(state.ctx.currentPlayer).toBe('0');
  expect(state.ctx.turn).toBe(3);
});

describe('endPhase returns to previous phase', () => {
  let state;
  const flow = FlowWithPhases({
    phases: { A: { start: true }, B: {}, C: {} },
  });

  beforeEach(() => {
    state = { G: {}, ctx: flow.ctx(2) };
    state = flow.init(state);
  });

  test('returns to default', () => {
    expect(state.ctx.phase).toBe('A');
    state = flow.processGameEvent(state, gameEvent('endPhase'));
    expect(state.ctx.phase).toBe('');
  });
});

test('another infinite loop', () => {
  const endIf = () => true;
  const game = {
    phases: {
      A: { endIf, next: 'B', start: true },
      B: { endIf, next: 'A' },
    },
  };
  const client = Client({ game });

  expect(client.getState().ctx.phase).toBe('');
});
