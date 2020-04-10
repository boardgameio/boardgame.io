/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import * as Actions from './action-types';
import { SyncInfo, State, LogEntry } from '../types';

/**
 * Generate a move to be dispatched to the game move reducer.
 *
 * @param {string} type - The move type.
 * @param {Array}  args - Additional arguments.
 * @param {string}  playerID - The ID of the player making this action.
 * @param {string}  credentials - (optional) The credentials for the player making this action.
 */
export const makeMove = (
  type: string,
  args?: any,
  playerID?: string | null,
  credentials?: string
) => ({
  type: Actions.MAKE_MOVE as typeof Actions.MAKE_MOVE,
  payload: { type, args, playerID, credentials },
});

/**
 * Generate a game event to be dispatched to the flow reducer.
 *
 * @param {string} type - The event type.
 * @param {Array}  args - Additional arguments.
 * @param {string}  playerID - The ID of the player making this action.
 * @param {string}  credentials - (optional) The credentials for the player making this action.
 */
export const gameEvent = (
  type: string,
  args?: any,
  playerID?: string | null,
  credentials?: string
) => ({
  type: Actions.GAME_EVENT as typeof Actions.GAME_EVENT,
  payload: { type, args, playerID, credentials },
});

/**
 * Generate an automatic game event that is a side-effect of a move.
 * @param {string} type - The event type.
 * @param {Array}  args - Additional arguments.
 * @param {string}  playerID - The ID of the player making this action.
 * @param {string}  credentials - (optional) The credentials for the player making this action.
 */
export const automaticGameEvent = (
  type: string,
  args: any,
  playerID?: string | null,
  credentials?: string
) => ({
  type: Actions.GAME_EVENT as typeof Actions.GAME_EVENT,
  payload: { type, args, playerID, credentials },
  automatic: true,
});

export const sync = (info: SyncInfo) => ({
  type: Actions.SYNC as typeof Actions.SYNC,
  state: info.state,
  log: info.log,
  initialState: info.initialState,
  clientOnly: true as const,
});

/**
 * Used to update the Redux store's state in response to
 * an action coming from another player.
 * @param {object} state - The state to restore.
 * @param {Array} deltalog - A log delta.
 */
export const update = (state: State, deltalog: LogEntry[]) => ({
  type: Actions.UPDATE as typeof Actions.UPDATE,
  state,
  deltalog,
  clientOnly: true as const,
});

/**
 * Used to reset the game state.
 * @param {object} state - The initial state.
 */
export const reset = (state: State) => ({
  type: Actions.RESET as typeof Actions.RESET,
  state,
  clientOnly: true as const,
});

/**
 * Used to undo the last move.
 * @param {string}  playerID - The ID of the player making this action.
 * @param {string}  credentials - (optional) The credentials for the player making this action.
 */
export const undo = (playerID?: string | null, credentials?: string) => ({
  type: Actions.UNDO as typeof Actions.UNDO,
  payload: { type: null, args: null, playerID, credentials },
});

/**
 * Used to redo the last undone move.
 * @param {string}  playerID - The ID of the player making this action.
 * @param {string}  credentials - (optional) The credentials for the player making this action.
 */
export const redo = (playerID?: string | null, credentials?: string) => ({
  type: Actions.REDO as typeof Actions.REDO,
  payload: { type: null, args: null, playerID, credentials },
});

/**
 * Allows plugins to define their own actions and intercept them.
 */
export const plugin = (
  type: string,
  args?: any,
  playerID?: string | null,
  credentials?: string
) => ({
  type: Actions.PLUGIN as typeof Actions.PLUGIN,
  payload: { type, args, playerID, credentials },
});
