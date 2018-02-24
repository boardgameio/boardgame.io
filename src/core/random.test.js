/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { random, Random, PRNGState } from './random';
import Game from './game';
import { makeMove } from './action-creators';
import { createGameReducer } from './reducer';

test('random', () => {
  PRNGState.set({ seed: 'hi there' });
  // make sure that subsequent calls are different.
  expect(random()).toBe(0.573445922927931);
  expect(random()).toBe(0.4695413049776107);
  expect(random()).toBe(0.5943194630090147);
});

test('predefined dice values', () => {
  PRNGState.set({ seed: 0 });

  const rfns = [4, 6, 8, 10, 12, 20].map(v => {
    return { fn: Random[`D${v}`], highest: v };
  });

  rfns.forEach(pair => {
    const result = pair.fn();
    expect(result).toBeDefined();
    expect(result).toBeGreaterThanOrEqual(1);
    expect(result).toBeLessThanOrEqual(pair.highest);
    expect(PRNGState.get().prngstate).toBeDefined();

    const multiple = pair.fn(5);
    expect(multiple).toBeDefined();
    expect(multiple.length).toBe(5);
    multiple.forEach(m => {
      expect(m).toBeGreaterThanOrEqual(1);
      expect(m).toBeLessThanOrEqual(pair.highest);
    });
  });
});

test('Random.Die', () => {
  PRNGState.set({ seed: 0 });

  {
    const result = Random.Die(123);
    expect(result).toBeDefined();
    expect(result).toBe(74);
    expect(PRNGState.get().prngstate).toBeDefined();
  }

  {
    const result = Random.Die();
    expect(result).toBeDefined();
    expect(result).toBeLessThanOrEqual(6);
    expect(PRNGState.get().prngstate).toBeDefined();
  }

  {
    const multiple = Random.Die(6, 3);
    expect(multiple).toBeDefined();
    expect(multiple.length).toBe(3);
    multiple.forEach(m => {
      expect(m).toBeGreaterThanOrEqual(1);
      expect(m).toBeLessThanOrEqual(6);
    });
    expect(PRNGState.get().prngstate).toBeDefined();
  }
});

test('Random.Number', () => {
  PRNGState.set({ seed: 0 });
  const result = Random.Number();
  expect(result).toBeDefined();
  expect(result).toBeGreaterThanOrEqual(0);
  expect(result).toBeLessThanOrEqual(1);
  expect(PRNGState.get().prngstate).toBeDefined();
});

test('Random.Shuffle', () => {
  PRNGState.set({ seed: 0 });
  const initialTiles = ['A', 'B', 'C', 'D', 'E'];
  const tiles = [...initialTiles];
  const result = Random.Shuffle(tiles);
  expect(result.length).toEqual(initialTiles.length);
  expect(result).toEqual(expect.arrayContaining(initialTiles));
  expect(result.sort()).toEqual(initialTiles);
  expect(PRNGState.get().prngstate).toBeDefined();
});

test('Random API is not executed optimisitically', () => {
  const game = Game({
    seed: 0,
    moves: {
      rollDie: G => ({ ...G, die: Random.D6() }),
    },
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
