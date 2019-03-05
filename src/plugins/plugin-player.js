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
  fnWrap: moveFn => {
    return (G, ctx, ...args) => {
      const current = ctx.currentPlayer;

      Object.defineProperty(G, 'player', {
        get: () => {
          console.log('getter');
          return G.players[current];
        },

        set: function(value) {
          console.log('setter');
          this.players[current] = value;
        },
      });

      if (ctx.numPlayers == 2) {
        const other = current == '0' ? '1' : '0';

        Object.defineProperty(G, 'opponent', {
          get: () => G.players[other],
          set: value => {
            this.players[other] = value;
          },
        });
      }

      G = moveFn(G, ctx, ...args);

      {
        /* eslint-disable-next-line no-unused-vars */
        const { player, opponent, ...rest } = G;
        return { ...rest };
      }
    };
  },

  G: {
    setup: (G, ctx, game) => {
      let players = {};
      for (let i = 0; i < ctx.numPlayers; i++) {
        let playerState = {};
        if (game.playerSetup !== undefined) {
          playerState = game.playerSetup(i + '');
        }
        players[i + ''] = playerState;
      }
      return { ...G, players };
    },
  },
};
