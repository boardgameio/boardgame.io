/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import * as Actions from './action-types';
import * as plugins from '../plugins/main';
import { ProcessGameConfig } from './game';
import { error } from './logger';
import { INVALID_MOVE } from './constants';
import type { Dispatch } from 'redux';
import type {
  ActionShape,
  Ctx,
  ErrorType,
  Game,
  LogEntry,
  LongFormMove,
  Move,
  State,
  Store,
  TransientMetadata,
  TransientState,
  Undo,
} from '../types';
import { stripTransients } from './action-creators';
import { ActionErrorType, UpdateErrorType } from './errors';
import { applyPatch } from 'rfc6902';

/**
 * Check if the payload for the passed action contains a playerID.
 */
const actionHasPlayerID = (
  action:
    | ActionShape.MakeMove
    | ActionShape.GameEvent
    | ActionShape.Undo
    | ActionShape.Redo
) => action.payload.playerID !== null && action.payload.playerID !== undefined;

/**
 * Returns true if a move can be undone.
 */
const CanUndoMove = (G: any, ctx: Ctx, move: Move): boolean => {
  function HasUndoable(move: Move): move is LongFormMove {
    return (move as LongFormMove).undoable !== undefined;
  }

  function IsFunction(
    undoable: boolean | ((...args: any[]) => any)
  ): undoable is (...args: any[]) => any {
    return undoable instanceof Function;
  }

  if (!HasUndoable(move)) {
    return true;
  }

  if (IsFunction(move.undoable)) {
    return move.undoable({ G, ctx });
  }

  return move.undoable;
};

/**
 * Update the undo and redo stacks for a move or event.
 */
function updateUndoRedoState(
  state: State,
  opts: {
    game: Game;
    action: ActionShape.GameEvent | ActionShape.MakeMove;
  }
): State {
  if (opts.game.disableUndo) return state;

  const undoEntry: Undo = {
    G: state.G,
    ctx: state.ctx,
    plugins: state.plugins,
    playerID: opts.action.payload.playerID || state.ctx.currentPlayer,
  };

  if (opts.action.type === 'MAKE_MOVE') {
    undoEntry.moveType = opts.action.payload.type;
  }

  return {
    ...state,
    _undo: [...state._undo, undoEntry],
    // Always reset redo stack when making a move or event
    _redo: [],
  };
}

/**
 * Process state, adding the initial deltalog for this action.
 */
function initializeDeltalog(
  state: State,
  action: ActionShape.MakeMove | ActionShape.Undo | ActionShape.Redo,
  move?: Move
): TransientState {
  // Create a log entry for this action.
  const logEntry: LogEntry = {
    action,
    _stateID: state._stateID,
    turn: state.ctx.turn,
    phase: state.ctx.phase,
  };

  const pluginLogMetadata = state.plugins.log.data.metadata;
  if (pluginLogMetadata !== undefined) {
    logEntry.metadata = pluginLogMetadata;
  }

  if (typeof move === 'object' && move.redact === true) {
    logEntry.redact = true;
  } else if (typeof move === 'object' && move.redact instanceof Function) {
    logEntry.redact = move.redact({ G: state.G, ctx: state.ctx });
  }

  return {
    ...state,
    deltalog: [logEntry],
  };
}

/**
 * Update plugin state after move/event & check if plugins consider the action to be valid.
 * @param state Current version of state in the reducer.
 * @param oldState State to revert to in case of error.
 * @param pluginOpts Plugin configuration options.
 * @returns Tuple of the new state updated after flushing plugins and the old
 * state augmented with an error if a plugin declared the action invalid.
 */
function flushAndValidatePlugins(
  state: State,
  oldState: State,
  pluginOpts: { game: Game; isClient?: boolean }
): [State, TransientState?] {
  const [newState, isInvalid] = plugins.FlushAndValidate(state, pluginOpts);
  if (!isInvalid) return [newState];
  return [
    newState,
    WithError(oldState, ActionErrorType.PluginActionInvalid, isInvalid),
  ];
}

/**
 * ExtractTransientsFromState
 *
 * Split out transients from the a TransientState
 */
function ExtractTransients(
  transientState: TransientState | null
): [State | null, TransientMetadata | undefined] {
  if (!transientState) {
    // We preserve null for the state for legacy callers, but the transient
    // field should be undefined if not present to be consistent with the
    // code path below.
    return [null, undefined];
  }
  const { transients, ...state } = transientState;
  return [state as State, transients as TransientMetadata];
}

/**
 * WithError
 *
 * Augment a State instance with transient error information.
 */
