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
import {
  ActionShape,
  Ctx,
  Game,
  LogEntry,
  State,
  Move,
  LongFormMove,
} from '../types';

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
    return move.undoable(G, ctx);
  }

  return move.undoable;
};

/**
 * Moves can return this when they want to indicate
 * that the combination of arguments is illegal and
 * the move ought to be discarded.
 */
export const INVALID_MOVE = 'INVALID_MOVE';

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
  return (state: State | null = null, action: ActionShape.Any): State => {
    switch (action.type) {
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
          return state;
        }

        // Ignore the event if the player isn't active.
        if (
          action.payload.playerID !== null &&
          action.payload.playerID !== undefined &&
          !game.flow.isPlayerActive(state.G, state.ctx, action.payload.playerID)
        ) {
          error(`disallowed event: ${action.payload.type}`);
          return state;
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
        newState = plugins.Flush(newState, { game, isClient: false });

        return { ...newState, _stateID: state._stateID + 1 };
      }

      case Actions.MAKE_MOVE: {
        state = { ...state, deltalog: [] };

        // Check whether the move is allowed at this time.
        const move: Move = game.flow.getMove(
          state.ctx,
          action.payload.type,
          action.payload.playerID || state.ctx.currentPlayer
        );
        if (move === null) {
          error(`disallowed move: ${action.payload.type}`);
          return state;
        }

        // Don't run move on client if move says so.
        if (isClient && (move as LongFormMove).client === false) {
          return state;
        }

        // Disallow moves once the game is over.
        if (state.ctx.gameover !== undefined) {
          error(`cannot make move after game end`);
          return state;
        }

        // Ignore the move if the player isn't active.
        if (
          action.payload.playerID !== null &&
          action.payload.playerID !== undefined &&
          !game.flow.isPlayerActive(state.G, state.ctx, action.payload.playerID)
        ) {
          error(`disallowed move: ${action.payload.type}`);
          return state;
        }

        // Execute plugins.
        state = plugins.Enhance(state, {
          game,
          isClient,
          playerID: action.payload.playerID,
        });

        // Process the move.
        let G = game.processMove(state, action.payload);

        // The game declared the move as invalid.
        if (G === INVALID_MOVE) {
          error(
            `invalid move: ${action.payload.type} args: ${action.payload.args}`
          );
          return state;
        }

        // Create a log entry for this move.
        let logEntry: LogEntry = {
          action,
          _stateID: state._stateID,
          turn: state.ctx.turn,
          phase: state.ctx.phase,
        };

        if ((move as LongFormMove).redact === true) {
          logEntry.redact = true;
        }

        const newState = {
          ...state,
          G,
          deltalog: [logEntry],
          _stateID: state._stateID + 1,
        };

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
          state = plugins.Flush(state, {
            game,
            isClient: true,
          });
          return state;
        }

        // Allow the flow reducer to process any triggers that happen after moves.
        state = game.flow.processMove(state, action.payload);
        state = plugins.Flush(state, { game });

        return state;
      }

      case Actions.RESET:
      case Actions.UPDATE:
      case Actions.SYNC: {
        return action.state;
      }

      case Actions.UNDO: {
        const { _undo, _redo } = state;

        if (_undo.length < 2) {
          return state;
        }

        const last = _undo[_undo.length - 1];
        const restore = _undo[_undo.length - 2];

        // Only allow undoable moves to be undone.
        const lastMove: Move = game.flow.getMove(
          state.ctx,
          last.moveType,
          state.ctx.currentPlayer
        );
        if (!CanUndoMove(state.G, state.ctx, lastMove)) {
          return state;
        }

        return {
          ...state,
          G: restore.G,
          ctx: restore.ctx,
          _undo: _undo.slice(0, _undo.length - 1),
          _redo: [last, ..._redo],
        };
      }

      case Actions.REDO: {
        const { _undo, _redo } = state;

        if (_redo.length == 0) {
          return state;
        }

        const first = _redo[0];

        return {
          ...state,
          G: first.G,
          ctx: first.ctx,
          _undo: [..._undo, first],
          _redo: _redo.slice(1),
        };
      }

      case Actions.PLUGIN: {
        return plugins.ProcessAction(state, action, { game });
      }

      default: {
        return state;
      }
    }
  };
}
