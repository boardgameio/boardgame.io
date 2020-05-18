/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

class _LobbyConnectionImpl {
  constructor({ server, gameComponents, playerName, playerCredentials }) {
    this.gameComponents = gameComponents;
    this.playerName = playerName || 'Visitor';
    this.playerCredentials = playerCredentials;
    this.server = server;
    this.matches = [];
  }

  _baseUrl() {
    return `${this.server || ''}/games`;
  }

  async refresh() {
    try {
      this.matches.length = 0;
      const resp = await fetch(this._baseUrl());
      if (resp.status !== 200) {
        throw new Error('HTTP status ' + resp.status);
      }
      const json = await resp.json();
      for (let gameName of json) {
        if (!this._getGameComponents(gameName)) continue;
        const gameResp = await fetch(this._baseUrl() + '/' + gameName);
        const gameJson = await gameResp.json();
        for (let inst of gameJson.matches) {
          inst.gameName = gameName;
        }
        this.matches = this.matches.concat(gameJson.matches);
      }
    } catch (error) {
      throw new Error('failed to retrieve list of games (' + error + ')');
    }
  }

  _getGameInstance(matchID) {
    for (let inst of this.matches) {
      if (inst['matchID'] === matchID) return inst;
    }
  }

  _getGameComponents(gameName) {
    for (let comp of this.gameComponents) {
      if (comp.game.name === gameName) return comp;
    }
  }

  _findPlayer(playerName) {
    for (let inst of this.matches) {
      if (inst.players.some(player => player.name === playerName)) return inst;
    }
  }

  async join(gameName, matchID, playerID) {
    try {
      let inst = this._findPlayer(this.playerName);
      if (inst) {
        throw new Error('player has already joined ' + inst.matchID);
      }
      inst = this._getGameInstance(matchID);
      if (!inst) {
        throw new Error('game instance ' + matchID + ' not found');
      }
      const resp = await fetch(
        this._baseUrl() + '/' + gameName + '/' + matchID + '/join',
        {
          method: 'POST',
          body: JSON.stringify({
            playerID: playerID,
            playerName: this.playerName,
          }),
          headers: { 'Content-Type': 'application/json' },
        }
      );
      if (resp.status !== 200) throw new Error('HTTP status ' + resp.status);
      const json = await resp.json();
      inst.players[Number.parseInt(playerID)].name = this.playerName;
      this.playerCredentials = json.playerCredentials;
    } catch (error) {
      throw new Error('failed to join room ' + matchID + ' (' + error + ')');
    }
  }

  async leave(gameName, matchID) {
    try {
      let inst = this._getGameInstance(matchID);
      if (!inst) throw new Error('game instance not found');
      for (let player of inst.players) {
        if (player.name === this.playerName) {
          const resp = await fetch(
            this._baseUrl() + '/' + gameName + '/' + matchID + '/leave',
            {
              method: 'POST',
              body: JSON.stringify({
                playerID: player.id,
                credentials: this.playerCredentials,
              }),
              headers: { 'Content-Type': 'application/json' },
            }
          );
          if (resp.status !== 200) {
            throw new Error('HTTP status ' + resp.status);
          }
          delete player.name;
          delete this.playerCredentials;
          return;
        }
      }
      throw new Error('player not found in room');
    } catch (error) {
      throw new Error('failed to leave room ' + matchID + ' (' + error + ')');
    }
  }

  async disconnect() {
    let inst = this._findPlayer(this.playerName);
    if (inst) {
      await this.leave(inst.gameName, inst.matchID);
    }
    this.matches = [];
    this.playerName = 'Visitor';
  }

  async create(gameName, numPlayers) {
    try {
      const comp = this._getGameComponents(gameName);
      if (!comp) throw new Error('game not found');
      if (
        numPlayers < comp.game.minPlayers ||
        numPlayers > comp.game.maxPlayers
      )
        throw new Error('invalid number of players ' + numPlayers);
      const resp = await fetch(this._baseUrl() + '/' + gameName + '/create', {
        method: 'POST',
        body: JSON.stringify({
          numPlayers: numPlayers,
        }),
        headers: { 'Content-Type': 'application/json' },
      });
      if (resp.status !== 200) throw new Error('HTTP status ' + resp.status);
    } catch (error) {
      throw new Error(
        'failed to create room for ' + gameName + ' (' + error + ')'
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
export function LobbyConnection(opts) {
  return new _LobbyConnectionImpl(opts);
}