function WithError<PT extends any = any>(
  state: State,
  errorType: ErrorType,
  payload?: PT
): TransientState {
  const error = {
    type: errorType,
    payload,
  };
  return {
    ...state,
    transients: {
      error,
    },
  };
}

/**
 * Middleware for processing TransientState associated with the reducer
 * returned by CreateGameReducer.
 * This should pretty much be used everywhere you want realistic state
 * transitions and error handling.
 */
export const TransientHandlingMiddleware =
  (store: Store) =>
  (next: Dispatch<ActionShape.Any>) =>
  (action: ActionShape.Any) => {
    const result = next(action);
    switch (action.type) {
      case Actions.STRIP_TRANSIENTS: {
        return result;
      }
      default: {
        const [, transients] = ExtractTransients(store.getState());
        if (typeof transients !== 'undefined') {
          store.dispatch(stripTransients());
          // Dev Note: If parent middleware needs to correlate the spawned
          // StripTransients action to the triggering action, instrument here.
          //
          // This is a bit tricky; for more details, see:
          //   https://github.com/boardgameio/boardgame.io/pull/940#discussion_r636200648
          return {
            ...result,
            transients,
          };
        }
        return result;
      }
    }
  };

/**
 * CreateGameReducer
 *
 * Creates the main game state reducer.
 */
