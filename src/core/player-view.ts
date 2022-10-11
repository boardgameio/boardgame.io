/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import type { Game, PlayerID } from '../types';

/**
 * PlayerView reducers.
 */
export const PlayerView: { STRIP_SECRETS: Game['playerView'] } = {
  /**
   * STRIP_SECRETS
   *
   * Reducer which removes a key named `secret` and
   * removes all the keys in `players`, except for the one
   * corresponding to the current playerID.
   */
  STRIP_SECRETS: ({ G, playerID }: { G: any; playerID: PlayerID | null }) => {
    const r = { ...G };

    if (r.secret !== undefined) {
      delete r.secret;
    }

    if (r.players) {
      r.players = playerID
        ? {
            [playerID]: r.players[playerID],
          }
        : {};
    }

    return r;
  },
};
