/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

export function Ai({ possibleMoves, score }) {
  if (!score) score = () => 0;

  function expandPossibleMoves(G, ctx, possibleMoves) {
    if (typeof possibleMoves === 'function') {
      return possibleMoves(G, ctx);
    }
    if (!possibleMoves) {
      return [];
    }
    let isMovePossible = possibleMoves.isMovePossible || (() => true);
    let ranges = expandRanges(possibleMoves.ranges);
    let result = [];
    for (let move in ranges) {
      let argsRanges = ranges[move];
      let allArgs = expandArgs(argsRanges);
      let possibleArgs = allArgs.filter(args =>
        isMovePossible({ G, ctx, move, args })
      );
      result = result.concat(
        possibleArgs.map(args => {
          return { move, args };
        })
      );
    }
    return result;
  }

  function expandRanges(ranges) {
    let result = {};
    for (let move in ranges) {
      result[move] = [];
      for (let range of ranges[move]) {
        if (Array.isArray(range)) {
          result[move].push(range);
          continue;
        }
        result[move].push(expandRangeObject(range));
      }
    }
    return result;
  }

  function expandRangeObject(range) {
    let min = range.min || 0;
    let max = range.max;
    let step = range.step || 1;
    let result = [];
    for (let i = min; i <= max; i += step) {
      result.push(i);
    }
    return result;
  }

  function expandArgs(argsRanges) {
    if (argsRanges.length === 0) {
      return [[]];
    }
    let result = [];
    let tailArgs = expandArgs(argsRanges.slice(1));
    for (let arg of argsRanges[0]) {
      result = result.concat(
        tailArgs.map(args => {
          return [arg].concat(args);
        })
      );
    }
    return result;
  }

  return (G, ctx) => {
    return {
      isAvailable: possibleMoves !== undefined,
      possibleMoves: expandPossibleMoves(G, ctx, possibleMoves),
      score: score(G, ctx),
    };
  };
}
