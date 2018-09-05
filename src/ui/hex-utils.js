/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

export const isSame = a => b => a.x === b.x && a.y === b.y && a.z === b.z;
export const createCoordinate = ([x, y, z]) => ({ x, y, z });
const addPoint = (a, b) => ({ x: a.x + b.x, y: a.y + b.y, z: a.z + b.z });
const isContained = (a, points) => points.some(isSame(a));

/**
 * Get neighbors
 *
 * A utility function which returns all neighbors for a point
 * expressed in cube coordinates
 *
 * Arguments:
 *   point      (Cube coorinates)
 *
 */
export const getAllNeighbors = point =>
  [[1, -1, 0], [1, 0, -1], [0, 1, -1], [0, -1, 1], [-1, 1, 0], [-1, 0, 1]].map(
    ([dx, dy, dz]) => addPoint(point, { x: dx, y: dy, z: dz })
  );

/**
 * Get distance
 *
 * A utility function which calculates the distance between two
 * points expressed in cube coordinates
 *
 * Arguments:
 *   Two objects with:
 *   x       - X coordinate (cube coordinates)
 *   y       - Y coordinate (cube coordinates)
 *   z       - Z coordinate (cube coordinates)
 *
 */
export const getDistance = (a, b) =>
  (Math.abs(a.x - b.x) + Math.abs(a.y - b.y) + Math.abs(a.z - b.z)) / 2;

/**
 * Get range
 *
 * A utility function which returns all points within a range
 * from the center
 *
 * Arguments:
 *   center    (Cube coordinates)
 *   distance  number
 *
 */
export const getRange = (center, distance) => {
  const results = [];
  for (let x = -distance; x <= distance; x++) {
    const startY = Math.max(-distance, -x - distance);
    const stopY = Math.min(distance, -x + distance);
    for (let y = startY; y <= stopY; y++) {
      const z = -x - y;
      results.push(addPoint(center, { x, y, z }));
    }
  }
  return results;
};

/**
 * Get reachable
 *
 * A utility function which returns all reachable points given
 * a start, a movement distance, and a set of blocked points
 *
 * Arguments:
 *   start     point (Cube coordinates)
 *   movement  number
 *   blocked   array of blocked points (cube coordinates)
 *
 */
export const getReachable = (start, movement, blocked) => {
  const visited = [start];
  const fringes = [[start]];
  for (let i = 1; i <= movement; i++) {
    fringes.push([]);
    fringes[i - 1]
      .map(getAllNeighbors)
      .reduce((prev, curr) => prev.concat(curr), [])
      .filter(neighbor => !isContained(neighbor, blocked.concat(visited)))
      .forEach(neighbor => {
        visited.push(neighbor);
        fringes[i].push(neighbor);
      });
  }

  return visited;
};

export const HexUtils = {
  getAllNeighbors,
  getDistance,
  getRange,
  getReachable,
};
