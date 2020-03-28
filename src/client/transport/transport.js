/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

export class Transport {
  constructor({ store, gameName, playerID, gameID, numPlayers }) {
    this.store = store;
    this.gameName = gameName || 'default';
    this.playerID = playerID || null;
    this.gameID = gameID || 'default';
    this.numPlayers = numPlayers || 2;
  }
}
