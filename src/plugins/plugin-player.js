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
      const player = G.players[current];

      G = { ...G, player };

      let other = null;
      let opponent = null;
      if (ctx.numPlayers == 2) {
        other = current == '0' ? '1' : '0';
        opponent = G.players[other];
        G.opponent = opponent;
      }

      G = moveFn(G, ctx, ...args);

      const players = {
        ...G.players,
        [current]: 'player' in G ? G.player : G.players[current],
      };

      if (other !== null) {
        players[other] = 'opponent' in G ? G.opponent : G.players[other];
      }

      {
        /* eslint-disable-next-line no-unused-vars */
        const { player, opponent, ...rest } = G;
        return { ...rest, players };
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
