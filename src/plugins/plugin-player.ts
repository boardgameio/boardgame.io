/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import type { Plugin, PlayerID } from '../types';

interface PlayerData<PlayerState extends any = any> {
  players: Record<PlayerID, PlayerState>;
}

export interface PlayerAPI<PlayerState extends any = any> {
  state: Record<PlayerID, PlayerState>;
  get(): PlayerState;
  set(value: PlayerState): PlayerState;
  opponent?: {
    get(): PlayerState;
    set(value: PlayerState): PlayerState;
  };
}

interface PluginPlayerOpts<PlayerState extends any = any> {
  setup?: (playerID: string) => PlayerState;
  playerView?: (
    players: Record<PlayerID, PlayerState>,
    playerID?: string | null
  ) => any;
}

export interface PlayerPlugin<PlayerState extends any = any> {
  player: PlayerAPI<PlayerState>;
}

/**
 * Plugin that maintains state for each player in G.players.
 * During a turn, G.player will contain the object for the current player.
 * In two player games, G.opponent will contain the object for the other player.
 *
 * @param {function} initPlayerState - Function of type (playerID) => playerState.
 */
const PlayerPlugin = <PlayerState extends any = any>({
  setup,
  playerView,
}: PluginPlayerOpts<PlayerState> = {}): Plugin<
  PlayerAPI<PlayerState>,
  PlayerData<PlayerState>
> => ({
  name: 'player',

  flush: ({ api }) => {
    return { players: api.state };
  },

  api: ({ ctx, data }): PlayerAPI => {
    const state = data.players;

    const get = () => {
      return data.players[ctx.currentPlayer];
    };

    const set = (value) => {
      return (state[ctx.currentPlayer] = value);
    };

    const result: PlayerAPI = { state, get, set };

    if (ctx.numPlayers === 2) {
      const other = ctx.currentPlayer === '0' ? '1' : '0';
      const get = () => {
        return data.players[other];
      };
      const set = (value) => {
        return (state[other] = value);
      };
      result.opponent = { get, set };
    }

    return result;
  },

  setup: ({ ctx }) => {
    const players: Record<PlayerID, any> = {};
    for (let i = 0; i < ctx.numPlayers; i++) {
      let playerState: any = {};
      if (setup !== undefined) {
        playerState = setup(i + '');
      }
      players[i + ''] = playerState;
    }
    return { players };
  },

  playerView: ({ data, playerID }) =>
    playerView ? { players: playerView(data.players, playerID) } : data,
});

export default PlayerPlugin;
