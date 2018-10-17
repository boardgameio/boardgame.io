/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

class _LobbyImpl {
  constructor({ server, gameComponents, playerName }) {
    this.gameComponents = gameComponents;
    this.playerName = playerName || 'Visitor';
    this.server = server;
    this.gameInstances = [];
    this.errorMsg = '';
  }

  _baseUrl() {
    return `http://${this.server}/games`;
  }

  async refresh() {
    try {
      this.gameInstances.length = 0;
      const resp = await fetch(this._baseUrl());
      if (resp.status !== 200) {
        throw 'HTTP status ' + resp.status;
      }
      const json = await resp.json();
      for (let gameName of json) {
        if (!this._getGameComponents(gameName)) continue;
        const gameResp = await fetch(this._baseUrl() + '/' + gameName);
        const gameJson = await gameResp.json();
        for (let inst of gameJson.gameInstances) {
          inst.gameName = gameName;
        }
        this.gameInstances = this.gameInstances.concat(gameJson.gameInstances);
      }
    } catch (e) {
      this.errorMsg = 'failed to retrieve list of games (' + e + ')';
      return false;
    }
    return true;
  }

  _getGameInstance(gameID) {
    for (let inst of this.gameInstances) {
      if (inst['gameID'] === gameID) return inst;
    }
  }

  _getGameComponents(gameName) {
    for (let comp of this.gameComponents) {
      if (comp.game.name == gameName) return comp;
    }
  }

  async join(gameName, gameID, playerID) {
    try {
      let inst = this._getGameInstance(gameID);
      if (!inst) throw 'game instance not found';
      if (inst.players[playerID].playerName) throw 'player not found';
      const resp = await fetch(
        this._baseUrl() + '/' + gameName + '/' + gameID + '/join',
        {
          method: 'POST',
          body: JSON.stringify({
            playerID: playerID,
            playerName: this.playerName,
          }),
          headers: { 'Content-Type': 'application/json' },
        }
      );
      if (resp.status !== 200) throw 'HTTP status ' + resp.status;
      const json = await resp.json();
      inst.players[playerID].playerName = this.playerName;
      this.playerCredentials = json.playerCredentials;
    } catch (e) {
      this.errorMsg = 'failed to join room ' + gameID + ' (' + e + ')';
      return false;
    }
    return true;
  }

  async leave(gameName, gameID) {
    try {
      let inst = this._getGameInstance(gameID);
      if (!inst) throw 'game instance not found';
      for (let id of Object.keys(inst.players)) {
        if (inst.players[id].playerName === this.playerName) {
          const resp = await fetch(
            this._baseUrl() + '/' + gameName + '/' + gameID + '/leave',
            {
              method: 'POST',
              body: JSON.stringify({
                playerID: id,
                playerCredentials: this.playerCredentials,
              }),
              headers: { 'Content-Type': 'application/json' },
            }
          );
          if (resp.status !== 200) throw 'HTTP status ' + resp.status;
          delete inst.players[id].playerName;
          return true;
        }
      }
      throw 'player not found in room';
    } catch (e) {
      this.errorMsg = 'failed to leave room ' + gameID + ' (' + e + ')';
    }
    return false;
  }

  async create(gameName, numPlayers) {
    try {
      const comp = this._getGameComponents(gameName);
      if (!comp) throw 'game not found';
      if (
        numPlayers < comp.game.minPlayers ||
        numPlayers > comp.game.maxPlayers
      )
        throw 'invalid number of players';
      const resp = await fetch(this._baseUrl() + '/' + gameName + '/create', {
        method: 'POST',
        body: JSON.stringify({
          numPlayers: numPlayers,
        }),
        headers: { 'Content-Type': 'application/json' },
      });
      if (resp.status !== 200) throw 'HTTP status ' + resp.status;
    } catch (e) {
      this.errorMsg = 'failed to create room for ' + gameName + ' (' + e + ')';
      return false;
    }
    return true;
  }
}

/**
 * Lobby
 *
 * Generic lobby client.
 *
 * @param {...object} gameComponents - A map of Board and Game objects for the supported games.
 * @param {...object} playerName - The name of player.
 * @param {...object} server - '<host>:<port>' of the server.
 *
 * Returns:
 *   A JS object that provides an API to create/join/start game instances.
 */
export function LobbyConnection(opts) {
  return new _LobbyImpl(opts);
}
