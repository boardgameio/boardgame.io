import { State, Server } from '../../types';
import StorageAPI from './base';

/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

/**
 * InMemory data storage.
 */
export class InMemory extends StorageAPI {
  private games: Map<string, State>;
  private metadata: Map<string, Server.GameMetadata>;

  /**
   * Creates a new InMemory storage.
   */
  constructor() {
    super();
    this.games = new Map();
    this.metadata = new Map();
  }

  /**
   * Write the game metadata to the in-memory object.
   */
  setMetadata(gameID: string, metadata: Server.GameMetadata) {
    this.metadata.set(gameID, metadata);
  }

  /**
   * Read the game metadata from the in-memory object.
   */
  getMetadata(gameID: string): Server.GameMetadata {
    return this.metadata.get(gameID);
  }

  /**
   * Write the game state to the in-memory object.
   */
  setState(gameID: string, state: State): void {
    this.games.set(gameID, state);
  }

  /**
   * Read the game state from the in-memory object.
   */
  getState(gameID: string): State {
    return this.games.get(gameID);
  }

  /**
   * Check if a particular game id exists.
   */
  has(gameID: string): boolean {
    return this.games.has(gameID);
  }

  /**
   * Remove the game state from the in-memory object.
   */
  remove(gameID: string) {
    if (!this.games.has(gameID)) return;
    this.games.delete(gameID);
  }

  /**
   * Return all keys.
   */
  list(): string[] {
    return [...this.games.keys()];
  }
}
