type MoveLimitOptions = {
  minMoves?: number;
  maxMoves?: number;
  moveLimit?: number;
};

/**
 * Adjust the given options to use the new minMoves/maxMoves if a legacy moveLimit was given
 * @param options The options object to apply backwards compatibility to
 * @param enforceMinMoves Use moveLimit to set both minMoves and maxMoves
 */
export function supportDeprecatedMoveLimit(
  options: MoveLimitOptions,
  enforceMinMoves = false
) {
  if (options.moveLimit) {
    if (enforceMinMoves) {
      options.minMoves = options.moveLimit;
    }
    options.maxMoves = options.moveLimit;
    delete options.moveLimit;
  }
}
