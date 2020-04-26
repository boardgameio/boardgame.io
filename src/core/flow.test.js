/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { makeMove, gameEvent } from './action-creators';
import { Client } from '../client/client';
import { Flow } from './flow';
import { error } from '../core/logger';

jest.mock('../core/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
}));

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

    state = flow.processEvent(state, gameEvent('endPhase'));
    expect(state.G).toMatchObject({
      setupA: true,
      cleanupA: true,
      setupB: true,
    });
    expect(state.ctx.currentPlayer).toBe('1');

    state = flow.processEvent(state, gameEvent('endPhase'));
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
      const t = flow.processEvent(state, gameEvent('endPhase'));
      expect(t.ctx.phase).toBe('B');
    }

    {
      const t = flow.processEvent(state, gameEvent('endTurn'));
      expect(t.ctx.phase).toBe('B');
    }

    {
      const t = flow.processMove(state, makeMove().payload);
      expect(t.ctx.phase).toBe('B');
    }
  });

  describe('onEnd', () => {
    let client;

    beforeAll(() => {
      const game = {
        endIf: () => true,
        onEnd: G => {
          G.onEnd = true;
        },
      };
      client = Client({ game });
    });

    test('works', () => {
      expect(client.getState().G).toEqual({
        onEnd: true,
      });
    });
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
    state = flow.processEvent(state, gameEvent('endPhase'));
    expect(state.ctx.phase).toBe(null);
  });

  test('increment playOrderPos on phase end', () => {
    const flow = Flow({
      phases: { A: { start: true, next: 'B' }, B: { next: 'A' } },
    });
    let state = { G: {}, ctx: flow.ctx(3) };
    state = flow.init(state);

    expect(state.ctx.playOrderPos).toBe(0);
    state = flow.processEvent(state, gameEvent('endTurn'));
    expect(state.ctx.playOrderPos).toBe(1);
    state = flow.processEvent(state, gameEvent('endPhase'));
    expect(state.ctx.playOrderPos).toBe(2);
  });

  describe('setPhase', () => {
    let flow;
    beforeEach(() => {
      flow = Flow({
        phases: { A: { start: true }, B: {} },
      });
    });

    test('basic', () => {
      let state = { G: {}, ctx: flow.ctx(2) };
      state = flow.init(state);

      expect(state.ctx.phase).toBe('A');
      state = flow.processEvent(state, gameEvent('setPhase', 'B'));
      expect(state.ctx.phase).toBe('B');
    });

    test('invalid arg', () => {
      let state = { G: {}, ctx: flow.ctx(2) };
      state = flow.init(state);

      expect(state.ctx.phase).toBe('A');
      state = flow.processEvent(state, gameEvent('setPhase', 'C'));
      expect(error).toBeCalledWith('invalid phase: C');
      expect(state.ctx.phase).toBe(null);
    });
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
    flow.processEvent(state, gameEvent('endTurn'));
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
      state = flow.processEvent(state, gameEvent('setPhase', 'B'));
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
      state = flow.processEvent(state, gameEvent('endTurn'));
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

      state = flow.processEvent(state, gameEvent('endTurn'));

      expect(state.ctx.turn).toBe(1);
      expect(state.ctx.currentPlayer).toBe('0');

      state = flow.processMove(state, makeMove('move', null, '0').payload);

      expect(state.ctx.turn).toBe(2);
      expect(state.ctx.currentPlayer).toBe('1');

      state = flow.processEvent(state, gameEvent('setPhase', 'B'));

      expect(state.ctx.phase).toBe('B');
      expect(state.ctx.turn).toBe(3);
      expect(state.ctx.currentPlayer).toBe('0');

      state = flow.processMove(state, makeMove('move', null, '0').payload);
      expect(state.ctx.turn).toBe(4);
      expect(state.ctx.currentPlayer).toBe('1');
    });

    test('with noLimit moves', () => {
      const flow = Flow({
        turn: {
          moveLimit: 2,
        },
        moves: {
          A: () => {},
          B: {
            move: () => {},
            noLimit: true,
          },
        },
      });
      let state = flow.init({ ctx: flow.ctx(2) });
      expect(state.ctx.turn).toBe(1);
      expect(state.ctx.numMoves).toBe(0);
      state = flow.processMove(state, makeMove('A', null, '0').payload);
      expect(state.ctx.turn).toBe(1);
      expect(state.ctx.numMoves).toBe(1);
      state = flow.processMove(state, makeMove('B', null, '0').payload);
      expect(state.ctx.turn).toBe(1);
      expect(state.ctx.numMoves).toBe(1);
      state = flow.processMove(state, makeMove('A', null, '0').payload);
      expect(state.ctx.turn).toBe(2);
      expect(state.ctx.numMoves).toBe(0);
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
    expect(state.ctx.currentPlayer).toBe('0');
    expect(state.ctx.turn).toBe(3);
  });
});

