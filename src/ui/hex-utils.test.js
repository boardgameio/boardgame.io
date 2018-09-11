/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import {
  getAllNeighbors,
  getDistance,
  getRange,
  getReachable,
  createCoordinate,
} from './hex-utils';

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

test('range from origo', () => {
  const origo = createCoordinate([0, 0, 0]);
  const result = getRange(origo, 1);
  expect(result).toEqual(
    [
      [-1, 0, 1],
      [-1, 1, 0],
      [0, -1, 1],
      [0, 0, 0],
      [0, 1, -1],
      [1, -1, 0],
      [1, 0, -1],
    ].map(createCoordinate)
  );
});

test('range not from origo', () => {
  const origo = createCoordinate([2, -3, 1]);
  const result = getRange(origo, 2);
  expect(result).toEqual(
    [
      [0, -3, 3],
      [0, -2, 2],
      [0, -1, 1],
      [1, -4, 3],
      [1, -3, 2],
      [1, -2, 1],
      [1, -1, 0],
      [2, -5, 3],
      [2, -4, 2],
      [2, -3, 1],
      [2, -2, 0],
      [2, -1, -1],
      [3, -5, 2],
      [3, -4, 1],
      [3, -3, 0],
      [3, -2, -1],
      [4, -5, 1],
      [4, -4, 0],
      [4, -3, -1],
    ].map(createCoordinate)
  );
});

test('getReachable', () => {
  const origo = createCoordinate([0, 0, 0]);
  const result = getReachable(
    origo,
    3,
    [
      [0, 1, -1],
      [1, 0, -1],
      [2, -1, -1],
      [0, -1, 1],
      [-1, 0, 1],
      [-2, 2, 0],
    ].map(createCoordinate)
  );
  expect(result).toEqual(
    [
      [0, 0, 0],
      [1, -1, 0],
      [-1, 1, 0],
      [2, -2, 0],
      [1, -2, 1],
      [-1, 2, -1],
      [-2, 1, 1],
      [3, -3, 0],
      [3, -2, -1],
      [2, -3, 1],
      [2, -3, 1],
      [1, -3, 2],
      [0, -2, 2],
      [0, 2, -2],
      [-1, 3, -2],
      [-2, 3, -1],
      [-2, 0, 2],
      [-3, 2, 1],
      [-3, 1, 2],
    ].map(createCoordinate)
  );
});
