/**
 * Moves can return this when they want to indicate
 * that the combination of arguments is illegal and
 * the move ought to be discarded.
 */
export const INVALID_MOVE = 'INVALID_MOVE';

// Must be a registry symbol: each subpath bundle gets its own copy of this
// module, and a per-module Symbol() would not match across them. Symbols
// cannot occur in JSON, so game data cannot collide with this tag.
const InvalidMoveTag = Symbol.for('boardgame.io/INVALID_MOVE');

// Type-level brand only — never present at runtime.
declare const InvalidMoveBrand: unique symbol;

export interface InvalidMoveResult<Payload = any> {
  readonly [InvalidMoveBrand]: true;
  payload: Payload;
}

/**
 * Moves can return `Invalid(payload)` instead of the bare `INVALID_MOVE`
 * constant to attach a payload (e.g. a rejection reason) to the invalid
 * move. The payload is delivered to the acting client on the action
 * error and is never merged into game state.
 */
export const Invalid = <Payload>(
  payload?: Payload,
): InvalidMoveResult<Payload> =>
  ({
    [InvalidMoveTag]: true,
    payload,
  }) as unknown as InvalidMoveResult<Payload>;

const hasInvalidMoveTag = (result: unknown): boolean =>
  typeof result === 'object' &&
  result !== null &&
  (result as Record<symbol, unknown>)[InvalidMoveTag] === true;

/** Check whether a move result declared the move invalid. */
export const isInvalidMoveResult = (
  result: unknown,
): result is typeof INVALID_MOVE | InvalidMoveResult =>
  result === INVALID_MOVE || hasInvalidMoveTag(result);

/** Extract the payload from an invalid move result, if any. */
export const getInvalidMovePayload = (result: unknown): unknown =>
  hasInvalidMoveTag(result) ? (result as InvalidMoveResult).payload : undefined;
