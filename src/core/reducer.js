/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import * as Actions from './action-types';
import { Random } from './random';

/**
 * createGameReducer
 *
 * Creates the main game state reducer.
 * @param {...object} game - Return value of Game().
 * @param {...object} numPlayers - The number of players.
 * @param {...object} multiplayer - Set to true if we are in a multiplayer client.
 */
export function createGameReducer({ game, numPlayers, multiplayer }) {
  if (!numPlayers) {
    numPlayers = 2;
  }

  let ctx = game.flow.ctx(numPlayers);
  ctx._random = { seed: game.seed };

  const random = new Random(ctx);
  const ctxWithAPI = random.ctxWithAPI(ctx);

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

  // Initialize PRNG seed.
  initial.ctx = random.ctxWithoutAPI(initial.ctx);

  const state = game.flow.init({ G: initial.G, ctx: initial.ctx });

  initial.G = state.G;
  initial.ctx = state.ctx;
  initial._undo = state._undo;

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

        // Init PRNG state.
        const random = new Random(state.ctx);
        state = { ...state, ctx: random.ctxWithAPI(state.ctx) };
        // Update state.
        const newState = game.flow.processGameEvent(state, action.payload);
        // Update PRNG state.
        const ctx = random.ctxWithoutAPI(newState.ctx);

        return { ...newState, ctx, _stateID: state._stateID + 1 };
      }

      case Actions.MAKE_MOVE: {
        // Ignore the move if it isn't valid at this point.
        if (!game.flow.validator(state.G, state.ctx, action.payload)) {
          return state;
        }

        // Init PRNG state.
        const random = new Random(state.ctx);
        const ctxWithAPI = random.ctxWithAPI(state.ctx);

        // Process the move.
        let G = game.processMove(state.G, action.payload, ctxWithAPI);
        // Update PRNG state.
        const ctx = random.ctxWithoutAPI(state.ctx);

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
        state = { ...state, ctx: random.ctxWithAPI(state.ctx) };
        state = game.flow.processMove(state, action);
        state = { ...state, ctx: random.ctxWithoutAPI(state.ctx) };

        return state;
      }

      case Actions.RESTORE: {
        return action.state;
      }

      default: {
        return state;
      }
    }
  };
}
