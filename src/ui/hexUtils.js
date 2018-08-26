/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

/**
 * Get neighbors
 *
 * A utility function which returns all neighbors for a point
 * expressed in cube coordinates
 *
 * Arguments:
 *   An object with:
 *   x       - X coordinate (cube coordinates)
 *   y       - Y coordinate (cube coordinates)
 *   z       - Z coordinate (cube coordinates)
 *
 */
export const getAllNeighbors = ({ x, y, z }) =>
  [[1, -1, 0], [1, 0, -1], [0, 1, -1], [0, -1, 1], [-1, 1, 0], [-1, 0, 1]]
    .map(([dx, dy, dz]) => [x + dx, y + dy, z + dz])
    .map(([x, y, z]) => ({ x, y, z }));

export const hexUtils = { getAllNeighbors };
