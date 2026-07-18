/**
 * Moves can return this when they want to indicate
 * that the combination of arguments is illegal and
 * the move ought to be discarded.
 */
export const INVALID_MOVE = 'INVALID_MOVE';

/**
 * Brand for invalid-move results carrying a payload.
 * A module-private Symbol so that no value a move could
 * legitimately return as game state can collide with it.
 * (Same approach as immer's `nothing` sentinel.)
 */
const InvalidMoveTag = Symbol('INVALID_MOVE');

export interface InvalidMoveResult<Payload = any> {
  [InvalidMoveTag]: true;
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
): InvalidMoveResult<Payload> => ({
  [InvalidMoveTag]: true,
  payload,
});

/** Check whether a move result declared the move invalid. */
export const isInvalidMoveResult = (
  result: unknown,
): result is typeof INVALID_MOVE | InvalidMoveResult =>
  result === INVALID_MOVE ||
  (typeof result === 'object' &&
    result !== null &&
    (result as InvalidMoveResult)[InvalidMoveTag] === true);

/** Extract the payload from an invalid move result, if any. */
export const getInvalidMovePayload = (result: unknown): unknown =>
  typeof result === 'object' &&
  result !== null &&
  (result as InvalidMoveResult)[InvalidMoveTag] === true
    ? (result as InvalidMoveResult).payload
    : undefined;
