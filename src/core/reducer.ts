/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import * as Actions from './action-types';
import * as plugins from '../plugins/main';
import { Game } from './game';
import { error } from './logger';
import { ContextEnhancer } from './context-enhancer';
import { ActionShape, GameConfig, LogEntry, State, Move, LongFormMove } from '../types';

/**
 * Returns true if a move can be undone.
 */
const CanUndoMove = (G: object, ctx: object, move: Move): boolean => {
  function HasUndoable(move: Move): move is LongFormMove {
    return (move as LongFormMove).undoable !== undefined;
  }

  function IsFunction(undoable: boolean | Function): undoable is Function {
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
 * @param {...object} game - Return value of Game().
 * @param {...object} multiplayer - Set to a truthy value if we are in a multiplayer client.
 */
export function CreateGameReducer({
  game,
  multiplayer,
}: {
  game: GameConfig;
  multiplayer?: boolean | object;
}) {
  game = Game(game);

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
        if (multiplayer) {
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

        // Enhance ctx with API.
        const apiCtx = new ContextEnhancer(
          state.ctx,
          game,
          action.payload.playerID
        );
        state.ctx = apiCtx.attachToContext(state.ctx);

        // Execute plugins.
        state = plugins.Enhance(state, { game, isClient: false });

        // Process event.
        let newState = game.flow.processEvent(state, action);
        newState = apiCtx.updateAndDetach(newState, true);

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
        if (multiplayer && (move as LongFormMove).client === false) {
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
          isClient: multiplayer !== undefined,
        });

        const apiCtx = new ContextEnhancer(
          state.ctx,
          game,
          action.payload.playerID
        );
        state.ctx = apiCtx.attachToContext(state.ctx);

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

        // Don't call into events here.
        const newState = apiCtx.updateAndDetach(
          { ...state, deltalog: [logEntry] },
          false
        );
        let ctx = newState.ctx;

        // Random API code was executed. If we are on the
        // client, wait for the master response instead.
        if (
          multiplayer &&
          ctx._random !== undefined &&
          ctx._random.prngstate !== undefined
        ) {
          return state;
        }

        state = { ...newState, G, ctx, _stateID: state._stateID + 1 };

        // If we're on the client, just process the move
        // and no triggers in multiplayer mode.
        // These will be processed on the server, which
        // will send back a state update.
        if (multiplayer) {
          state = plugins.Flush(state, {
            game,
            isClient: true,
          });
          return state;
        }

        // Allow the flow reducer to process any triggers that happen after moves.
        const ctxWithAPI = apiCtx.attachToContext(state.ctx);
        state = game.flow.processMove(
          { ...state, ctx: ctxWithAPI },
          action.payload
        );
        state = apiCtx.updateAndDetach(state, true);
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

      default: {
        return state;
      }
    }
  };
}
