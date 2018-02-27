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
 *                                    that returns an array of possible moves.
 *                                    Each move must be of this format:
 *                                    { move: string, args: [] }
 *
 * @param {...object} score - Function with signature (G, ctx) => score
 *                            that returns a score for a given state,
 *                            which will guide the AI search algorithm.
 */

export function AI({ possibleMoves, score }) {
  if (!score) score = () => 0;

  return (G, ctx) => {
    if (possibleMoves === undefined) {
      return {
        isAvailable: false,
        possibleMoves: [],
        score: 0,
      };
    } else {
      return {
        isAvailable: true,
        possibleMoves: possibleMoves(G, ctx),
        score: score(G, ctx),
      };
    }
  };
}

/**
 * Utility function that lists all possible moves given move argument
 * ranges and a check function.
 * @param {object} ranges Object with key as move names and values
 *                        with an array of arguments ranges.
 *                        Each range entry can be an object with
 *                        {min, max, step} or a list of possible values.
 *                        Ex: For A1, B1, A2, B2
 *                            { exMove: [{min: 1, max: 2}, ['A', 'B']] }
 * @param {(object)=>bool} isMovePossible Function with arg as object
 *                                        { G, ctx, move, args } that
 *                                        should return if a given
 *                                        combination of move and args
 *                                        is possible.
 * @param {object} G Game state.
 * @param {object} ctx Game ctx object.
 */
export function MoveRange(ranges, isMovePossible) {
  var isMovePossibleInput = isMovePossible || (() => true);
  var rangesInput = ranges;
  return function(G, ctx) {
    let ranges = expandRanges(rangesInput);
    let result = [];
    for (let move in ranges) {
      let argsRanges = ranges[move];
      let allArgs = expandArgs(argsRanges);
      let possibleArgs = allArgs.filter(args =>
        isMovePossibleInput({ G, ctx, move, args })
      );
      result = result.concat(
        possibleArgs.map(args => {
          return { move, args };
        })
      );
    }
    return result;
  };
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
