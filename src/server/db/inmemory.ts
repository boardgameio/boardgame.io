import { State, Server, LogEntry } from '../../types';
import * as StorageAPI from './base';

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
export class InMemory extends StorageAPI.Sync {
  private games: Map<string, State>;
  private metadata: Map<string, Server.GameMetadata>;
  private log: Map<string, LogEntry[]>;

  /**
   * Creates a new InMemory storage.
   */
  constructor() {
    super();
    this.games = new Map();
    this.metadata = new Map();
    this.log = new Map();
  }

  /**
   * Write the game metadata to the in-memory object.
   */
  setMetadata(gameID: string, metadata: Server.GameMetadata) {
    this.metadata.set(gameID, metadata);
  }

  /**
   * Write the game state to the in-memory object.
   */
  setState(gameID: string, state: State): void {
    this.games.set(gameID, state);

    let log = this.log.get(gameID) || [];
    if (state.deltalog) {
      log = log.concat(state.deltalog);
    }
    this.log.set(gameID, log);
  }

  /**
   * Fetches state for a particular gameID.
   */
  fetch(gameID: string, opts: StorageAPI.FetchOpts): StorageAPI.FetchResult {
    let result: StorageAPI.FetchResult = {};

    if (opts.state) {
      result.state = this.games.get(gameID);
    }

    if (opts.metadata) {
      result.metadata = this.metadata.get(gameID);
    }

    if (opts.log) {
      result.log = this.log.get(gameID) || [];
    }

    return result;
  }

  /**
   * Remove the game state from the in-memory object.
   */
  remove(gameID: string) {
    this.games.delete(gameID);
    this.metadata.delete(gameID);
  }

  /**
   * Return all keys.
   */
  listGames(gameName?: string): string[] {
    if (gameName !== undefined) {
      let gameIDs = [];
      this.metadata.forEach((metadata, gameID) => {
        if (metadata.gameName === gameName) {
          gameIDs.push(gameID);
        }
      });
      return gameIDs;
    }
    return [...this.metadata.keys()];
  }
}
