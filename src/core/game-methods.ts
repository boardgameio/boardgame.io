import type { O } from 'ts-toolbelt';

const Game = {
  ON_END: 'GAME.ON_END',
} as const;

const Phase = {
  ON_BEGIN: 'PHASE.ON_BEGIN',
  ON_END: 'PHASE.ON_END',
} as const;

const Turn = {
  ON_BEGIN: 'TURN.ON_BEGIN',
  ON_MOVE: 'TURN.ON_MOVE',
  ON_END: 'TURN.ON_END',
} as const;

const MOVE = 'MOVE';

export const GameMethod = { Game, Phase, Turn, MOVE } as const;

export type GameMethodNames =
  | O.UnionOf<typeof Game>
  | O.UnionOf<typeof Phase>
  | O.UnionOf<typeof Turn>
  | typeof MOVE;
