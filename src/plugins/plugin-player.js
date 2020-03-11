/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

/**
 * Plugin that maintains state for each player in G.players.
 * During a turn, G.player will contain the object for the current player.
 * In two player games, G.opponent will contain the object for the other player.
 *
 * @param {function} initPlayerState - Function of type (playerID) => playerState.
 */
export default {
  name: 'player',

  flush: ({ api }) => {
    return { players: api.state };
  },

  api: ({ ctx, data }) => {
    let state = data.players;
    let result = { state };

    const get = () => {
      return data.players[ctx.currentPlayer];
    };
    result.get = get;

    const set = value => {
      return (state[ctx.currentPlayer] = value);
    };
    result.set = set;

    if (ctx.numPlayers === 2) {
      const other = ctx.currentPlayer === '0' ? '1' : '0';
      const get = () => {
        return data.players[other];
      };
      const set = value => {
        return (state[other] = value);
      };
      result.opponent = { get, set };
    }

    return result;
  },

  setup: ({ ctx, game }) => {
    let players = {};
    for (let i = 0; i < ctx.numPlayers; i++) {
      let playerState = {};
      if (game.playerSetup !== undefined) {
        playerState = game.playerSetup(i + '');
      }
      players[i + ''] = playerState;
    }
    return { players };
  },
};
