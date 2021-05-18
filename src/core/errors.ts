export enum UpdateErrorType {
  // The action’s credentials were missing or invalid
  UnauthorizedAction = 'update/unauthorized_action',
  // The action’s matchID was not found
  MatchNotFound = 'match_not_found',
  // Could not apply Patch operation (rfc6902).
  PatchFailed = 'patch_failed',
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
}
