/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { genrandom, Random } from './random';
import Game from './game';
import { makeMove } from './action-creators';
import { createGameReducer } from './reducer';

test('genrandom', () => {
  const G = { _random: { seed: 'hi there' } };

  // make sure that on subsequent calls different numbers are generated.
  let { G: G2, randomnumber } = genrandom(G);
  expect(randomnumber).toBe(0.573445922927931);
  let { G: G3, randomnumber: randomnumber2 } = genrandom(G2);
  expect(randomnumber2).toBe(0.4695413049776107);
  let { G: G4, randomnumber: randomnumber3 } = genrandom(G3);
  expect(randomnumber3).toBe(0.5943194630090147);
  expect(G4).not.toMatchObject(G3);
});

test('predefined dice values', () => {
  let G = { _random: { seed: 0 } };

  const rfns = [4, 6, 8, 10, 12, 20].map(v => {
    return { fn: Random[`D${v}`], highest: v };
  });

  rfns.forEach(pair => {
    const G2 = pair.fn(G, 'field1');
    expect(G2.field1).toBeDefined();
    expect(G2.field1).toBeGreaterThanOrEqual(1);
    expect(G2.field1).toBeLessThanOrEqual(pair.highest);
  });
});

test('Random.Die', () => {
  const G = { _random: { seed: 0 } };
  const G2 = Random.Die(G, 'field1', 123);
  expect(G2.field1).toBeDefined();
  expect(G2.field1).toBe(74);
});

test('Random.Number', () => {
  const G = { _random: { seed: 0 } };
  const G2 = Random.Number(G, 'field1');
  expect(G2.field1).toBeDefined();
  expect(G2.field1).toBeGreaterThanOrEqual(0);
  expect(G2.field1).toBeLessThanOrEqual(1);
});

test('Random.Shuffle', () => {
  const initialTiles = ['A', 'B', 'C', 'D', 'E'];
  const G = {
    _random: { seed: 'some_predetermined_seed' },
    tiles: initialTiles,
  };
  const G2 = Random.Shuffle(G, 'tiles');
  expect(G2.tiles.length).toEqual(initialTiles.length);
  expect(G2.tiles).toEqual(expect.arrayContaining(initialTiles));
  expect(G2.tiles.sort()).toEqual(initialTiles);
});

test('Random API is not executed optimisitically', () => {
  const game = Game({
    moves: {
      rollDie(G) {
        return Random.D6(G, 'die');
      },
    },
    flow: { seed: '0' },
  });

  {
    const reducer = createGameReducer({ game });
    let state = reducer(undefined, { type: 'init' });
    expect(state.G.die).not.toBeDefined();
    state = reducer(state, makeMove('rollDie'));
    expect(state.G).toMatchObject({ die: 4 });
  }

  {
    const reducer = createGameReducer({ game, multiplayer: true });
    let state = reducer(undefined, { type: 'init' });
    expect(state.G.die).not.toBeDefined();
    state = reducer(state, makeMove('rollDie'));
    expect(state.G.die).not.toBeDefined();
  }
});
