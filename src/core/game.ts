/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import * as plugins from '../plugins/main';
import { Flow } from './flow';
import type { INVALID_MOVE } from './constants';
import type { ActionPayload, Game, Move, LongFormMove, State } from '../types';
import * as logging from './logger';
import { GameMethod } from './game-methods';

type ProcessedGame = Game & {
  flow: ReturnType<typeof Flow>;
  moveNames: string[];
  pluginNames: string[];
  processMove: (
    state: State,
    action: ActionPayload.MakeMove
  ) => State | typeof INVALID_MOVE;
};

function IsProcessed(game: Game | ProcessedGame): game is ProcessedGame {
  return game.processMove !== undefined;
}

/**
 * Helper to generate the game move reducer. The returned
 * reducer has the following signature:
 *
 * (G, action, ctx) => {}
 *
 * You can roll your own if you like, or use any Redux
 * addon to generate such a reducer.
 *
 * The convention used in this framework is to
 * have action.type contain the name of the move, and
 * action.args contain any additional arguments as an
 * Array.
 */
export function ProcessGameConfig(game: Game | ProcessedGame): ProcessedGame {
  // The Game() function has already been called on this
  // config object, so just pass it through.
  if (IsProcessed(game)) {
    return game;
  }

  if (game.name === undefined) game.name = 'default';
  if (game.deltaState === undefined) game.deltaState = false;
  if (game.disableUndo === undefined) game.disableUndo = false;
  if (game.setup === undefined) game.setup = () => ({});
  if (game.moves === undefined) game.moves = {};
  if (game.playerView === undefined) game.playerView = ({ G }) => G;
  if (game.plugins === undefined) game.plugins = [];

  game.plugins.forEach((plugin) => {
    if (plugin.name === undefined) {
      throw new Error('Plugin missing name attribute');
    }
    if (plugin.name.includes(' ')) {
      throw new Error(plugin.name + ': Plugin name must not include spaces');
    }
  });

  if (game.name.includes(' ')) {
    throw new Error(game.name + ': Game name must not include spaces');
  }

  const flow = Flow(game);

  return {
    ...game,

    flow,

    moveNames: flow.moveNames as string[],

    pluginNames: game.plugins.map((p) => p.name) as string[],

    processMove: (state: State, action: ActionPayload.MakeMove) => {
      let moveFn = flow.getMove(state.ctx, action.type, action.playerID);

      if (IsLongFormMove(moveFn)) {
        moveFn = moveFn.move;
      }

      if (moveFn instanceof Function) {
        const fn = plugins.FnWrap(moveFn, GameMethod.MOVE, game.plugins);
        let args = [];
        if (action.args !== undefined) {
          args = Array.isArray(action.args) ? action.args : [action.args];
        }
        const context = {
          ...plugins.GetAPIs(state),
          G: state.G,
          ctx: state.ctx,
          playerID: action.playerID,
        };
        return fn(context, ...args);
      }

      logging.error(`invalid move object: ${action.type}`);

      return state.G;
    },
  };
}

export function IsLongFormMove(move: Move): move is LongFormMove {
  return move instanceof Object && (move as LongFormMove).move !== undefined;
}
