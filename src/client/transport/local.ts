/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import * as ActionCreators from '../../core/action-creators';
import { InMemory } from '../../server/db/inmemory';
import { Master, TransportAPI } from '../../master/master';
import { Transport, TransportOpts } from './transport';
import {
  CredentialedActionShape,
  Game,
  LogEntry,
  PlayerID,
  State,
  SyncInfo,
} from '../../types';

/**
 * Returns null if it is not a bot's turn.
 * Otherwise, returns a playerID of a bot that may play now.
 */
export function GetBotPlayer(state: State, bots: Record<PlayerID, any>) {
  if (state.ctx.gameover !== undefined) {
    return null;
  }

  if (state.ctx.activePlayers) {
    for (const key of Object.keys(bots)) {
      if (key in state.ctx.activePlayers) {
        return key;
      }
    }
  } else if (state.ctx.currentPlayer in bots) {
    return state.ctx.currentPlayer;
  }

  return null;
}

interface LocalMasterOpts {
  game: Game;
  bots: Record<PlayerID, any>;
}

/**
 * Creates a local version of the master that the client
 * can interact with.
 */
export class LocalMaster extends Master {
  connect: (
    gameID: string,
    playerID: PlayerID,
    callback: (...args: any[]) => void
  ) => void;

  constructor({ game, bots }: LocalMasterOpts) {
    const clientCallbacks: Record<PlayerID, (...args: any[]) => void> = {};
    const initializedBots = {};

    if (game && game.ai && bots) {
      for (const playerID in bots) {
        const bot = bots[playerID];
        initializedBots[playerID] = new bot({
          game,
          enumerate: game.ai.enumerate,
          seed: game.seed,
        });
      }
    }

    const send: TransportAPI['send'] = ({ playerID, type, args }) => {
      const callback = clientCallbacks[playerID];
      if (callback !== undefined) {
        callback.apply(null, [type, ...args]);
      }
    };

    const transportAPI: TransportAPI = {
      send,
      sendAll: makePlayerData => {
        for (const playerID in clientCallbacks) {
          const data = makePlayerData(playerID);
          send({ playerID, ...data });
        }
      },
    };

    super(game, new InMemory(), transportAPI, false);

    this.connect = (gameID, playerID, callback) => {
      clientCallbacks[playerID] = callback;
    };

    this.subscribe(({ state, gameID }) => {
      if (!bots) {
        return;
      }
      const botPlayer = GetBotPlayer(state, initializedBots);
      if (botPlayer !== null) {
        setTimeout(async () => {
          const botAction = await initializedBots[botPlayer].play(
            state,
            botPlayer
          );
          await this.onUpdate(
            botAction.action,
            state._stateID,
            gameID,
            botAction.action.payload.playerID
          );
        }, 100);
      }
    });
  }
}

type LocalTransportOpts = TransportOpts & {
  master?: LocalMaster;
};

/**
 * Local
 *
 * Transport interface that embeds a GameMaster within it
 * that you can connect multiple clients to.
 */
export class LocalTransport extends Transport {
  master: LocalMaster;
  isConnected: boolean;

  /**
   * Creates a new Mutiplayer instance.
   * @param {string} gameID - The game ID to connect to.
   * @param {string} playerID - The player ID associated with this client.
   * @param {string} gameName - The game type (the `name` field in `Game`).
   * @param {string} numPlayers - The number of players.
   */
  constructor({
    master,
    store,
    gameID,
    playerID,
    gameName,
    numPlayers,
  }: LocalTransportOpts) {
    super({ store, gameName, playerID, gameID, numPlayers });
    this.master = master;
    this.isConnected = true;
  }

  /**
   * Called when another player makes a move and the
   * master broadcasts the update to other clients (including
   * this one).
   */
  async onUpdate(gameID: string, state: State, deltalog: LogEntry[]) {
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
  onSync(gameID: string, syncInfo: SyncInfo) {
    if (gameID == this.gameID) {
      const action = ActionCreators.sync(syncInfo);
      this.store.dispatch(action);
    }
  }

  /**
   * Called when an action that has to be relayed to the
   * game master is made.
   */
  onAction(state: State, action: CredentialedActionShape.Any) {
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

  subscribeGameMetadata() {}

  /**
   * Updates the game id.
   * @param {string} id - The new game id.
   */
  updateGameID(id: string) {
    this.gameID = id;
    const action = ActionCreators.reset(null);
    this.store.dispatch(action);
    this.connect();
  }

  /**
   * Updates the player associated with this client.
   * @param {string} id - The new player id.
   */
  updatePlayerID(id: PlayerID) {
    this.playerID = id;
    const action = ActionCreators.reset(null);
    this.store.dispatch(action);
    this.connect();
  }
}

const localMasters = new Map();
export function Local(opts?: Pick<LocalMasterOpts, 'bots'>) {
  return (
    transportOpts: Pick<LocalMasterOpts, 'game'> &
      LocalTransportOpts & { gameKey: Game }
  ) => {
    let master: LocalMaster;

    if (localMasters.has(transportOpts.gameKey) && !opts) {
      master = localMasters.get(transportOpts.gameKey);
    } else {
      master = new LocalMaster({
        game: transportOpts.game,
        bots: opts && opts.bots,
      });
      localMasters.set(transportOpts.gameKey, master);
    }

    return new LocalTransport({ master, ...transportOpts });
  };
}