describe('stages', () => {
  let client;

  beforeAll(() => {
    const A = () => {};
    const B = () => {};

    const game = {
      moves: { A },
      turn: {
        stages: {
          B: { moves: { B } },
          C: {},
        },
      },
    };

    client = Client({ game });
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('no stage', () => {
    test('A is allowed', () => {
      client.moves.A();
      expect(error).not.toBeCalled();
    });

    test('B is not allowed', () => {
      client.moves.B();
      expect(error).toBeCalledWith('disallowed move: B');
    });
  });

  describe('stage B', () => {
    beforeAll(() => {
      client.events.setStage('B');
    });

    test('A is not allowed', () => {
      client.moves.A();
      expect(error).toBeCalledWith('disallowed move: A');
    });

    test('B is allowed', () => {
      client.moves.B();
      expect(error).not.toBeCalled();
    });
  });

  describe('stage C', () => {
    beforeAll(() => {
      client.events.setStage('C');
    });

    test('A is allowed', () => {
      client.moves.A();
      expect(error).not.toBeCalled();
    });

    test('B is not allowed', () => {
      client.moves.B();
      expect(error).toBeCalledWith('disallowed move: B');
    });
  });
});

describe('stage events', () => {
  describe('setStage', () => {
    test('basic', () => {
      let flow = Flow({});
      let state = { G: {}, ctx: flow.ctx(2) };
      state = flow.init(state);

      expect(state.ctx.activePlayers).toBeNull();
      state = flow.processEvent(state, gameEvent('setStage', 'A'));
      expect(state.ctx.activePlayers).toEqual({ '0': 'A' });
    });

    test('object syntax', () => {
      let flow = Flow({});
      let state = { G: {}, ctx: flow.ctx(2) };
      state = flow.init(state);

      expect(state.ctx.activePlayers).toBeNull();
      state = flow.processEvent(state, gameEvent('setStage', { stage: 'A' }));
      expect(state.ctx.activePlayers).toEqual({ '0': 'A' });
    });

    test('with multiple active players', () => {
      let flow = Flow({
        turn: {
          activePlayers: { all: 'A', moveLimit: 5 },
        },
      });
      let state = { G: {}, ctx: flow.ctx(3) };
      state = flow.init(state);

      expect(state.ctx.activePlayers).toEqual({ '0': 'A', '1': 'A', '2': 'A' });
      state = flow.processEvent(
        state,
        gameEvent('setStage', { stage: 'B', moveLimit: 1 })
      );
      expect(state.ctx.activePlayers).toEqual({ '0': 'B', '1': 'A', '2': 'A' });

      state = flow.processEvent(
        state,
        gameEvent('setStage', { stage: 'B', moveLimit: 1 }, '1')
      );
      expect(state.ctx.activePlayers).toEqual({ '0': 'B', '1': 'B', '2': 'A' });
    });

    test('resets move count', () => {
      let flow = Flow({
        moves: { A: () => {} },
        turn: {
          activePlayers: { currentPlayer: 'A' },
        },
      });
      let state = { G: {}, ctx: flow.ctx(2) };
      state = flow.init(state);

      expect(state.ctx._activePlayersNumMoves).toMatchObject({ '0': 0 });
      state = flow.processMove(state, makeMove('A', null, '0').payload);
      expect(state.ctx._activePlayersNumMoves).toMatchObject({ '0': 1 });
      state = flow.processEvent(state, gameEvent('setStage', 'B'));
      expect(state.ctx._activePlayersNumMoves).toMatchObject({ '0': 0 });
    });

    test('with move limit', () => {
      let flow = Flow({});
      let state = { G: {}, ctx: flow.ctx(2) };
      state = flow.init(state);

      expect(state.ctx._activePlayersMoveLimit).toBeNull();
      state = flow.processEvent(
        state,
        gameEvent('setStage', { stage: 'A', moveLimit: 2 })
      );
      expect(state.ctx._activePlayersMoveLimit).toEqual({ '0': 2 });
    });

    test('empty argument ends stage', () => {
      let flow = Flow({ turn: { activePlayers: { currentPlayer: 'A' } } });
      let state = { G: {}, ctx: flow.ctx(2) };
      state = flow.init(state);

      expect(state.ctx.activePlayers).toEqual({ '0': 'A' });
      state = flow.processEvent(state, gameEvent('setStage', {}));
      expect(state.ctx.activePlayers).toBeNull();
    });
  });

  describe('endStage', () => {
    test('basic', () => {
      let flow = Flow({
        turn: {
          activePlayers: { currentPlayer: 'A' },
        },
      });
      let state = { G: {}, ctx: flow.ctx(2) };
      state = flow.init(state);

      expect(state.ctx.activePlayers).toEqual({ '0': 'A' });
      state = flow.processEvent(state, gameEvent('endStage'));
      expect(state.ctx.activePlayers).toBeNull();
    });

    test('with multiple active players', () => {
      let flow = Flow({
        turn: {
          activePlayers: { all: 'A', moveLimit: 5 },
        },
      });
      let state = { G: {}, ctx: flow.ctx(3) };
      state = flow.init(state);

      expect(state.ctx.activePlayers).toEqual({ '0': 'A', '1': 'A', '2': 'A' });
      state = flow.processEvent(state, gameEvent('endStage'));
      expect(state.ctx.activePlayers).toEqual({ '1': 'A', '2': 'A' });
    });

    test('maintains move count', () => {
      let flow = Flow({
        moves: { A: () => {} },
        turn: {
          activePlayers: { currentPlayer: 'A' },
        },
      });
      let state = { G: {}, ctx: flow.ctx(2) };
      state = flow.init(state);

      expect(state.ctx._activePlayersNumMoves).toMatchObject({ '0': 0 });
      state = flow.processMove(state, makeMove('A', null, '0').payload);
      expect(state.ctx._activePlayersNumMoves).toMatchObject({ '0': 1 });
      state = flow.processEvent(state, gameEvent('endStage'));
      expect(state.ctx._activePlayersNumMoves).toMatchObject({ '0': 1 });
    });

    test('sets to next', () => {
      let flow = Flow({
        turn: {
          activePlayers: { currentPlayer: 'A1', others: 'B1' },
          stages: {
            A1: { next: 'A2' },
            B1: { next: 'B2' },
          },
        },
      });
      let state = { G: {}, ctx: flow.ctx(2) };
      state = flow.init(state);

      expect(state.ctx.activePlayers).toMatchObject({
        '0': 'A1',
        '1': 'B1',
      });

      state = flow.processEvent(state, gameEvent('endStage', null, '0'));

      expect(state.ctx.activePlayers).toMatchObject({
        '0': 'A2',
        '1': 'B1',
      });

      state = flow.processEvent(state, gameEvent('endStage', null, '1'));

      expect(state.ctx.activePlayers).toMatchObject({
        '0': 'A2',
        '1': 'B2',
      });
    });
  });
});

test('init', () => {
  let flow = Flow({
    phases: { A: { start: true, onEnd: () => ({ done: true }) } },
  });

  const orig = flow.ctx(2);
  let state = { G: {}, ctx: orig };
  state = flow.processEvent(state, gameEvent('init'));
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
    state = flow.processEvent(state, gameEvent('endTurn'));
    expect(state.ctx.gameover).toBe(undefined);

    state.G.win = 'A';

    {
      const t = flow.processEvent(state, gameEvent('endTurn'));
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

test('isPlayerActive', () => {
  const playerID = '0';

  const flow = Flow({});
  expect(flow.isPlayerActive({}, {}, playerID)).toBe(false);
  expect(
    flow.isPlayerActive(
      {},
      { currentPlayer: '0', activePlayers: { '1': '' } },
      playerID
    )
  ).toBe(false);
  expect(flow.isPlayerActive({}, { currentPlayer: '0' }, playerID)).toBe(true);
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

describe('endTurn args', () => {
  const flow = Flow({
    phases: { A: { start: true, next: 'B' }, B: {}, C: {} },
  });

  const state = { ctx: flow.ctx(3) };

  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('no args', () => {
    let t = state;
    t = flow.processEvent(t, gameEvent('endPhase'));
    t = flow.processEvent(t, gameEvent('endTurn'));
    expect(t.ctx.playOrderPos).toBe(1);
    expect(t.ctx.currentPlayer).toBe('1');
    expect(t.ctx.phase).toBe('B');
  });

  test('invalid arg to endTurn', () => {
    let t = state;
    t = flow.processEvent(t, gameEvent('endTurn', '2'));
    expect(error).toBeCalledWith(`invalid argument to endTurn: 2`);
    expect(t.ctx.currentPlayer).toBe('0');
  });

  test('valid args', () => {
    let t = state;
    t = flow.processEvent(t, gameEvent('endTurn', { next: '2' }));
    expect(t.ctx.playOrderPos).toBe(2);
    expect(t.ctx.currentPlayer).toBe('2');
  });
});

describe('pass args', () => {
  const flow = Flow({
    phases: { A: { start: true, next: 'B' }, B: {}, C: {} },
  });

  const state = { ctx: flow.ctx(3) };

  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('no args', () => {
    let t = state;
    t = flow.processEvent(t, gameEvent('pass'));
    expect(t.ctx.turn).toBe(1);
    expect(t.ctx.playOrderPos).toBe(1);
    expect(t.ctx.currentPlayer).toBe('1');
  });

  test('invalid arg to pass', () => {
    let t = state;
    t = flow.processEvent(t, gameEvent('pass', '2'));
    expect(error).toBeCalledWith(`invalid argument to endTurn: 2`);
    expect(t.ctx.currentPlayer).toBe('0');
  });

  test('valid args', () => {
    let t = state;
    t = flow.processEvent(t, gameEvent('pass', { remove: true }));
    expect(t.ctx.turn).toBe(1);
    expect(t.ctx.playOrderPos).toBe(0);
    expect(t.ctx.currentPlayer).toBe('1');
  });

  test('removing all players ends phase', () => {
    let t = state;
    t = flow.processEvent(t, gameEvent('pass', { remove: true }));
    t = flow.processEvent(t, gameEvent('pass', { remove: true }));
    t = flow.processEvent(t, gameEvent('pass', { remove: true }));
    expect(t.ctx.playOrderPos).toBe(0);
    expect(t.ctx.currentPlayer).toBe('0');
    expect(t.ctx.phase).toBe('B');
  });

  test('playOrderPos does not go out of bounds when passing at the end of the list', () => {
    let t = state;
    t = flow.processEvent(t, gameEvent('pass'));
    t = flow.processEvent(t, gameEvent('pass'));
    t = flow.processEvent(t, gameEvent('pass', { remove: true }));
    expect(t.ctx.currentPlayer).toBe('0');
  });

  test('removing a player deeper into play order returns correct updated playOrder', () => {
    let t = state;
    t = flow.processEvent(t, gameEvent('pass'));
    t = flow.processEvent(t, gameEvent('pass', { remove: true }));
    expect(t.ctx.playOrderPos).toBe(1);
    expect(t.ctx.currentPlayer).toBe('2');
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
  client.events.setPhase('B');
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
  test('loop 1', () => {
    const endIf = () => true;
    const game = {
      phases: {
        A: { endIf, next: 'B', start: true },
        B: { endIf, next: 'A' },
      },
    };
    const client = Client({ game });
    expect(client.getState().ctx.phase).toBe(null);
  });

  test('loop 2', () => {
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

  test('loop 3', () => {
    const game = {
      moves: {
        endTurn: (G, ctx) => {
          ctx.events.endTurn();
        },
      },
      turn: {
        onBegin: (G, ctx) => ctx.events.endTurn(),
      },
    };
    const client = Client({ game });
    expect(client.getState().ctx.currentPlayer).toBe('0');
    client.moves.endTurn();
    expect(client.getState().ctx.currentPlayer).toBe('1');
  });

  test('loop 4', () => {
    const game = {
      moves: {
        endTurn: (G, ctx) => {
          ctx.events.endTurn();
        },
      },
      turn: {
        endIf: () => true,
      },
    };
    const client = Client({ game });
    expect(client.getState().ctx.currentPlayer).toBe('0');
    client.moves.endTurn();
    expect(client.getState().ctx.currentPlayer).toBe('1');
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
});

test('events in hooks triggered by moves should be processed', () => {
  const game = {
    turn: {
      onBegin: (G, ctx) => {
        ctx.events.setActivePlayers({ currentPlayer: 'A' });
      },
    },
    moves: {
      endTurn: (G, ctx) => {
        ctx.events.endTurn();
      },
    },
  };

  const client = Client({ game, numPlayers: 3 });

  expect(client.getState().ctx.currentPlayer).toBe('0');
  expect(client.getState().ctx.activePlayers).toEqual({
    '0': 'A',
  });

  client.moves.endTurn();

  expect(client.getState().ctx.currentPlayer).toBe('1');
  expect(client.getState().ctx.activePlayers).toEqual({
    '1': 'A',
  });
});
