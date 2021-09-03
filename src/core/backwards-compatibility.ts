type MoveLimitOptions = {
  minMoves?: number;
  maxMoves?: number;
  moveLimit?: number;
};

export function supportDeprecatedMoveLimit(options: MoveLimitOptions) {
  if (options.moveLimit) {
    options.minMoves = options.moveLimit;
    options.maxMoves = options.moveLimit;
    options.moveLimit = null;
  }
}
