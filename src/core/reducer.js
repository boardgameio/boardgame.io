/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { parse, stringify } from 'flatted';
import * as Actions from './action-types';
import { Random } from './random';
import { Events } from './events';

/**
 * This class is used to attach/detach various utility objects
 * onto a ctx, without having to manually attach/detach them
 * all separately.
 */
class ContextEnhancer {
  constructor(ctx, game, player) {
    this.random = new Random(ctx);
    this.events = new Events(game.flow, player);
  }

  attachToContext(ctx) {
    let ctxWithAPI = this.random.attach(ctx);
    ctxWithAPI = this.events.attach(ctxWithAPI);
    return ctxWithAPI;
  }

  detachFromContext(ctx) {
    let ctxWithoutAPI = Random.detach(ctx);
    ctxWithoutAPI = Events.detach(ctxWithoutAPI);
    return ctxWithoutAPI;
  }

  update(state, updateEvents) {
    let newState = updateEvents ? this.events.update(state) : state;
    newState = this.random.update(newState);
    return newState;
  }

  updateAndDetach(state, updateEvents) {
    const newState = this.update(state, updateEvents);
    newState.ctx = this.detachFromContext(newState.ctx);
    return newState;
  }
}

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

  let seed = game.seed;
  if (seed === undefined) {
    seed = Random.seed();
  }
  ctx._random = { seed };

  const apiCtx = new ContextEnhancer(ctx, game, ctx.currentPlayer);
  let ctxWithAPI = apiCtx.attachToContext(ctx);

  const initial = {
    // User managed state.
    G: game.setup(ctxWithAPI),

    // Framework managed state.
    ctx: ctx,

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

  let state = game.flow.init({ G: initial.G, ctx: ctxWithAPI });

  initial.G = state.G;
  initial._undo = state._undo;
  state = apiCtx.updateAndDetach(state, true);
  initial.ctx = state.ctx;

  const deepCopy = obj => parse(stringify(obj));
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
        state = { ...state, deltalog: [] };

        // Process game events only on the server.
        // These events like `endTurn` typically
        // contain code that may rely on secret state
        // and cannot be computed on the client.
        if (multiplayer) {
          return state;
        }

        // Ignore the event if the player isn't allowed to make it.
        if (
          action.payload.playerID !== null &&
          action.payload.playerID !== undefined &&
          !game.flow.canPlayerCallEvent(
            state.G,
            state.ctx,
            action.payload.playerID
          )
        ) {
          return state;
        }

        const apiCtx = new ContextEnhancer(
          state.ctx,
          game,
          action.payload.playerID
        );
        apiCtx.attachToContext(state.ctx);

        let newState = game.flow.processGameEvent(state, action);

        newState = apiCtx.updateAndDetach(newState, true);

        return { ...newState, _stateID: state._stateID + 1 };
      }

      case Actions.MAKE_MOVE: {
        state = { ...state, deltalog: [] };

        // Check whether the game knows the move at all.
        if (!game.moveNames.includes(action.payload.type)) {
          return state;
        }

        // Ignore the move if it isn't allowed at this point.
        if (!game.flow.canMakeMove(state.G, state.ctx, action.payload.type)) {
          return state;
        }

        // Ignore the move if the player isn't allowed to make it.
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

        const apiCtx = new ContextEnhancer(
          state.ctx,
          game,
          action.payload.playerID
        );
        let ctxWithAPI = apiCtx.attachToContext(state.ctx);

        // Process the move.
        let G = game.processMove(state.G, action.payload, ctxWithAPI);
        if (G === undefined) {
          // the game declared the move as invalid.
          return state;
        }

        // don't call into events here
        let ctx = apiCtx.updateAndDetach(state, false).ctx;

        // Undo changes to G if the move should not run on the client.
        if (
          multiplayer &&
          !game.flow.optimisticUpdate(G, ctx, action.payload)
        ) {
          G = state.G;
        }

        const deltalog = [{ action }];
        state = { ...state, G, ctx, deltalog, _stateID: state._stateID + 1 };

        // If we're on the client, just process the move
        // and no triggers in multiplayer mode.
        // These will be processed on the server, which
        // will send back a state update.
        if (multiplayer) {
          return state;
        }

        // Allow the flow reducer to process any triggers that happen after moves.
        ctxWithAPI = apiCtx.attachToContext(state.ctx);
        state = game.flow.processMove(
          { ...state, ctx: ctxWithAPI },
          action.payload
        );
        state = apiCtx.updateAndDetach(state, true);

        return state;
      }

      case Actions.UPDATE:
      case Actions.SYNC: {
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
