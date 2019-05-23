/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import Game from './game';
import { InitializeGame, CreateGameReducer, INVALID_MOVE } from './reducer';
import {
  makeMove,
  gameEvent,
  sync,
  update,
  reset,
  undo,
  redo,
} from './action-creators';
import { error } from '../core/logger';

jest.mock('../core/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
}));

const game = Game({
  moves: {
    A: G => G,
    B: () => ({ moved: true }),
    C: () => ({ victory: true }),
  },
  endIf: (G, ctx) => (G.victory ? ctx.currentPlayer : undefined),
});
const reducer = CreateGameReducer({ game });
const initialState = InitializeGame({ game });

test('_stateID is incremented', () => {
  let state = initialState;
  state = reducer(state, makeMove('A'));
  expect(state._stateID).toBe(1);
  state = reducer(state, gameEvent('endTurn'));
  expect(state._stateID).toBe(2);
});

test('move returns INVALID_MOVE', () => {
  const game = Game({
    moves: {
      A: () => INVALID_MOVE,
    },
  });
  const reducer = CreateGameReducer({ game });
  let state = reducer(initialState, makeMove('A'));
  expect(state._stateID).toBe(0);
});

test('makeMove', () => {
  let state = initialState;
  expect(state._stateID).toBe(0);

  state = reducer(state, makeMove('unknown'));
  expect(state._stateID).toBe(0);
  expect(state.G).not.toMatchObject({ moved: true });
  expect(error).toHaveBeenCalledWith('unrecognized move: unknown');

  state = reducer(state, makeMove('A'));
  expect(state._stateID).toBe(1);
  expect(state.G).not.toMatchObject({ moved: true });

  state = reducer(state, makeMove('B'));
  expect(state._stateID).toBe(2);
  expect(state.G).toMatchObject({ moved: true });
});

test('disable move by invalid playerIDs', () => {
  let state = initialState;
  expect(state._stateID).toBe(0);

  // playerID="1" cannot move right now.
  state = reducer(state, makeMove('A', null, '1'));
  expect(state._stateID).toBe(0);

  // playerID="1" cannot call events right now.
  state = reducer(state, gameEvent('endTurn', null, '1'));
  expect(state._stateID).toBe(0);

  // playerID="0" can move.
  state = reducer(state, makeMove('A', null, '0'));
  expect(state._stateID).toBe(1);

  // playerID=undefined can always move.
  state = reducer(state, makeMove('A'));
  expect(state._stateID).toBe(2);
});

test('sync', () => {
  const state = reducer(undefined, sync({ G: 'restored' }));
  expect(state).toEqual({ G: 'restored' });
});

test('update', () => {
  const state = reducer(undefined, update({ G: 'restored' }));
  expect(state).toEqual({ G: 'restored' });
});

test('reset', () => {
  let state = reducer(initialState, makeMove('A'));
  expect(state).not.toEqual(initialState);
  state = reducer(state, reset(initialState));
  expect(state).toEqual(initialState);
});

test('victory', () => {
  let state = reducer(initialState, makeMove('A'));
  state = reducer(state, gameEvent('endTurn'));
  expect(state.ctx.gameover).toEqual(undefined);
  state = reducer(state, makeMove('B'));
  state = reducer(state, gameEvent('endTurn'));
  expect(state.ctx.gameover).toEqual(undefined);
  state = reducer(state, makeMove('C'));
  expect(state.ctx.gameover).toEqual('0');
});

test('endTurn', () => {
  {
    let state = reducer(initialState, gameEvent('endTurn'));
    expect(state.ctx.turn).toBe(1);
  }

  {
    const reducer = CreateGameReducer({ game, multiplayer: true });
    let state = reducer(initialState, gameEvent('endTurn'));
    expect(state.ctx.turn).toBe(0);
  }
});

