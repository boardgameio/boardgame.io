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

function getActivePlayer(state: State): PlayerID {
  return state.ctx.activePlayers
    ? Object.keys(state.ctx.activePlayers)[0]
    : state.ctx.currentPlayer;
}

function getBotPlayer(
  state: State,
  bots: Record<PlayerID, Bot>,
): PlayerID | undefined {
  return state.ctx.activePlayers
    ? Object.keys(state.ctx.activePlayers).find((id) => id in bots)
    : state.ctx.currentPlayer;
}

/**
 * Make a single move on the client with a bot.
 *
 * @param {...object} client - The game client.
 * @param {...object} bot - The bot.
 * @param {string} [playerID] - The player the bot should play as.
 */
export async function Step(
  client: { store: Store },
  bot: Bot,
  playerID?: PlayerID,
) {
  const state = client.store.getState();
  playerID = playerID ?? getActivePlayer(state);

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
 * @param {...object} bots - A map of player IDs to bots, or one bot for every seat.
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
  if (depth === undefined) depth = 10_000;
  const botMap =
    bots instanceof Bot
      ? Object.fromEntries(state.ctx.playOrder.map((p) => [p, bots]))
      : bots;
  const reducer = CreateGameReducer({ game });

  let metadata = null;
  let iter = 0;
  while (state.ctx.gameover === undefined && iter < depth) {
    const playerID = getBotPlayer(state, botMap);

    const bot = botMap[playerID];
    if (!bot) break;
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
