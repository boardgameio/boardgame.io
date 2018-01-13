/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

/**
 * Offers a conventional StripSecrets reducer, which removes data out of
 * `players`, and removes any key named `secret`. This encourages a standard
 * state schema.
 */
export const SecretInfo = {
  /**
   * BASIC
   *
   * Standard Secret reducer, which removes a key named `secret` and
   * removes all the keys in `players`, except for the one of the
   * current playerID.
   */
  BASIC: (G, ctx, playerID) => ({
    ...G,
    secret: null,
    players: {
      [playerID]: G.players[playerID]
    }
  })
}
