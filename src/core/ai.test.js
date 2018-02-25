/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { AI, MoveRange } from './ai';

test('no parameters provided', () => {
  let G = {};
  let ctx = {};
  let ai = AI({})(G, ctx);
  expect(ai).toEqual({ isAvailable: false, possibleMoves: [], score: 0 });
});

test('simple possible moves and score', () => {
  let G = { i: 2 };
  let ctx = { turn: 1 };
  let ai = AI({
    possibleMoves: (G, ctx) => {
      return [
        { move: 'foo', args: [0, 0] },
        { move: 'foo', args: [0, G.i] },
        { move: 'bar', args: ['baz ' + ctx.turn] },
      ];
    },
    score: (G, ctx) => {
      return G.i * G.i + ctx.turn;
    },
  })(G, ctx);
  expect(ai.isAvailable).toEqual(true);
  expect(ai.possibleMoves).toEqual([
    { move: 'foo', args: [0, 0] },
    { move: 'foo', args: [0, 2] },
    { move: 'bar', args: ['baz 1'] },
  ]);
  expect(ai.score).toEqual(5);
});

test('MoveRange', () => {
  let G = { i: 2 };
  let ctx = { turn: 1 };
  expect(
    MoveRange({
      foo: [['a', 'b'], ['c'], ['d', 'e']],
      bar: [],
      baz: [[0, 1]],
    })(G, ctx)
  ).toEqual([
    { move: 'foo', args: ['a', 'c', 'd'] },
    { move: 'foo', args: ['a', 'c', 'e'] },
    { move: 'foo', args: ['b', 'c', 'd'] },
    { move: 'foo', args: ['b', 'c', 'e'] },
    { move: 'bar', args: [] },
    { move: 'baz', args: [0] },
    { move: 'baz', args: [1] },
  ]);
});

test('args combinations', () => {
  let G = { i: 2 };
  let ctx = { turn: 1 };
  let ai = AI({
    possibleMoves: MoveRange({
      foo: [['a', 'b'], ['c'], ['d', 'e']],
      bar: [],
      baz: [[0, 1]],
    }),
  })(G, ctx);
  expect(ai.isAvailable).toEqual(true);
  expect(ai.possibleMoves).toEqual([
    { move: 'foo', args: ['a', 'c', 'd'] },
    { move: 'foo', args: ['a', 'c', 'e'] },
    { move: 'foo', args: ['b', 'c', 'd'] },
    { move: 'foo', args: ['b', 'c', 'e'] },
    { move: 'bar', args: [] },
    { move: 'baz', args: [0] },
    { move: 'baz', args: [1] },
  ]);
});

test('args combinations and filtration', () => {
  let G = { i: 2 };
  let ctx = { turn: 1 };
  let aiFn = AI({
    possibleMoves: MoveRange(
      {
        foo: [[1, 2], [3, 4]],
      },
      ({ G, args }) => {
        return args[0] == G.i;
      }
    ),
  });
  expect(aiFn(G, ctx).isAvailable).toEqual(true);
  expect(aiFn(G, ctx).possibleMoves).toEqual([
    { move: 'foo', args: [2, 3] },
    { move: 'foo', args: [2, 4] },
  ]);
  G.i = 1;
  expect(aiFn(G, ctx).possibleMoves).toEqual([
    { move: 'foo', args: [1, 3] },
    { move: 'foo', args: [1, 4] },
  ]);
  G.i = 5;
  expect(aiFn(G, ctx).possibleMoves).toEqual([]);
});

test('range object', () => {
  let G = {};
  let ctx = {};
  let ai = AI({
    possibleMoves: MoveRange({
      foo: [['a', 'b', 'c'], { min: 1, max: 10, step: 3 }],
    }),
  })(G, ctx);
  expect(ai.isAvailable).toEqual(true);
  expect(ai.possibleMoves).toEqual([
    { move: 'foo', args: ['a', 1] },
    { move: 'foo', args: ['a', 4] },
    { move: 'foo', args: ['a', 7] },
    { move: 'foo', args: ['a', 10] },
    { move: 'foo', args: ['b', 1] },
    { move: 'foo', args: ['b', 4] },
    { move: 'foo', args: ['b', 7] },
    { move: 'foo', args: ['b', 10] },
    { move: 'foo', args: ['c', 1] },
    { move: 'foo', args: ['c', 4] },
    { move: 'foo', args: ['c', 7] },
    { move: 'foo', args: ['c', 10] },
  ]);
});
