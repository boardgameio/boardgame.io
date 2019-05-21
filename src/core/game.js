/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { FnWrap } from '../plugins/main';
import { FlowWithPhases } from './flow';

/**
 * Game
 *
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
 *
 * Game({
 *   name: 'tic-tac-toe',
 *
 *   setup: (numPlayers) => {
 *     const G = {...};
 *     return G;
 *   },
 *
 *   plugins: [plugin1, plugin2, ...],
 *
 *   moves: {
 *     'moveWithoutArgs': (G, ctx) => {
 *       return Object.assign({}, G, ...);
 *     },
 *     'moveWithArgs': (G, ctx, arg0, arg1) => {
 *       return Object.assign({}, G, ...);
 *     }
 *   },
 *
 *   playerView: (G, ctx, playerID) => { ... },
 *
 *   flow: {
 *     endGameIf: (G, ctx) => { ... },
 *
 *     phases: {
 *       A: { onBegin: (G, ctx) => G, onEnd: (G, ctx) => G },
 *       B: { onBegin: (G, ctx) => G, onEnd: (G, ctx) => G },
 *       ...
 *     }
 *   },
 * })
 *
 * @param {...object} setup - Function that returns the initial state of G.
 *
 * @param {...object} moves - A dictionary of move functions.
 *
 * @param {...object} playerView - A function that returns a
 *                                 derivative of G tailored for
 *                                 the specified player.
 *
 * @param {...object} flow - Customize the flow of the game (see flow.js).
 *                           Must contain the return value of Flow().
 *                           If it contains any other object, it is presumed to be a
 *                           configuration object for FlowWithPhases().
 *
 * @param {...object} seed - Seed for the PRNG.
 *
 * @param {Array} plugins - List of plugins. Each plugin is an object like the following:
 *                          {
 *                            // Optional: Wraps a move / trigger function and returns
 *                            // the wrapped function. The wrapper can do anything
 *                            // it wants, but will typically be used to customize G.
 *                            fnWrap: (fn) => {
 *                              return (G, ctx, ...args) => {
 *                                G = preprocess(G);
 *                                G = fn(G, ctx, ...args);
 *                                G = postprocess(G);
 *                                return G;
 *                              };
 *                            },
 *
 *                            // Optional: Called during setup. Can be used to
 *                            // augment G with additional state during setup.
 *                            setup: (G, ctx) => G,
 *                          }
 */
function Game(game) {
  if (game.name === undefined) game.name = 'default';
  if (game.setup === undefined) game.setup = () => ({});
  if (game.moves === undefined) game.moves = {};
  if (game.playerView === undefined) game.playerView = G => G;
  if (game.plugins === undefined) game.plugins = [];

  if (!game.flow || game.flow.processGameEvent === undefined) {
    game.flow = FlowWithPhases({ game, ...game.flow });
  }

  const getMove = name => {
    if (name in game.moves) {
      return game.moves[name];
    }

    if (name in game.flow.moveMap) {
      return game.flow.moveMap[name];
    }

    return null;
  };

  return {
    ...game,

    getMove,

    moveNames: [
      ...Object.getOwnPropertyNames(game.moves),
      ...Object.keys(game.flow.moveMap || []),
    ],

    processMove: (G, action, ctx) => {
      let moveFn = getMove(action.type);

      if (moveFn instanceof Object && moveFn.impl) {
        moveFn = moveFn.impl;
      }

      if (moveFn instanceof Function) {
        const ctxWithPlayerID = { ...ctx, playerID: action.playerID };
        const args = [G, ctxWithPlayerID].concat(action.args);
        const fn = FnWrap(moveFn, game);
        return fn(...args);
      }

      return G;
    },
  };
}

export default Game;
