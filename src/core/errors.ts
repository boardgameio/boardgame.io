/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

export enum UpdateErrorType {
  // The action’s credentials were missing or invalid
  UnauthorizedAction = 'update/unauthorized_action',
  // The action’s matchID was not found
  MatchNotFound = 'update/match_not_found',
  // Could not apply Patch operation (rfc6902).
  PatchFailed = 'update/patch_failed',
}

export enum ActionErrorType {
  // The action contained a stale state ID
  StaleStateId = 'action/stale_state_id',
  // The requested move is unknown or not currently available
  UnavailableMove = 'action/unavailable_move',
  // The move declared it was invalid (INVALID_MOVE constant)
  InvalidMove = 'action/invalid_move',
  // The player making the action is not currently active
  InactivePlayer = 'action/inactive_player',
  // The game has finished
  GameOver = 'action/gameover',
  // The requested action is disabled (e.g. undo/redo, events)
  ActionDisabled = 'action/action_disabled',
  // The requested action is not currently possible
  ActionInvalid = 'action/action_invalid',
  // The requested action was declared invalid by a plugin
  PluginActionInvalid = 'action/plugin_invalid',
}