test('light client when multiplayer=true', () => {
  const game = Game({
    moves: { A: () => ({ win: true }) },
    endIf: G => G.win,
  });

  {
    const reducer = CreateGameReducer({ game });
    let state = InitializeGame({ game });
    expect(state.ctx.gameover).toBe(undefined);
    state = reducer(state, makeMove('A'));
    expect(state.ctx.gameover).toBe(true);
  }

  {
    const reducer = CreateGameReducer({ game, multiplayer: true });
    let state = InitializeGame({ game });
    expect(state.ctx.gameover).toBe(undefined);
    state = reducer(state, makeMove('A'));
    expect(state.ctx.gameover).toBe(undefined);
  }
});

test('optimisticUpdate', () => {
  const game = Game({
    moves: { A: () => ({ A: true }) },
    optimisticUpdate: () => false,
  });

  {
    const reducer = CreateGameReducer({ game });
    let state = InitializeGame({ game });
    expect(state.G).not.toMatchObject({ A: true });
    state = reducer(state, makeMove('A'));
    expect(state.G).toMatchObject({ A: true });
  }

  {
    const reducer = CreateGameReducer({ game, multiplayer: true });
    let state = InitializeGame({ game });
    expect(state.G).not.toMatchObject({ A: true });
    state = reducer(state, makeMove('A'));
    expect(state.G).not.toMatchObject({ A: true });
  }
});

test('numPlayers', () => {
  const numPlayers = 4;
  const state = InitializeGame({ game, numPlayers });
  expect(state.ctx.numPlayers).toBe(4);
});

test('deltalog', () => {
  let state = initialState;

  const actionA = makeMove('A');
  const actionB = makeMove('B');
  const actionC = gameEvent('endTurn');

  state = reducer(state, actionA);
  expect(state.deltalog).toEqual([
    {
      action: actionA,
      _stateID: 0,
      phase: 'default',
      turn: 0,
    },
  ]);
  state = reducer(state, actionB);
  expect(state.deltalog).toEqual([
    {
      action: actionB,
      _stateID: 1,
      phase: 'default',
      turn: 0,
    },
  ]);
  state = reducer(state, actionC);
  expect(state.deltalog).toEqual([
    {
      action: actionC,
      _stateID: 2,
      phase: 'default',
      turn: 0,
    },
  ]);
});

describe('Events API', () => {
  const fn = (G, ctx) => (ctx.events ? {} : { error: true });

  const game = Game({
    setup: () => ({}),
    phases: { A: {} },
    turn: {
      onBegin: fn,
      onEnd: fn,
    },
    onMove: fn,
  });

  const reducer = CreateGameReducer({ game });
  let state = InitializeGame({ game });

  test('is attached at the beginning', () => {
    expect(state.G).not.toEqual({ error: true });
  });

  test('is attached at the end of turns', () => {
    state = reducer(state, gameEvent('endTurn'));
    expect(state.G).not.toEqual({ error: true });
  });

  test('is attached at the end of phases', () => {
    state = reducer(state, gameEvent('endPhase'));
    expect(state.G).not.toEqual({ error: true });
  });
});

describe('Random inside setup()', () => {
  const game1 = Game({
    seed: 'seed1',
    setup: ctx => ({ n: ctx.random.D6() }),
  });

  const game2 = Game({
    seed: 'seed2',
    setup: ctx => ({ n: ctx.random.D6() }),
  });

  const game3 = Game({
    seed: 'seed2',
    setup: ctx => ({ n: ctx.random.D6() }),
  });

  const game4 = Game({
    setup: ctx => ({ n: ctx.random.D6() }),
  });

  test('setting seed', () => {
    const state1 = InitializeGame({ game: game1 });
    const state2 = InitializeGame({ game: game2 });
    const state3 = InitializeGame({ game: game3 });

    expect(state1.G.n).not.toBe(state2.G.n);
    expect(state2.G.n).toBe(state3.G.n);
  });

  test('not setting seed sets a default', () => {
    const state = InitializeGame({ game: game4 });
    expect(state.ctx._random.seed).toBeDefined();
  });
});

