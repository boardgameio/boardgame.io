/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import Game from './game';
import { CreateGameReducer, INVALID_MOVE } from './reducer';
import {
  makeMove,
  gameEvent,
  sync,
  update,
  reset,
  undo,
  redo,
} from './action-creators';

const game = Game({
  moves: {
    A: G => G,
    B: () => ({ moved: true }),
    C: () => ({ victory: true }),
  },
  flow: {
    endGameIf: (G, ctx) => (G.victory ? ctx.currentPlayer : undefined),
  },
});

test('_stateID is incremented', () => {
  const reducer = CreateGameReducer({ game });

  let state = undefined;

  state = reducer(state, makeMove('A'));
  expect(state._stateID).toBe(1);
  state = reducer(state, gameEvent('endTurn'));
  expect(state._stateID).toBe(2);
});

test('when a move returns undef => treat as illegal move', () => {
  const game = Game({
    moves: {
      A: () => INVALID_MOVE,
    },
  });
  const reducer = CreateGameReducer({ game });
  let state = reducer(state, makeMove('A'));
  expect(state._stateID).toBe(0);
});

test('makeMove', () => {
  const reducer = CreateGameReducer({ game });

  let state;

  state = reducer(undefined, { type: 'init' });
  expect(state._stateID).toBe(0);

  state = reducer(state, makeMove('unknown'));
  expect(state._stateID).toBe(0);
  expect(state.G).not.toMatchObject({ moved: true });

  state = reducer(state, makeMove('A'));
  expect(state._stateID).toBe(1);
  expect(state.G).not.toMatchObject({ moved: true });

  state = reducer(state, makeMove('B'));
  expect(state._stateID).toBe(2);
  expect(state.G).toMatchObject({ moved: true });
});

test('disable move by invalid playerIDs', () => {
  const reducer = CreateGameReducer({ game });

  let state;

  state = reducer(undefined, { type: 'init' });
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
  const reducer = CreateGameReducer({ game });
  const state = reducer(undefined, sync({ G: 'restored' }));
  expect(state).toEqual({ G: 'restored' });
});

test('update', () => {
  const reducer = CreateGameReducer({ game });
  const state = reducer(undefined, update({ G: 'restored' }));
  expect(state).toEqual({ G: 'restored' });
});

test('reset', () => {
  const reducer = CreateGameReducer({ game });
  let state = reducer(undefined, makeMove('A'));
  const initialState = { ...state._initial, _initial: { ...state._initial } };

  expect(state).not.toEqual(initialState);
  state = reducer(state, reset());
  expect(state).toEqual(initialState);
});

test('victory', () => {
  const reducer = CreateGameReducer({ game });

  let state = reducer(undefined, makeMove('A'));
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
    const reducer = CreateGameReducer({ game });
    const state = reducer(undefined, gameEvent('endTurn'));
    expect(state.ctx.turn).toBe(1);
  }

  {
    const reducer = CreateGameReducer({ game, multiplayer: true });
    const state = reducer(undefined, gameEvent('endTurn'));
    expect(state.ctx.turn).toBe(0);
  }
});

test('light client when multiplayer=true', () => {
  const game = Game({
    moves: { A: () => ({ win: true }) },
    flow: { endGameIf: G => G.win },
  });

  {
    const reducer = CreateGameReducer({ game });
    let state = reducer(undefined, { type: 'init' });
    expect(state.ctx.gameover).toBe(undefined);
    state = reducer(state, makeMove('A'));
    expect(state.ctx.gameover).toBe(true);
  }

  {
    const reducer = CreateGameReducer({ game, multiplayer: true });
    let state = reducer(undefined, { type: 'init' });
    expect(state.ctx.gameover).toBe(undefined);
    state = reducer(state, makeMove('A'));
    expect(state.ctx.gameover).toBe(undefined);
  }
});

test('optimisticUpdate', () => {
  const game = Game({
    moves: { A: () => ({ A: true }) },
    flow: { optimisticUpdate: () => false },
  });

  {
    const reducer = CreateGameReducer({ game });
    let state = reducer(undefined, { type: 'init' });
    expect(state.G).not.toMatchObject({ A: true });
    state = reducer(state, makeMove('A'));
    expect(state.G).toMatchObject({ A: true });
  }

  {
    const reducer = CreateGameReducer({ game, multiplayer: true });
    let state = reducer(undefined, { type: 'init' });
    expect(state.G).not.toMatchObject({ A: true });
    state = reducer(state, makeMove('A'));
    expect(state.G).not.toMatchObject({ A: true });
  }
});

test('numPlayers', () => {
  const numPlayers = 4;
  const reducer = CreateGameReducer({ game, numPlayers });
  const state = reducer(undefined, gameEvent('endTurn'));
  expect(state.ctx.numPlayers).toBe(4);
});

test('deltalog', () => {
  const reducer = CreateGameReducer({ game });

  let state = undefined;

  const actionA = makeMove('A');
  const actionB = makeMove('B');
  const actionC = gameEvent('endTurn');

  state = reducer(state, actionA);
  expect(state.deltalog).toEqual([{ action: actionA, _stateID: 0 }]);
  state = reducer(state, actionB);
  expect(state.deltalog).toEqual([{ action: actionB, _stateID: 1 }]);
  state = reducer(state, actionC);
  expect(state.deltalog).toEqual([{ action: actionC, _stateID: 2 }]);
});

describe('Events API', () => {
  const fn = (G, ctx) => (ctx.events ? {} : { error: true });

  const game = Game({
    setup: () => ({}),
    flow: {
      phases: { A: {} },
      onTurnBegin: fn,
      onTurnEnd: fn,
      onPhaseBegin: fn,
      onPhaseEnd: fn,
      onMove: fn,
    },
  });

  const reducer = CreateGameReducer({ game });
  let state = reducer(undefined, { type: 'init' });

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
    const reducer1 = CreateGameReducer({ game: game1 });
    const state1 = reducer1(undefined, makeMove());

    const reducer2 = CreateGameReducer({ game: game2 });
    const state2 = reducer2(undefined, makeMove());

    const reducer3 = CreateGameReducer({ game: game3 });
    const state3 = reducer3(undefined, makeMove());

    expect(state1.G.n).not.toBe(state2.G.n);
    expect(state2.G.n).toBe(state3.G.n);
  });

  test('not setting seed sets a default', () => {
    const reducer = CreateGameReducer({ game: game4 });
    const state = reducer(undefined, makeMove());
    expect(state.ctx._random.seed).toBeDefined();
  });
});

test('undo / redo', () => {
  let game = Game({
    moves: {
      move: (G, ctx, arg) => ({ ...G, [arg]: true }),
    },
  });

  const reducer = CreateGameReducer({ game, numPlayers: 2 });

  let state = reducer(undefined, { type: 'init' });

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

  const reducer = CreateGameReducer({ game, numPlayers: 2 });
  let state = reducer(undefined, { type: 'init' });

  const newState = reducer(state, makeMove('move'));
  expect(newState.deltalog[0].payload).toMatchObject({ msg: 'additional msg' });
});
