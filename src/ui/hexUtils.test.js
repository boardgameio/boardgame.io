/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { getAllNeighbors, getDistance } from './hexUtils';

const createCoordinate = ([x, y, z]) => ({ x, y, z });

test('neighbors of origo', () => {
  const coordinate = createCoordinate([0, 0, 0]);
  const result = getAllNeighbors(coordinate);
  const expectedNeighbors = [
    [1, -1, 0],
    [1, 0, -1],
    [0, 1, -1],
    [0, -1, 1],
    [-1, 1, 0],
    [-1, 0, 1],
  ].map(createCoordinate);
  expect(result).toEqual(expectedNeighbors);
});

test('neighbors of (1, 0, -1)', () => {
  const coordinate = createCoordinate([1, 0, -1]);
  const result = getAllNeighbors(coordinate);
  const expectedNeighbors = [
    [2, -1, -1],
    [2, 0, -2],
    [1, 1, -2],
    [1, -1, 0],
    [0, 1, -1],
    [0, 0, 0],
  ].map(createCoordinate);
  expect(result).toEqual(expectedNeighbors);
});

test('distance between neighbors', () => {
  const origo = createCoordinate([0, 0, 0]);
  const neighbor = createCoordinate([1, 0, -1]);
  const result = getDistance(origo, neighbor);
  expect(result).toEqual(1);
});

test('distance between non-neighbors', () => {
  const origo = createCoordinate([0, 0, 0]);
  const nonNeighbor = createCoordinate([3, 3, -6]);
  const result = getDistance(origo, nonNeighbor);
  expect(result).toEqual(6);
});
