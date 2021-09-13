/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { InMemory } from '../../server/db/inmemory';
import { LocalStorage } from '../../server/db/localstorage';
import { Master } from '../../master/master';
import type { TransportAPI, TransportData } from '../../master/master';
import { Transport } from './transport';
import type { TransportOpts } from './transport';
import type {
  ChatMessage,
  CredentialedActionShape,
  Game,
  PlayerID,
  State,
} from '../../types';
import { getFilterPlayerView } from '../../master/filter-player-view';

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
        callback(filterPlayerView(playerID, data));
      }
    };

    const filterPlayerView = getFilterPlayerView(game);
    const transportAPI: TransportAPI = {
      send,
      sendAll: (payload) => {
        for (const playerID in clientCallbacks) {
          send({ playerID, ...payload });
        }
      },
    };
    const storage = persist ? new LocalStorage(storageKey) : new InMemory();
    super(game, storage, transportAPI);

    this.connect = (playerID, callback) => {
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
  }

  sendChatMessage(matchID: string, chatMessage: ChatMessage) {
    const args: Parameters<Master['onChatMessage']> = [
      matchID,
      chatMessage,
      this.credentials,
    ];
    this.master.onChatMessage(...args);
  }

  sendAction(state: State, action: CredentialedActionShape.Any) {
    this.master.onUpdate(action, state._stateID, this.matchID, this.playerID);
  }

  requestSync(): void {
    this.master.onSync(
      this.matchID,
      this.playerID,
      this.credentials,
      this.numPlayers
    );
  }

  connect() {
    this.setConnectionStatus(true);
    this.master.connect(this.playerID, (data) => this.notifyClient(data));
    this.requestSync();
  }

  disconnect() {
    this.setConnectionStatus(false);
  }

  updateMatchID(id: string) {
    this.matchID = id;
    this.connect();
  }

  updatePlayerID(id: PlayerID) {
    this.playerID = id;
    this.connect();
  }

  updateCredentials(credentials?: string) {
    this.credentials = credentials;
    this.connect();
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
