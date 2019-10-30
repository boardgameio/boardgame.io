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
import { Transport } from './transport';

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

  const master = new Master(game, new InMemory(), { send, sendAll }, false);
  master.executeSynchronously = true;
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
export class LocalTransport extends Transport {
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
    super({ store, gameName, playerID, gameID, numPlayers });

    this.master = master;
    this.isConnected = true;
  }

  /**
   * Called when another player makes a move and the
   * master broadcasts the update to other clients (including
   * this one).
   */
  onUpdate(gameID, state, deltalog) {
    const currentState = this.store.getState();

    if (gameID == this.gameID && state._stateID >= currentState._stateID) {
      const action = ActionCreators.update(state, deltalog);
      this.store.dispatch(action);
    }
  }

  /**
   * Called when the client first connects to the master
   * and requests the current game state.
   */
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
  onAction(state, action) {
    this.master.onUpdate(action, state._stateID, this.gameID, this.playerID);
  }

  /**
   * Connect to the master.
   */
  connect() {
    this.master.connect(this.gameID, this.playerID, (type, ...args) => {
      if (type == 'sync') {
        this.onSync.apply(this, args);
      }
      if (type == 'update') {
        this.onUpdate.apply(this, args);
      }
    });
    this.master.onSync(this.gameID, this.playerID, this.numPlayers);
  }

  /**
   * Disconnect from the master.
   */
  disconnect() {}

  /**
   * Subscribe to connection state changes.
   */
  subscribe() {}

  subscribeGameMetadata(_metadata) {} // eslint-disable-line no-unused-vars

  /**
   * Updates the game id.
   * @param {string} id - The new game id.
   */
  updateGameID(id) {
    this.gameID = this.gameName + ':' + id;
    const action = ActionCreators.reset(null);
    this.store.dispatch(action);
    this.connect();
  }

  /**
   * Updates the player associated with this client.
   * @param {string} id - The new player id.
   */
  updatePlayerID(id) {
    this.playerID = id;
    const action = ActionCreators.reset(null);
    this.store.dispatch(action);
    this.connect();
  }
}

const localMasters = new Map();
export function Local() {
  return transportOpts => {
    let master;

    if (localMasters.has(transportOpts.gameKey)) {
      master = localMasters.get(transportOpts.gameKey);
    } else {
      master = new LocalMaster(transportOpts.game);
      localMasters.set(transportOpts.gameKey, master);
    }

    return new LocalTransport({ master, ...transportOpts });
  };
}
