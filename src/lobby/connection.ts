/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import type { ComponentType } from 'react';
import { LobbyClient } from './client';
import type { Game, LobbyAPI } from '../types';

export interface GameComponent {
  game: Game;
  board: ComponentType<any>;
}

interface LobbyConnectionOpts {
  server: string;
  playerName?: string;
  playerCredentials?: string;
  gameComponents: GameComponent[];
}

class _LobbyConnectionImpl {
  client: LobbyClient;
  gameComponents: GameComponent[];
  playerName: string;
  playerCredentials?: string;
  matches: LobbyAPI.MatchList['matches'];

  constructor({
    server,
    gameComponents,
    playerName,
    playerCredentials,
  }: LobbyConnectionOpts) {
    this.client = new LobbyClient({ server });
    this.gameComponents = gameComponents;
    this.playerName = playerName || 'Visitor';
    this.playerCredentials = playerCredentials;
    this.matches = [];
  }

  async refresh() {
    try {
      this.matches = [];
      const games = await this.client.listGames();
      for (const game of games) {
        if (!this._getGameComponents(game)) continue;
        const { matches } = await this.client.listMatches(game);
        this.matches.push(...matches);
      }
    } catch (error) {
      throw new Error('failed to retrieve list of matches (' + error + ')');
    }
  }

  _getMatchInstance(matchID: string) {
    for (const inst of this.matches) {
      if (inst['matchID'] === matchID) return inst;
    }
  }

  _getGameComponents(gameName: string) {
    for (const comp of this.gameComponents) {
      if (comp.game.name === gameName) return comp;
    }
  }

  _findPlayer(playerName: string) {
    for (const inst of this.matches) {
      if (inst.players.some((player) => player.name === playerName))
        return inst;
    }
  }

  async join(gameName: string, matchID: string, playerID: string) {
    try {
      let inst = this._findPlayer(this.playerName);
      if (inst) {
        throw new Error('player has already joined ' + inst.matchID);
      }
      inst = this._getMatchInstance(matchID);
      if (!inst) {
        throw new Error('game instance ' + matchID + ' not found');
      }
      const json = await this.client.joinMatch(gameName, matchID, {
        playerID,
        playerName: this.playerName,
      });
      inst.players[Number.parseInt(playerID)].name = this.playerName;
      this.playerCredentials = json.playerCredentials;
    } catch (error) {
      throw new Error('failed to join match ' + matchID + ' (' + error + ')');
    }
  }

  async leave(gameName: string, matchID: string) {
    try {
      const inst = this._getMatchInstance(matchID);
      if (!inst) throw new Error('match instance not found');
      for (const player of inst.players) {
        if (player.name === this.playerName) {
          await this.client.leaveMatch(gameName, matchID, {
            playerID: player.id.toString(),
            credentials: this.playerCredentials,
          });
          delete player.name;
          delete this.playerCredentials;
          return;
        }
      }
      throw new Error('player not found in match');
    } catch (error) {
      throw new Error('failed to leave match ' + matchID + ' (' + error + ')');
    }
  }

  async disconnect() {
    const inst = this._findPlayer(this.playerName);
    if (inst) {
      await this.leave(inst.gameName, inst.matchID);
    }
    this.matches = [];
    this.playerName = 'Visitor';
  }

  async create(gameName: string, numPlayers: number) {
    try {
      const comp = this._getGameComponents(gameName);
      if (!comp) throw new Error('game not found');
      if (
        numPlayers < comp.game.minPlayers ||
        numPlayers > comp.game.maxPlayers
      )
        throw new Error('invalid number of players ' + numPlayers);
      await this.client.createMatch(gameName, { numPlayers });
    } catch (error) {
      throw new Error(
        'failed to create match for ' + gameName + ' (' + error + ')'
      );
    }
  }
}

/**
 * LobbyConnection
 *
 * Lobby model.
 *
 * @param {string}   server - '<host>:<port>' of the server.
 * @param {Array}    gameComponents - A map of Board and Game objects for the supported games.
 * @param {string}   playerName - The name of the player.
 * @param {string}   playerCredentials - The credentials currently used by the player, if any.
 *
 * Returns:
 *   A JS object that synchronizes the list of running game instances with the server and provides an API to create/join/start instances.
 */
export function LobbyConnection(opts: LobbyConnectionOpts) {
  return new _LobbyConnectionImpl(opts);
}
