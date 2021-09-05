/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import type { ProcessGameConfig } from '../../core/game';
import type { TransportData } from '../../master/master';
import type {
  Game,
  PlayerID,
  CredentialedActionShape,
  State,
  SyncInfo,
  ChatMessage,
} from '../../types';

export type MetadataCallback = (metadata: SyncInfo['filteredMetadata']) => void;

export type ChatCallback = (message: ChatMessage) => void;

export interface TransportOpts {
  clientCallback: (data: TransportData) => void;
  gameName?: string;
  gameKey?: Game;
  game?: ReturnType<typeof ProcessGameConfig>;
  playerID?: PlayerID;
  matchID?: string;
  credentials?: string;
  numPlayers?: number;
}

export abstract class Transport {
  protected gameName: string;
  protected playerID: PlayerID | null;
  protected matchID: string;
  protected credentials?: string;
  protected numPlayers: number;
  protected clientCallback: (data: TransportData) => void;
  /** Callback to let the client know when the connection status has changed. */
  private connectionStatusCallback: () => void = () => {};
  isConnected = false;

  constructor({
    clientCallback,
    gameName,
    playerID,
    matchID,
    credentials,
    numPlayers,
  }: TransportOpts) {
    this.clientCallback = clientCallback;
    this.gameName = gameName || 'default';
    this.playerID = playerID || null;
    this.matchID = matchID || 'default';
    this.credentials = credentials;
    this.numPlayers = numPlayers || 2;
  }

  /** Subscribe to connection state changes. */
  subscribe(fn: () => void): void {
    this.connectionStatusCallback = fn;
  }

  protected setConnectionStatus(isConnected: boolean) {
    this.isConnected = isConnected;
    this.connectionStatusCallback();
  }

  /** Called by the client to connect the transport. */
  abstract connect(): void;
  /** Called by the client to disconnect the transport. */
  abstract disconnect(): void;
  /** Called by the client to dispatch an action via the transport. */
  abstract sendAction(state: State, action: CredentialedActionShape.Any): void;
  /** Called by the client to dispatch a chat message via the transport. */
  abstract sendChatMessage(matchID: string, chatMessage: ChatMessage): void;
  /** Called by the client to request a sync action from the transport. */
  abstract requestSync(): void;
  abstract updateMatchID(id: string): void;
  abstract updatePlayerID(id: PlayerID): void;
  abstract updateCredentials(credentials?: string): void;
}
