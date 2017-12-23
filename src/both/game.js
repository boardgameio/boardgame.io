/*
 * Copyright 2017 Google Inc.
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

/*
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
 * Args:
 *   obj.G - The initial state G.
 *   obj.moves - A dictionary of move functions.
 *   obj.playerView - A function that returns a
 *                    derivative of G suitable for
 *                    showing the specified player.
 *
 * Usage:
 *
 * Game({
 *   G: {},
 *   moves: {
 *     'moveWithoutArgs': (G, ctx) => {
 *       return Object.assign({}, G, ...);
 *     },
 *     'moveWithArgs': (G, ctx, arg0, arg1) => {
 *       return Object.assign({}, G, ...);
 *     }
 *   },
 *   winner: (G, ctx) => { ... },
 *   playerView: (G, ctx, player) => { ... },
 * })
 */
function Game({G, moves, victory, playerView}) {
  if (!G)           G = {};
  if (!moves)       moves = {};
  if (!victory)     victory = () => null;
  if (!playerView)  playerView = G => G;

  return {
    G,
    victory,
    playerView,
    moveNames: Object.getOwnPropertyNames(moves),
    reducer: (G, action, ctx) => {
      if (moves.hasOwnProperty(action.type)) {
        const context = moves[action.type];
        const args = [G, ctx].concat(action.args);
        return moves[action.type].apply(context, args);
      }
      return G;
    },
  };
}

export default Game;
