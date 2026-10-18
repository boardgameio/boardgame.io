/*
 * Copyright 2026 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { CreateGameReducer } from '../core/reducer';
import type { Game, LogEntry, State } from '../types';

/** Inputs used to replay a player-visible game log. */
export interface ReplayLogOptions {
  /** The game definition that produced the log. */
  game: Game;
  /** The state from which the visible log begins. */
  initialState: State;
  /** Log entries visible to the player replaying them. */
  log: LogEntry[];
}

/**
 * Reconstructs a state after every visible log entry.
 *
 * Several entries can share an `_stateID` when one action causes game events.
 * The first entry in each group is replayed; the remaining entries describe
 * work the reducer has already performed. Automatic entries are omitted from
 * the return value. The caller must provide an initial state and log that are
 * safe for the player viewing the replay.
 */
export function ReplayLog({
  game,
  initialState,
  log,
}: ReplayLogOptions): State[] {
  const reducer = CreateGameReducer({ game });
  const states: State[] = [];
  let state = initialState;
  let previousStateID: number | undefined;

  for (const { action, automatic, _stateID } of log) {
    if (_stateID !== previousStateID) {
      state = reducer(state, action);
      previousStateID = _stateID;
    }

    if (!automatic) states.push(state);
  }

  return states;
}
