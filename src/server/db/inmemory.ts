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
  private state: Map<string, State>;
  private initial: Map<string, State>;
  private metadata: Map<string, Server.GameMetadata>;
  private log: Map<string, LogEntry[]>;

  /**
   * Creates a new InMemory storage.
   */
  constructor() {
    super();
    this.state = new Map();
    this.initial = new Map();
    this.metadata = new Map();
    this.log = new Map();
  }

  /**
   * Create a new game.
   */
  createGame(gameID: string, opts: StorageAPI.CreateGameOpts) {
    this.initial.set(gameID, opts.initialState);
    this.setState(gameID, opts.initialState);
    this.setMetadata(gameID, opts.metadata);
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
  setState(gameID: string, state: State, deltalog?: LogEntry[]): void {
    if (deltalog && deltalog.length > 0) {
      const log = this.log.get(gameID) || [];
      this.log.set(gameID, log.concat(deltalog));
    }
    this.state.set(gameID, state);
  }

  /**
   * Fetches state for a particular gameID.
   */
  fetch<O extends StorageAPI.FetchOpts>(
    gameID: string,
    opts: O
  ): StorageAPI.FetchResult<O> {
    let result = {} as StorageAPI.FetchFields;

    if (opts.state) {
      result.state = this.state.get(gameID);
    }

    if (opts.metadata) {
      result.metadata = this.metadata.get(gameID);
    }

    if (opts.log) {
      result.log = this.log.get(gameID) || [];
    }

    if (opts.initialState) {
      result.initialState = this.initial.get(gameID);
    }

    return result as StorageAPI.FetchResult<O>;
  }

  /**
   * Remove the game state from the in-memory object.
   */
  wipe(gameID: string) {
    this.state.delete(gameID);
    this.metadata.delete(gameID);
  }

  /**
   * Return all keys.
   */
  listGames(opts?: StorageAPI.ListGamesOpts): string[] {
    if (opts && opts.gameName !== undefined) {
      let gameIDs = [];
      this.metadata.forEach((metadata, gameID) => {
        if (metadata.gameName === opts.gameName) {
          gameIDs.push(gameID);
        }
      });
      return gameIDs;
    }
    return [...this.metadata.keys()];
  }
}
