/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import type { ProcessGameConfig } from '../../core/game';
import type {
  Game,
  PlayerID,
  CredentialedActionShape,
  State,
  Store,
  SyncInfo,
  ChatMessage,
} from '../../types';

export type MetadataCallback = (metadata: SyncInfo['filteredMetadata']) => void;

export type ChatCallback = (message: ChatMessage) => void;

export interface TransportOpts {
  store?: Store;
  gameName?: string;
  gameKey?: Game;
  game?: ReturnType<typeof ProcessGameConfig>;
  playerID?: PlayerID;
  matchID?: string;
  credentials?: string;
  numPlayers?: number;
}

export abstract class Transport {
  protected store: Store;
  protected gameName: string;
  protected playerID: PlayerID | null;
  protected matchID: string;
  protected credentials?: string;
  protected numPlayers: number;
  isConnected: boolean;

  constructor({
    store,
    gameName,
    playerID,
    matchID,
    credentials,
    numPlayers,
  }: TransportOpts) {
    this.store = store;
    this.gameName = gameName || 'default';
    this.playerID = playerID || null;
    this.matchID = matchID || 'default';
    this.credentials = credentials;
    this.numPlayers = numPlayers || 2;
  }

  abstract onAction(state: State, action: CredentialedActionShape.Any): void;
  abstract connect(): void;
  abstract disconnect(): void;
  abstract subscribe(fn: () => void): void;
  abstract subscribeMatchData(fn: MetadataCallback): void;
  abstract updateMatchID(id: string): void;
  abstract updatePlayerID(id: PlayerID): void;
  abstract updateCredentials(credentials?: string): void;
  abstract onChatMessage(matchID: string, chatMessage: ChatMessage): void;
  abstract subscribeChatMessage(fn: ChatCallback): void;
}
