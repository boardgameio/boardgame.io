/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { CreateGameReducer } from '../core/reducer';
import { Bot } from './bot';
import type { Game, PlayerID, State, Store } from '../types';

/**
 * Make a single move on the client with a bot.
 *
 * @param {...object} client - The game client.
 * @param {...object} bot - The bot.
 */
export async function Step(client: { store: Store }, bot: Bot) {
  const state = client.store.getState();

  let playerID = state.ctx.currentPlayer;
  if (state.ctx.activePlayers) {
    playerID = Object.keys(state.ctx.activePlayers)[0];
  }

  const { action, metadata } = await bot.play(state, playerID);

  if (action) {
    const a = {
      ...action,
      payload: {
        ...action.payload,
        metadata,
      },
    };
    client.store.dispatch(a);
    return a;
  }
}

/**
 * Simulates the game till the end or a max depth.
 *
 * @param {...object} game - The game object.
 * @param {...object} bots - An array of bots.
 * @param {...object} state - The game state to start from.
 */
export async function Simulate({
  game,
  bots,
  state,
  depth,
}: {
  game: Game;
  bots: Bot | Record<PlayerID, Bot>;
  state: State;
  depth?: number;
}) {
  if (depth === undefined) depth = 10000;
  const reducer = CreateGameReducer({ game });

  let metadata = null;
  let iter = 0;
  while (state.ctx.gameover === undefined && iter < depth) {
    let playerID = state.ctx.currentPlayer;
    if (state.ctx.activePlayers) {
      playerID = Object.keys(state.ctx.activePlayers)[0];
    }

    const bot = bots instanceof Bot ? bots : bots[playerID];
    const t = await bot.play(state, playerID);

    if (!t.action) {
      break;
    }

    metadata = t.metadata;
    state = reducer(state, t.action);
    iter++;
  }

  return { state, metadata };
}
