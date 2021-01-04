/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { Bot } from './bot';
import type { Ctx, PlayerID } from '../types';

/**
 * Bot that picks a move at random.
 */
export class RandomBot extends Bot {
  play({ G, ctx }: { G: any; ctx: Ctx }, playerID: PlayerID) {
    const moves = this.enumerate(G, ctx, playerID);
    return Promise.resolve({ action: this.random(moves) });
  }
}