test('undo / redo', () => {
  let game = Game({
    moves: {
      move: (G, ctx, arg) => ({ ...G, [arg]: true }),
      nextPhase: (G, ctx) => {
        ctx.events.endPhase({ next: 'phase2' });
      },
    },
    startingPhase: 'phase1',
    phases: {
      phase1: {},
      phase2: {},
    },
  });

  const reducer = CreateGameReducer({ game, numPlayers: 2 });

  let state = InitializeGame({ game });

  state = reducer(state, makeMove('move', 'A'));
  expect(state.G).toEqual({ A: true });

  state = reducer(state, makeMove('move', 'B'));
  expect(state.G).toEqual({ A: true, B: true });
  expect(state._undo[1].ctx.events).toBeUndefined();
  expect(state._undo[1].ctx.random).toBeUndefined();

  state = reducer(state, undo());
  expect(state.G).toEqual({ A: true });

  state = reducer(state, redo());
  expect(state.G).toEqual({ A: true, B: true });

  state = reducer(state, redo());
  expect(state.G).toEqual({ A: true, B: true });

  state = reducer(state, undo());
  expect(state.G).toEqual({ A: true });

  state = reducer(state, undo());
  state = reducer(state, undo());
  state = reducer(state, undo());
  expect(state.G).toEqual({});

  state = reducer(state, redo());
  state = reducer(state, makeMove('move', 'C'));
  expect(state.G).toEqual({ A: true, C: true });

  state = reducer(state, undo());
  expect(state.G).toEqual({ A: true });

  state = reducer(state, redo());
  expect(state.G).toEqual({ A: true, C: true });

  state = reducer(state, undo());
  state = reducer(state, undo());
  state = reducer(state, makeMove('move', 'A'));
  expect(state.G).toEqual({ A: true });

  state = reducer(state, makeMove('nextPhase'));
  expect(state.G).toEqual({ A: true });
  expect(state.ctx.phase).toEqual('phase2');
  expect(state.ctx).toEqual(state._undo[state._undo.length - 1].ctx);

  state = reducer(state, makeMove('move', 'B'));
  expect(state.G).toEqual({ A: true, B: true });
  expect(state.ctx.phase).toEqual('phase2');
  expect(state.ctx).toEqual(state._undo[state._undo.length - 1].ctx);

  state = reducer(state, undo());
  expect(state.G).toEqual({ A: true });
  expect(state.ctx.phase).toEqual('phase2');
  expect(state.ctx).toEqual(state._undo[state._undo.length - 1].ctx);

  state = reducer(state, redo());
  expect(state.G).toEqual({ A: true, B: true });
  expect(state.ctx.phase).toEqual('phase2');
  expect(state.ctx).toEqual(state._undo[state._undo.length - 1].ctx);

  state = reducer(state, undo());
  expect(state.G).toEqual({ A: true });
  expect(state.ctx.phase).toEqual('phase2');
  expect(state.ctx).toEqual(state._undo[state._undo.length - 1].ctx);

  state = reducer(state, undo());
  expect(state.G).toEqual({ A: true });
  expect(state.ctx.phase).toEqual('phase1');
  expect(state.ctx).toEqual(state._undo[state._undo.length - 1].ctx);

  state = reducer(state, redo());
  expect(state.G).toEqual({ A: true });
  expect(state.ctx.phase).toEqual('phase2');
  expect(state.ctx).toEqual(state._undo[state._undo.length - 1].ctx);

  state = reducer(state, undo());
  state = reducer(state, gameEvent('endTurn'));
  state = reducer(state, undo());
  expect(state.G).toEqual({ A: true });
});

test('custom log messages', () => {
  let game = Game({
    moves: {
      move: (G, ctx) => {
        ctx.log.setPayload({ msg: 'additional msg' });
        return { ...G };
      },
    },
  });

  const reducer = CreateGameReducer({ game });
  let state = InitializeGame({ game });

  const newState = reducer(state, makeMove('move'));
  expect(newState.deltalog[0].payload).toMatchObject({ msg: 'additional msg' });
});
