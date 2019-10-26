/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { CreateGameReducer } from '../core/reducer';
import { Bot } from './bot';
import { MCTSBot } from './mcts-bot';

export function AI({ bot, enumerate, visualize }) {
  if (!bot) {
    bot = MCTSBot;
  }

  return { bot, enumerate, visualize };
}

/**
 * Simulates the game till the end or a max depth.
 *
 * @param {...object} game - The game object.
 * @param {...object} bots - An array of bots.
 * @param {...object} state - The game state to start from.
 */
export function Simulate({ game, bots, state, depth }) {
  if (depth === undefined) depth = 10000;
  const reducer = CreateGameReducer({ game, numPlayers: state.ctx.numPlayers });

  let metadata = null;
  let iter = 0;
  while (state.ctx.gameover === undefined && iter < depth) {
    let playerID = state.ctx.currentPlayer;
    if (state.ctx.activePlayers) {
      playerID = Object.keys(state.ctx.activePlayers)[0];
    }

    const bot = bots instanceof Bot ? bots : bots[playerID];
    const t = bot.play(state, playerID);

    if (!t.action) {
      break;
    }

    metadata = t.metadata;
    state = reducer(state, t.action);
    iter++;
  }

  return { state, metadata };
}
