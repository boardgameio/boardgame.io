/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { makeMove, gameEvent } from './action-creators';
import { Client } from '../client/client';
import { FlowInternal, Flow } from './flow';
import { error } from '../core/logger';

jest.mock('../core/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
}));

test('Flow', () => {
  const flow = FlowInternal({});
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
    const flow = Flow({
      phases: { '': {} },
    });
    flow.init({ ctx: flow.ctx(2) });
    expect(error).toHaveBeenCalledWith('cannot specify phase with empty name');
  });

  test('onBegin / onEnd', () => {
    const flow = Flow({
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
    const flow = Flow({
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
    const flow = Flow({
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

    const flow = Flow({
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

  test('endPhase returns to null phase', () => {
    const flow = Flow({
      phases: { A: { start: true }, B: {}, C: {} },
    });
    let state = { G: {}, ctx: flow.ctx(2) };
    state = flow.init(state);

    expect(state.ctx.phase).toBe('A');
    state = flow.processGameEvent(state, gameEvent('endPhase'));
    expect(state.ctx.phase).toBe(null);
  });

  test('maintain playOrderPos on phase end', () => {
    const flow = Flow({
      phases: { A: { start: true, next: 'B' }, B: { next: 'A' } },
    });
    let state = { G: {}, ctx: flow.ctx(3) };
    state = flow.init(state);

    expect(state.ctx.playOrderPos).toBe(0);
    state = flow.processGameEvent(state, gameEvent('endTurn'));
    expect(state.ctx.playOrderPos).toBe(1);
    state = flow.processGameEvent(state, gameEvent('endPhase'));
    expect(state.ctx.playOrderPos).toBe(1);
  });
});

describe('turn', () => {
  test('onBegin', () => {
    const onBegin = jest.fn(G => G);
    const flow = Flow({
      turn: { onBegin },
    });
    const state = { ctx: flow.ctx(2) };

    expect(onBegin).not.toHaveBeenCalled();
    flow.init(state);
    expect(onBegin).toHaveBeenCalled();
  });

  test('onEnd', () => {
    const onEnd = jest.fn(G => G);
    const flow = Flow({
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
      const flow = Flow({ turn: { onMove } });
      let state = { G: {}, ctx: flow.ctx(2) };
      state = flow.processMove(state, makeMove().payload);
      expect(state.G).toEqual({ A: true });
    }

    {
      const flow = Flow({
        turn: { onMove },
        phases: { B: { turn: { onMove: () => ({ B: true }) } } },
      });
      let state = { G: {}, ctx: flow.ctx(2) };
      state = flow.processMove(state, makeMove().payload);
      expect(state.G).toEqual({ A: true });
      state = flow.processGameEvent(
        state,
        gameEvent('endPhase', { next: 'B' })
      );
      state = flow.processMove(state, makeMove().payload);
      expect(state.G).toEqual({ B: true });
    }
  });

  describe('moveLimit', () => {
    test('without phases', () => {
      const flow = Flow({
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
    });

    test('with phases', () => {
      const flow = Flow({
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
      expect(state.ctx.currentPlayer).toBe('0');

      state = flow.processMove(state, makeMove('move', null, '0').payload);

      expect(state.ctx.turn).toBe(1);
      expect(state.ctx.currentPlayer).toBe('0');

      state = flow.processGameEvent(state, gameEvent('endTurn'));

      expect(state.ctx.turn).toBe(1);
      expect(state.ctx.currentPlayer).toBe('0');

      state = flow.processMove(state, makeMove('move', null, '0').payload);

      expect(state.ctx.turn).toBe(2);
      expect(state.ctx.currentPlayer).toBe('1');

      state = flow.processGameEvent(
        state,
        gameEvent('endPhase', { next: 'B' })
      );

      expect(state.ctx.phase).toBe('B');
      expect(state.ctx.turn).toBe(3);
      expect(state.ctx.currentPlayer).toBe('1');

      state = flow.processMove(state, makeMove('move', null, '1').payload);
      expect(state.ctx.turn).toBe(4);
    });
  });

  describe('endIf', () => {
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

  test('endTurn is not called twice in one move', () => {
    const flow = Flow({
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
    expect(state.ctx.currentPlayer).toBe('1');
    expect(state.ctx.turn).toBe(3);
  });
});

test('init', () => {
  let flow = Flow({
    phases: { A: { start: true, onEnd: () => ({ done: true }) } },
  });

  const orig = flow.ctx(2);
  let state = { G: {}, ctx: orig };
  state = flow.processGameEvent(state, gameEvent('init'));
  expect(state).toEqual({ G: {}, ctx: orig });

  flow = Flow({
    phases: { A: { start: true, onBegin: () => ({ done: true }) } },
  });

  state = { ctx: orig };
  state = flow.init(state);
  expect(state.G).toMatchObject({ done: true });
});

describe('endIf', () => {
  test('basic', () => {
    const flow = Flow({ endIf: G => G.win });

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
  });

  test('phase automatically ends', () => {
    const game = {
      phases: {
        A: {
          start: true,
          moves: {
            A: () => ({ win: 'A' }),
            B: G => G,
          },
        },
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
  });
});

test('canPlayerMakeAnyMove', () => {
  const playerID = '0';

  let flow = FlowInternal({});
  expect(flow.canPlayerMakeAnyMove({}, {}, playerID)).toBe(false);

  expect(
    flow.canPlayerMakeAnyMove({}, { activePlayers: { '1': '' } }, playerID)
  ).toBe(false);
  expect(
    flow.canPlayerMakeAnyMove({}, { activePlayers: { '0': '' } }, playerID)
  ).toBe(true);

  // no one can make a move
  flow = FlowInternal({ canPlayerMakeAnyMove: () => false });
  expect(flow.canPlayerMakeAnyMove({}, {}, playerID)).toBe(false);
  expect(flow.canPlayerMakeAnyMove({}, { activePlayers: null }, playerID)).toBe(
    false
  );
  expect(flow.canPlayerMakeAnyMove({}, {}, '5')).toBe(false);
});

test('canPlayerCallEvent', () => {
  const playerID = '0';

  const flow = FlowInternal({});
  expect(flow.canPlayerCallEvent({}, {}, playerID)).toBe(false);
  expect(
    flow.canPlayerCallEvent(
      {},
      { currentPlayer: '0', activePlayers: { '1': '' } },
      playerID
    )
  ).toBe(false);
  expect(flow.canPlayerCallEvent({}, { currentPlayer: '0' }, playerID)).toBe(
    true
  );
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
  const flow = Flow({
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
    expect(t.ctx.phase).toBe(null);
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
        move: () => ({ A: true }),
        undoable: (G, ctx) => {
          return ctx.phase == 'A';
        },
      },
      B: {
        move: () => ({ B: true }),
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

describe('moveMap', () => {
  const game = {
    moves: { A: () => {} },

    turn: {
      stages: {
        SA: {
          moves: {
            A: () => {},
          },
        },
      },
    },

    phases: {
      PA: {
        moves: {
          A: () => {},
        },

        turn: {
          stages: {
            SB: {
              moves: {
                A: () => {},
              },
            },
          },
        },
      },
    },
  };

  test('basic', () => {
    const { moveMap } = Flow(game);
    expect(Object.keys(moveMap)).toEqual(['PA.A', 'PA.SB.A', '.SA.A']);
  });
});

describe('infinite loops', () => {
  test('A', () => {
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

  test('B', () => {
    const game = {
      turn: {
        onEnd: (G, ctx) => {
          ctx.events.endPhase();
        },
      },
      phases: {
        A: { next: 'B', start: true },
        B: { next: 'C' },
        C: { next: 'A' },
      },
    };
    const client = Client({ game });

    expect(client.getState().ctx.phase).toBe('A');
    client.events.endPhase();
    expect(client.getState().ctx.phase).toBe('B');
  });
});

describe('activePlayers', () => {
  test('sets activePlayers at each turn', () => {
    const game = {
      turn: {
        stages: { A: {}, B: {} },
        activePlayers: {
          currentPlayer: 'A',
          others: 'B',
        },
      },
    };

    const client = Client({ game, numPlayers: 3 });

    expect(client.getState().ctx.currentPlayer).toBe('0');
    expect(client.getState().ctx.activePlayers).toEqual({
      '0': 'A',
      '1': 'B',
      '2': 'B',
    });

    client.events.endTurn();

    expect(client.getState().ctx.currentPlayer).toBe('1');
    expect(client.getState().ctx.activePlayers).toEqual({
      '0': 'B',
      '1': 'A',
      '2': 'B',
    });
  });

  test('activePlayersDone', () => {
    const spec = {
      numPlayers: 3,
      multiplayer: { local: true },
      game: {
        moves: {
          moveA: (G, ctx) => {
            ctx.events.setActivePlayers({ all: '', once: true });
          },
          moveB: G => G,
        },
      },
    };

    const p0 = Client({ ...spec, playerID: '0' });
    const p1 = Client({ ...spec, playerID: '1' });
    const p2 = Client({ ...spec, playerID: '2' });

    p0.connect();
    p1.connect();
    p2.connect();

    expect(p0.getState().ctx.currentPlayer).toBe('0');

    expect(p0.getState().ctx.activePlayersDone).toBe(null);
    p0.moves.moveA();
    expect(p0.getState().ctx.activePlayersDone).toBe(false);

    expect(p0.getState().ctx.activePlayers).toEqual({
      '0': '',
      '1': '',
      '2': '',
    });

    p0.moves.moveB();

    expect(p0.getState().ctx.activePlayersDone).toBe(false);
    expect(p0.getState().ctx.activePlayers).toEqual({
      '1': '',
      '2': '',
    });

    p1.moves.moveB();

    expect(p0.getState().ctx.activePlayersDone).toBe(false);
    expect(p0.getState().ctx.activePlayers).toEqual({
      '2': '',
    });

    p2.moves.moveB();

    expect(p0.getState().ctx.activePlayersDone).toBe(true);
    expect(p0.getState().ctx.activePlayers).toEqual(null);

    p0.events.endTurn();

    expect(p0.getState().ctx.activePlayersDone).toBe(null);
    expect(p0.getState().ctx.activePlayers).toEqual(null);
  });
});
