/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import * as Actions from './action-types';

/**
 * createGameFlow
 *
 * Create a Redux reducer that maintains ctx.
 * The default responds to a single action END_TURN
 * that increments the currentPlayer and checks if
 * there is a winner.
 * @param {...object} game - Return value of Game().
 * @param {...object} numPlayers - The number of players.
 */
export function createGameFlow({game, numPlayers}) {
  if (game.flow) {
    return game.flow;
  }

  const initial = {
    turn: 0,
    currentPlayer: '0',
    numPlayers: numPlayers,
    winner: null,
  };

  return (ctx = initial, action, G) => {
    switch (action.type) {
      case Actions.END_TURN: {
        // Update winner.
        const winner = game.victory(G, ctx);
        // Update current player.
        const currentPlayer =
            (+ctx.currentPlayer + 1) % ctx.numPlayers + "";
        // Update turn.
        const turn = ctx.turn + 1;
        // Return new ctx.
        return {...ctx, currentPlayer, turn, winner};
      }

      default:
        return ctx;
    }
  };
}
