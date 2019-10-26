/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { CreateGameReducer } from '../core/reducer';
import { makeMove, gameEvent } from '../core/action-creators';
import { alea } from '../core/random.alea';

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

export class Bot {
  constructor({ enumerate, seed }) {
    this.enumerateFn = enumerate;
    this.seed = seed;
  }

  enumerate = (G, ctx, playerID) => {
    const actions = this.enumerateFn(G, ctx, playerID);
    return actions.map(a => {
      if (a.payload !== undefined) {
        return a;
      }

      if (a.move !== undefined) {
        return makeMove(a.move, a.args, playerID);
      }

      if (a.event !== undefined) {
        return gameEvent(a.event, a.args, playerID);
      }
    });
  };

  random(arg) {
    let number;

    if (this.seed !== undefined) {
      let r = null;
      if (this.prngstate) {
        r = new alea('', { state: this.prngstate });
      } else {
        r = new alea(this.seed, { state: true });
      }

      number = r();
      this.prngstate = r.state();
    } else {
      number = Math.random();
    }

    if (arg) {
      // eslint-disable-next-line unicorn/explicit-length-check
      if (arg.length) {
        const id = Math.floor(number * arg.length);
        return arg[id];
      } else {
        return Math.floor(number * arg);
      }
    }

    return number;
  }
}
