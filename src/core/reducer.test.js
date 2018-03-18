/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import Game from './game';
import { createGameReducer } from './reducer';
import { makeMove, gameEvent, restore } from './action-creators';

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

const endTurn = () => gameEvent('endTurn');

test('_stateID is incremented', () => {
  const reducer = createGameReducer({ game });

  let state = undefined;

  state = reducer(state, makeMove('A'));
  expect(state._stateID).toBe(1);
  state = reducer(state, endTurn());
  expect(state._stateID).toBe(2);
});

test('when a move returns undef => treat as illegal move', () => {
  const game = Game({
    moves: {
      A: G => undefined, // eslint-disable-line no-unused-vars
    },
  });
  const reducer = createGameReducer({ game });

  let state = reducer(state, makeMove('A'));

  expect(state._stateID).toBe(0);
});

test('makeMove', () => {
  const reducer = createGameReducer({ game });

  let state;

  state = reducer(undefined, makeMove('unknown'));
  expect(state.G).not.toMatchObject({ moved: true });

  state = reducer(undefined, makeMove('A'));
  expect(state.G).not.toMatchObject({ moved: true });

  state = reducer(undefined, makeMove('B'));
  expect(state.G).toMatchObject({ moved: true });
});

test('restore', () => {
  const reducer = createGameReducer({ game });
  const state = reducer(undefined, restore({ G: 'restored' }));
  expect(state).toEqual({ G: 'restored' });
});

test('victory', () => {
  const reducer = createGameReducer({ game });

  let state = reducer(undefined, makeMove('A'));
  state = reducer(state, endTurn());
  expect(state.ctx.gameover).toEqual(undefined);
  state = reducer(state, makeMove('B'));
  state = reducer(state, endTurn());
  expect(state.ctx.gameover).toEqual(undefined);
  state = reducer(state, makeMove('C'));
  expect(state.ctx.gameover).toEqual('0');
});

test('endTurn', () => {
  {
    const reducer = createGameReducer({ game });
    const state = reducer(undefined, endTurn());
    expect(state.ctx.turn).toBe(1);
  }

  {
    const reducer = createGameReducer({ game, multiplayer: true });
    const state = reducer(undefined, endTurn());
    expect(state.ctx.turn).toBe(0);
  }
});

test('light client when multiplayer=true', () => {
  const game = Game({
    moves: { A: () => ({ win: true }) },
    flow: { endGameIf: G => G.win },
  });

  {
    const reducer = createGameReducer({ game });
    let state = reducer(undefined, { type: 'init' });
    expect(state.ctx.gameover).toBe(undefined);
    state = reducer(state, makeMove('A'));
    expect(state.ctx.gameover).toBe(true);
  }

  {
    const reducer = createGameReducer({ game, multiplayer: true });
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
    const reducer = createGameReducer({ game });
    let state = reducer(undefined, { type: 'init' });
    expect(state.G).not.toMatchObject({ A: true });
    state = reducer(state, makeMove('A'));
    expect(state.G).toMatchObject({ A: true });
  }

  {
    const reducer = createGameReducer({ game, multiplayer: true });
    let state = reducer(undefined, { type: 'init' });
    expect(state.G).not.toMatchObject({ A: true });
    state = reducer(state, makeMove('A'));
    expect(state.G).not.toMatchObject({ A: true });
  }
});

test('numPlayers', () => {
  const numPlayers = 4;
  const reducer = createGameReducer({ game, numPlayers });
  const state = reducer(undefined, endTurn());
  expect(state.ctx.numPlayers).toBe(4);
});

test('log', () => {
  const reducer = createGameReducer({ game });

  let state = undefined;

  const actionA = makeMove('A');
  const actionB = makeMove('B');
  const actionC = endTurn();

  state = reducer(state, actionA);
  expect(state.log).toEqual([actionA]);
  state = reducer(state, actionB);
  expect(state.log).toEqual([actionA, actionB]);
  state = reducer(state, actionC);
  expect(state.log).toEqual([actionA, actionB, actionC.payload]);
});

test('using Random inside setup()', () => {
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

  const reducer1 = createGameReducer({ game: game1 });
  const state1 = reducer1(undefined, makeMove());

  const reducer2 = createGameReducer({ game: game2 });
  const state2 = reducer2(undefined, makeMove());

  const reducer3 = createGameReducer({ game: game3 });
  const state3 = reducer3(undefined, makeMove());

  expect(state1.G.n).not.toBe(state2.G.n);
  expect(state2.G.n).toBe(state3.G.n);
});
