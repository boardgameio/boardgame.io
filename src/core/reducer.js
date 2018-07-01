/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import * as Actions from './action-types';
import { Random } from './random';
import { Events } from './events';

/**
 * CreateGameReducer
 *
 * Creates the main game state reducer.
 * @param {...object} game - Return value of Game().
 * @param {...object} numPlayers - The number of players.
 * @param {...object} multiplayer - Set to true if we are in a multiplayer client.
 */
export function CreateGameReducer({ game, numPlayers, multiplayer }) {
  if (!numPlayers) {
    numPlayers = 2;
  }

  let ctx = game.flow.ctx(numPlayers);
  ctx._random = { seed: game.seed };

  const random = new Random(ctx);
  const ctxWithAPI = random.attach(ctx);

  const initial = {
    // User managed state.
    G: game.setup(ctxWithAPI),

    // Framework managed state.
    ctx: ctx,

    // A list of actions performed so far. Used by the
    // GameLog to display a journal of moves.
    log: [],

    // List of {G, ctx} pairs that can be undone.
    _undo: [],

    // List of {G, ctx} pairs that can be redone.
    _redo: [],

    // A monotonically non-decreasing ID to ensure that
    // state updates are only allowed from clients that
    // are at the same version that the server.
    _stateID: 0,

    // A snapshot of this object so that actions can be
    // replayed over it to view old snapshots.
    _initial: {},
  };

  const state = game.flow.init({ G: initial.G, ctx: ctxWithAPI });

  initial.G = state.G;
  initial._undo = state._undo;
  initial.ctx = random.update(state.ctx);
  initial.ctx = Random.detach(initial.ctx);

  const deepCopy = obj => JSON.parse(JSON.stringify(obj));
  initial._initial = deepCopy(initial);

  /**
   * GameReducer
   *
   * Redux reducer that maintains the overall game state.
   * @param {object} state - The state before the action.
   * @param {object} action - A Redux action.
   */
  return (state = initial, action) => {
    switch (action.type) {
      case Actions.GAME_EVENT: {
        // Process game events only on the server.
        // These events like `endTurn` typically
        // contain code that may rely on secret state
        // and cannot be computed on the client.
        if (multiplayer) {
          return state;
        }

        // Initialize PRNG from ctx.
        const random = new Random(state.ctx);
        // Initialize Events API.
        const events = new Events(game.flow, action.payload.playerID);
        // Attach Random API to ctx.
        state = { ...state, ctx: random.attach(state.ctx) };
        // Attach Events API to ctx.
        state = { ...state, ctx: events.attach(state.ctx) };

        // Update state.
        let newState = game.flow.processGameEvent(state, action);
        // Trigger any events that were called via the Events API.
        newState = events.update(newState);
        // Update ctx with PRNG state.
        let ctx = random.update(newState.ctx);
        // Detach Random API from ctx.
        ctx = Random.detach(ctx);
        // Detach Events API from ctx.
        ctx = Events.detach(ctx);

        return { ...newState, ctx, _stateID: state._stateID + 1 };
      }

      case Actions.MAKE_MOVE: {
        // Check whether the game knows the move at all.
        if (!game.moveNames.includes(action.payload.type)) {
          return state;
        }

        // Ignore the move if it isn't allowed at this point.
        if (!game.flow.canMakeMove(state.G, state.ctx, action.payload.type)) {
          return state;
        }

        // Ignore the move if the player cannot make it at this point.
        if (
          action.payload.playerID !== null &&
          action.payload.playerID !== undefined &&
          !game.flow.canPlayerMakeMove(
            state.G,
            state.ctx,
            action.payload.playerID
          )
        ) {
          return state;
        }

        // Initialize PRNG from ctx.
        const random = new Random(state.ctx);
        // Initialize Events API.
        const events = new Events(game.flow, action.payload.playerID);
        // Attach Random API to ctx.
        let ctxWithAPI = random.attach(state.ctx);
        // Attach Events API to ctx.
        ctxWithAPI = events.attach(ctxWithAPI);

        // Process the move.
        let G = game.processMove(state.G, action.payload, ctxWithAPI);
        if (G === undefined) {
          // the game declared the move as invalid.
          return state;
        }

        // Update ctx with PRNG state.
        let ctx = random.update(state.ctx);
        // Detach Random API from ctx.
        ctx = Random.detach(ctx);
        // Detach Events API from ctx.
        ctx = Events.detach(ctx);

        // Undo changes to G if the move should not run on the client.
        if (
          multiplayer &&
          !game.flow.optimisticUpdate(G, ctx, action.payload)
        ) {
          G = state.G;
        }

        const log = [...state.log, action];
        state = { ...state, G, ctx, log, _stateID: state._stateID + 1 };

        // If we're on the client, just process the move
        // and no triggers in multiplayer mode.
        // These will be processed on the server, which
        // will send back a state update.
        if (multiplayer) {
          return state;
        }

        // Allow the flow reducer to process any triggers that happen after moves.
        state = { ...state, ctx: random.attach(state.ctx) };
        state = { ...state, ctx: events.attach(state.ctx) };
        state = game.flow.processMove(state, action);
        state = events.update(state);
        state = { ...state, ctx: random.update(state.ctx) };
        state = { ...state, ctx: Random.detach(state.ctx) };
        state = { ...state, ctx: Events.detach(state.ctx) };

        return state;
      }

      case Actions.RESTORE: {
        return action.state;
      }

      case Actions.RESET: {
        return initial;
      }

      case Actions.UNDO: {
        const { _undo, _redo } = state;

        if (_undo.length < 2) {
          return state;
        }

        const last = _undo[_undo.length - 1];
        const restore = _undo[_undo.length - 2];

        // Only allow undoable moves to be undone.
        if (!game.flow.canUndoMove(state.G, state.ctx, last.moveType)) {
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