export function CreateGameReducer({
  game,
  isClient,
}: {
  game: Game;
  isClient?: boolean;
}) {
  game = ProcessGameConfig(game);

  /**
   * GameReducer
   *
   * Redux reducer that maintains the overall game state.
   * @param {object} state - The state before the action.
   * @param {object} action - A Redux action.
   */
  return (
    stateWithTransients: TransientState | null = null,
    action: ActionShape.Any
  ): TransientState => {
    let [state /*, transients */] = ExtractTransients(stateWithTransients);
    switch (action.type) {
      case Actions.STRIP_TRANSIENTS: {
        // This action indicates that transient metadata in the state has been
        // consumed and should now be stripped from the state..
        return state;
      }

      case Actions.GAME_EVENT: {
        state = { ...state, deltalog: [] };

        // Process game events only on the server.
        // These events like `endTurn` typically
        // contain code that may rely on secret state
        // and cannot be computed on the client.
        if (isClient) {
          return state;
        }

        // Disallow events once the game is over.
        if (state.ctx.gameover !== undefined) {
          error(`cannot call event after game end`);
          return WithError(state, ActionErrorType.GameOver);
        }

        // Ignore the event if the player isn't active.
        if (
          actionHasPlayerID(action) &&
          !game.flow.isPlayerActive(state.G, state.ctx, action.payload.playerID)
        ) {
          error(`disallowed event: ${action.payload.type}`);
          return WithError(state, ActionErrorType.InactivePlayer);
        }

        // Execute plugins.
        state = plugins.Enhance(state, {
          game,
          isClient: false,
          playerID: action.payload.playerID,
        });

        // Process event.
        let newState = game.flow.processEvent(state, action);

        // Execute plugins.
        let stateWithError: TransientState | undefined;
        [newState, stateWithError] = flushAndValidatePlugins(newState, state, {
          game,
          isClient: false,
        });
        if (stateWithError) return stateWithError;

        // Update undo / redo state.
        newState = updateUndoRedoState(newState, { game, action });

        return { ...newState, _stateID: state._stateID + 1 };
      }

      case Actions.MAKE_MOVE: {
        const oldState = (state = { ...state, deltalog: [] });

        // Check whether the move is allowed at this time.
        const move: Move = game.flow.getMove(
          state.ctx,
          action.payload.type,
          action.payload.playerID || state.ctx.currentPlayer
        );
        if (move === null) {
          error(`disallowed move: ${action.payload.type}`);
          return WithError(state, ActionErrorType.UnavailableMove);
        }

        // Don't run move on client if move says so.
        if (isClient && (move as LongFormMove).client === false) {
          return state;
        }

        // Disallow moves once the game is over.
        if (state.ctx.gameover !== undefined) {
          error(`cannot make move after game end`);
          return WithError(state, ActionErrorType.GameOver);
        }

        // Ignore the move if the player isn't active.
        if (
          actionHasPlayerID(action) &&
          !game.flow.isPlayerActive(state.G, state.ctx, action.payload.playerID)
        ) {
          error(`disallowed move: ${action.payload.type}`);
          return WithError(state, ActionErrorType.InactivePlayer);
        }

        // Execute plugins.
        state = plugins.Enhance(state, {
          game,
          isClient,
          playerID: action.payload.playerID,
        });

        // Process the move.
        const G = game.processMove(state, action.payload);

        // The game declared the move as invalid.
        if (G === INVALID_MOVE) {
          error(
            `invalid move: ${action.payload.type} args: ${action.payload.args}`
          );
          // TODO(#723): Marshal a nice error payload with the processed move.
          return WithError(state, ActionErrorType.InvalidMove);
        }

        const newState = { ...state, G };

        // Some plugin indicated that it is not suitable to be
        // materialized on the client (and must wait for the server
        // response instead).
        if (isClient && plugins.NoClient(newState, { game })) {
          return state;
        }

        state = newState;

        // If we're on the client, just process the move
        // and no triggers in multiplayer mode.
        // These will be processed on the server, which
        // will send back a state update.
        if (isClient) {
          let stateWithError: TransientState | undefined;
          [state, stateWithError] = flushAndValidatePlugins(state, oldState, {
            game,
            isClient: true,
          });
          if (stateWithError) return stateWithError;
          return {
            ...state,
            _stateID: state._stateID + 1,
          };
        }

        // On the server, construct the deltalog.
        state = initializeDeltalog(state, action, move);

        // Allow the flow reducer to process any triggers that happen after moves.
        state = game.flow.processMove(state, action.payload);
        let stateWithError: TransientState | undefined;
        [state, stateWithError] = flushAndValidatePlugins(state, oldState, {
          game,
        });
        if (stateWithError) return stateWithError;

        // Update undo / redo state.
        state = updateUndoRedoState(state, { game, action });

        return {
          ...state,
          _stateID: state._stateID + 1,
        };
      }

      case Actions.RESET:
      case Actions.UPDATE:
      case Actions.SYNC: {
        return action.state;
      }

      case Actions.UNDO: {
        state = { ...state, deltalog: [] };

        if (game.disableUndo) {
          error('Undo is not enabled');
          return WithError(state, ActionErrorType.ActionDisabled);
        }

        const { G, ctx, _undo, _redo, _stateID } = state;

        if (_undo.length < 2) {
          error(`No moves to undo`);
          return WithError(state, ActionErrorType.ActionInvalid);
        }

        const last = _undo[_undo.length - 1];
        const restore = _undo[_undo.length - 2];

        // Only allow players to undo their own moves.
        if (
          actionHasPlayerID(action) &&
          action.payload.playerID !== last.playerID
        ) {
          error(`Cannot undo other players' moves`);
          return WithError(state, ActionErrorType.ActionInvalid);
        }

        // If undoing a move, check it is undoable.
        if (last.moveType) {
          const lastMove: Move = game.flow.getMove(
            restore.ctx,
            last.moveType,
            last.playerID
          );
          if (!CanUndoMove(G, ctx, lastMove)) {
            error(`Move cannot be undone`);
            return WithError(state, ActionErrorType.ActionInvalid);
          }
        }

        state = initializeDeltalog(state, action);

        return {
          ...state,
          G: restore.G,
          ctx: restore.ctx,
          plugins: restore.plugins,
          _stateID: _stateID + 1,
          _undo: _undo.slice(0, -1),
          _redo: [last, ..._redo],
        };
      }

      case Actions.REDO: {
        state = { ...state, deltalog: [] };

        if (game.disableUndo) {
          error('Redo is not enabled');
          return WithError(state, ActionErrorType.ActionDisabled);
        }

        const { _undo, _redo, _stateID } = state;

        if (_redo.length === 0) {
          error(`No moves to redo`);
          return WithError(state, ActionErrorType.ActionInvalid);
        }

        const first = _redo[0];

        // Only allow players to redo their own undos.
        if (
          actionHasPlayerID(action) &&
          action.payload.playerID !== first.playerID
        ) {
          error(`Cannot redo other players' moves`);
          return WithError(state, ActionErrorType.ActionInvalid);
        }

        state = initializeDeltalog(state, action);

        return {
          ...state,
          G: first.G,
          ctx: first.ctx,
          plugins: first.plugins,
          _stateID: _stateID + 1,
          _undo: [..._undo, first],
          _redo: _redo.slice(1),
        };
      }

      case Actions.PLUGIN: {
        // TODO(#723): Expose error semantics to plugin processing.
        return plugins.ProcessAction(state, action, { game });
      }

      case Actions.PATCH: {
        const oldState = state;
        const newState = JSON.parse(JSON.stringify(oldState));
        const patchError = applyPatch(newState, action.patch);
        const hasError = patchError.some((entry) => entry !== null);
        if (hasError) {
          error(`Patch ${JSON.stringify(action.patch)} apply failed`);
          return WithError(oldState, UpdateErrorType.PatchFailed, patchError);
        } else {
          return newState;
        }
      }
      default: {
        return state;
      }
    }
  };
}
