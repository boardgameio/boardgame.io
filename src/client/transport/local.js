/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import * as ActionCreators from '../../core/action-creators';
import { InMemory } from '../../server/db/inmemory';
import { Master } from '../../master/master';

/**
 * Creates a local version of the master that the client
 * can interact with.
 */
export function LocalMaster(game) {
  const clientCallbacks = {};

  const send = ({ type, playerID, args }) => {
    const callback = clientCallbacks[playerID];
    if (callback !== undefined) {
      callback.apply(null, [type, ...args]);
    }
  };

  const sendAll = arg => {
    for (const playerID in clientCallbacks) {
      const { type, args } = arg(playerID);
      send({ type, playerID, args });
    }
  };

  const master = new Master(game, new InMemory(), { send, sendAll });
  master.connect = (gameID, playerID, callback) => {
    clientCallbacks[playerID] = callback;
  };

  return master;
}

/**
 * Local
 *
 * Transport interface that embeds a GameMaster within it
 * that you can connect multiple clients to.
 */
export class Local {
  /**
   * Creates a new Mutiplayer instance.
   * @param {object} socket - Override for unit tests.
   * @param {object} socketOpts - Options to pass to socket.io.
   * @param {string} gameID - The game ID to connect to.
   * @param {string} playerID - The player ID associated with this client.
   * @param {string} gameName - The game type (the `name` field in `Game`).
   * @param {string} numPlayers - The number of players.
   * @param {string} server - The game server in the form of 'hostname:port'. Defaults to the server serving the client if not provided.
   */
  constructor({ master, store, gameID, playerID, gameName, numPlayers }) {
    this.master = master;
    this.store = store;
    this.gameName = gameName || 'default';
    this.gameID = gameID || 'default';
    this.playerID = playerID || null;
    this.numPlayers = numPlayers || 2;
    this.gameID = this.gameName + ':' + this.gameID;
    this.isConnected = true;
  }

  onUpdate(gameID, state, deltalog) {
    const currentState = this.store.getState();

    if (gameID == this.gameID && state._stateID >= currentState._stateID) {
      const action = ActionCreators.update(state, deltalog);
      this.store.dispatch(action);
    }
  }

  onSync(gameID, state, log) {
    if (gameID == this.gameID) {
      const action = ActionCreators.sync(state, log);
      this.store.dispatch(action);
    }
  }

  /**
   * Called when an action that has to be relayed to the
   * game master is made.
   */
  async onAction(state, action) {
    await this.master.onUpdate(
      action,
      state._stateID,
      this.gameID,
      this.playerID
    );
  }

  /**
   * Connect to the server.
   */
  async connect() {
    this.master.connect(this.gameID, this.playerID, (type, ...args) => {
      if (type == 'sync') {
        this.onSync.apply(this, args);
      }
      if (type == 'update') {
        this.onUpdate.apply(this, args);
      }
    });
    await this.master.onSync(this.gameID, this.playerID, this.numPlayers);
  }

  /**
   * Subscribe to connection state changes.
   */
  subscribe() {}

  /**
   * Updates the game id.
   * @param {string} id - The new game id.
   */
  async updateGameID(id) {
    this.gameID = this.gameName + ':' + id;
    const action = ActionCreators.reset();
    this.store.dispatch(action);
    await this.master.onSync(this.gameID, this.playerID, this.numPlayers);
  }

  /**
   * Updates the player associated with this client.
   * @param {string} id - The new player id.
   */
  async updatePlayerID(id) {
    this.playerID = id;
    const action = ActionCreators.reset();
    this.store.dispatch(action);
    await this.master.onSync(this.gameID, this.playerID, this.numPlayers);
  }
}
