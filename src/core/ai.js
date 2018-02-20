/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

/**
 * AI
 *
 * Sets up the necessary information for running bots in a game.
 *
 * There are two parts that need to be described:
 * - What are the next possible moves given a particular game state.
 * - What is the evaluation function (score) for a particular state.
 *
 * A bot might use this information to maximize its score and minimize
 * other player's scores (i.e. MiniMax and similar algorithms).
 *
 * @param {...object} possibleMoves - Function with signature (G, ctx) => moves
 *                                    that returns possible moves,
 *
 *                                    OR
 *
 *                                    Object with two keys:
 *                                    {
 *                                      ranges:
 *                                        Object with key as move names
 *                                        and values with arguments ranges. Each
 *                                        range can be an object with {min, max, step}
 *                                        or a list of possible values. Ex:
 *                                        { clickCell: [{min: 0, max: 8}] }
 *
 *                                      isMovePossible:
 *                                        Function with signature
 *                                        (G, ctx, move, args) => bool
 *                                        that should return if a given combination of
 *                                        move and args is possible.
 *                                    }
 *
 * @param {...object} score - Evaluation function with (G, ctx) => score
 *                            signature that returns an evaluation value for
 *                            a given state, which will guide the search
 *                            algorithm.
 */

export function AI({ possibleMoves, score }) {
  if (!score) score = () => 0;

  /**
   * Expand possibleMoves so it returns the list of possible
   * moves given a state. If a function was provided, just
   * executes that function. In the case ranges were provided,
   * expand the ranges and its arguments.
   * @param {object} G Game state.
   * @param {object} ctx Game ctx object.
   * @param {object} possibleMoves Input from Game configuration.
   */
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

  /**
   * Expands the provided ranges of moves arguments. If the
   * range is an array, there is no need to expand.
   * @param {object} ranges Ranges object.
   * @return {object} Expanded ranges object.
   */
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

  /**
   * Expands a range object to its array equivalent.
   * @param {...object=} min Minimum value (inclusive),
   * default value is 0.
   * @param {...object} max Maximum value (inclusive).
   * @param {...object=} step Step size to add from min,
   * default value is 1.
   * @return {Array<number>} Equivalent values.
   */
  function expandRangeObject({ min, max, step }) {
    if (!min) min = 0;
    if (!step) step = 1;
    let result = [];
    for (let i = min; i <= max; i += step) {
      result.push(i);
    }
    return result;
  }

  /**
   * Recursive function that gets all combinations of
   * possible arguments given its ranges. Because
   * it gets all combiations, the number of possible
   * arguments grows fast. Avoid passing too broad
   * ranges.
   * @param {Array<Array<number>>} argRanges Ranges.
   * @return {Array<Array<number>>} Possible values.
   */
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
