/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import * as ActionCreators from '../../core/action-creators';
import { InMemory } from '../../server/db/inmemory';
import { LocalStorage } from '../../server/db/localstorage';
import { Master } from '../../master/master';
import type { TransportAPI, TransportData } from '../../master/master';
import { Transport } from './transport';
import type { TransportOpts, ChatCallback } from './transport';
import type {
  ChatMessage,
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

interface LocalOpts {
  bots?: Record<PlayerID, any>;
  persist?: boolean;
  storageKey?: string;
}

type LocalMasterOpts = LocalOpts & {
  game: Game;
};

/**
 * Creates a local version of the master that the client
 * can interact with.
 */
export class LocalMaster extends Master {
  connect: (
    matchID: string,
    playerID: PlayerID,
    callback: (data: TransportData) => void
  ) => void;

  constructor({ game, bots, storageKey, persist }: LocalMasterOpts) {
    const clientCallbacks: Record<PlayerID, (data: TransportData) => void> = {};
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

    const send: TransportAPI['send'] = ({ playerID, ...data }) => {
      const callback = clientCallbacks[playerID];
      if (callback !== undefined) {
        callback(data);
      }
    };

    const transportAPI: TransportAPI = {
      send,
      sendAll: (makePlayerData) => {
        for (const playerID in clientCallbacks) {
          const data = makePlayerData(playerID);
          send({ playerID, ...data });
        }
      },
    };
    const storage = persist ? new LocalStorage(storageKey) : new InMemory();
    super(game, storage, transportAPI);

    this.connect = (matchID, playerID, callback) => {
      clientCallbacks[playerID] = callback;
    };

    this.subscribe(({ state, matchID }) => {
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
            matchID,
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
  chatMessageCallback: ChatCallback;

  /**
   * Creates a new Mutiplayer instance.
   * @param {string} matchID - The game ID to connect to.
   * @param {string} playerID - The player ID associated with this client.
   * @param {string} gameName - The game type (the `name` field in `Game`).
   * @param {string} numPlayers - The number of players.
   */
  constructor({ master, ...opts }: LocalTransportOpts) {
    super(opts);
    this.master = master;
    this.isConnected = true;
  }

  /**
   * Called when any player sends a chat message and the
   * master broadcasts the update to other clients (including
   * this one).
   */
  onChatMessage(matchID: string, chatMessage: ChatMessage) {
    const args: Parameters<Master['onChatMessage']> = [
      matchID,
      chatMessage,
      this.credentials,
    ];
    this.master.onChatMessage(...args);
  }

  /**
   * Called when another player makes a move and the
   * master broadcasts the update to other clients (including
   * this one).
   */
  async onUpdate(matchID: string, state: State, deltalog: LogEntry[]) {
    const currentState = this.store.getState();

    if (matchID == this.matchID && state._stateID >= currentState._stateID) {
      const action = ActionCreators.update(state, deltalog);
      this.store.dispatch(action);
    }
  }

  /**
   * Called when the client first connects to the master
   * and requests the current game state.
   */
  onSync(matchID: string, syncInfo: SyncInfo) {
    if (matchID == this.matchID) {
      const action = ActionCreators.sync(syncInfo);
      this.store.dispatch(action);
    }
  }

  /**
   * Called when an action that has to be relayed to the
   * game master is made.
   */
  onAction(state: State, action: CredentialedActionShape.Any) {
    this.master.onUpdate(action, state._stateID, this.matchID, this.playerID);
  }

  /**
   * Connect to the master.
   */
  connect() {
    this.master.connect(this.matchID, this.playerID, (data) => {
      switch (data.type) {
        case 'sync':
          return this.onSync(...data.args);
        case 'update':
          return this.onUpdate(...data.args);
        case 'chat':
          return this.chatMessageCallback(data.args[1]);
      }
    });
    this.master.onSync(
      this.matchID,
      this.playerID,
      this.credentials,
      this.numPlayers
    );
  }

  /**
   * Disconnect from the master.
   */
  disconnect() {}

  /**
   * Subscribe to connection state changes.
   */
  subscribe() {}

  subscribeMatchData() {}

  subscribeChatMessage(fn: ChatCallback) {
    this.chatMessageCallback = fn;
  }

  /**
   * Dispatches a reset action, then requests a fresh sync from the master.
   */
  private resetAndSync() {
    const action = ActionCreators.reset(null);
    this.store.dispatch(action);
    this.connect();
  }

  /**
   * Updates the game id.
   * @param {string} id - The new game id.
   */
  updateMatchID(id: string) {
    this.matchID = id;
    this.resetAndSync();
  }

  /**
   * Updates the player associated with this client.
   * @param {string} id - The new player id.
   */
  updatePlayerID(id: PlayerID) {
    this.playerID = id;
    this.resetAndSync();
  }

  /**
   * Updates the credentials associated with this client.
   * @param {string|undefined} credentials - The new credentials to use.
   */
  updateCredentials(credentials?: string) {
    this.credentials = credentials;
    this.resetAndSync();
  }
}

/**
 * Global map storing local master instances.
 */
const localMasters: Map<Game, { master: LocalMaster } & LocalOpts> = new Map();

/**
 * Create a local transport.
 */
export function Local({ bots, persist, storageKey }: LocalOpts = {}) {
  return (transportOpts: TransportOpts) => {
    const { gameKey, game } = transportOpts;
    let master: LocalMaster;

    const instance = localMasters.get(gameKey);
    if (
      instance &&
      instance.bots === bots &&
      instance.storageKey === storageKey &&
      instance.persist === persist
    ) {
      master = instance.master;
    }

    if (!master) {
      master = new LocalMaster({ game, bots, persist, storageKey });
      localMasters.set(gameKey, { master, bots, persist, storageKey });
    }

    return new LocalTransport({ master, ...transportOpts });
  };
}
