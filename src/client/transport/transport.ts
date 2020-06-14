/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { ProcessGameConfig } from '../../core/game';
import {
  Game,
  PlayerID,
  CredentialedActionShape,
  State,
  Store,
  SyncInfo,
} from '../../types';

export type MetadataCallback = (metadata: SyncInfo['filteredMetadata']) => void;

export interface TransportOpts {
  store?: Store;
  gameName?: string;
  gameKey?: Game;
  game?: ReturnType<typeof ProcessGameConfig>;
  playerID?: PlayerID;
  gameID?: string;
  numPlayers?: number;
}

export abstract class Transport {
  protected store: Store;
  protected gameName: string;
  protected playerID: PlayerID | null;
  protected gameID: string;
  protected numPlayers: number;
  isConnected: boolean;

  constructor({
    store,
    gameName,
    playerID,
    gameID,
    numPlayers,
  }: TransportOpts) {
    this.store = store;
    this.gameName = gameName || 'default';
    this.playerID = playerID || null;
    this.gameID = gameID || 'default';
    this.numPlayers = numPlayers || 2;
  }

  abstract onAction(state: State, action: CredentialedActionShape.Any): void;
  abstract connect(): void;
  abstract disconnect(): void;
  abstract subscribe(fn: () => void): void;
  abstract subscribeGameMetadata(fn: MetadataCallback): void;
  abstract updateGameID(id: string): void;
  abstract updatePlayerID(id: PlayerID): void;
}
