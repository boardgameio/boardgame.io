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
  private metadata: Map<string, Server.MatchData>;
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
  createGame(matchID: string, opts: StorageAPI.CreateGameOpts) {
    this.initial.set(matchID, opts.initialState);
    this.setState(matchID, opts.initialState);
    this.setMetadata(matchID, opts.metadata);
  }

  /**
   * Write the game metadata to the in-memory object.
   */
  setMetadata(matchID: string, metadata: Server.MatchData) {
    this.metadata.set(matchID, metadata);
  }

  /**
   * Write the game state to the in-memory object.
   */
  setState(matchID: string, state: State, deltalog?: LogEntry[]): void {
    if (deltalog && deltalog.length > 0) {
      const log = this.log.get(matchID) || [];
      this.log.set(matchID, log.concat(deltalog));
    }
    this.state.set(matchID, state);
  }

  /**
   * Fetches state for a particular matchID.
   */
  fetch<O extends StorageAPI.FetchOpts>(
    matchID: string,
    opts: O
  ): StorageAPI.FetchResult<O> {
    let result = {} as StorageAPI.FetchFields;

    if (opts.state) {
      result.state = this.state.get(matchID);
    }

    if (opts.metadata) {
      result.metadata = this.metadata.get(matchID);
    }

    if (opts.log) {
      result.log = this.log.get(matchID) || [];
    }

    if (opts.initialState) {
      result.initialState = this.initial.get(matchID);
    }

    return result as StorageAPI.FetchResult<O>;
  }

  /**
   * Remove the game state from the in-memory object.
   */
  wipe(matchID: string) {
    this.state.delete(matchID);
    this.metadata.delete(matchID);
  }

  /**
   * Return all keys.
   */
  listGames(opts?: StorageAPI.ListGamesOpts): string[] {
    return [...this.metadata.entries()]
      .filter(([key, metadata]) => {
        if (!opts) {
          return true;
        }

        if (
          opts.gameName !== undefined &&
          metadata.gameName !== opts.gameName
        ) {
          return false;
        }

        if (opts.where !== undefined) {
          if (opts.where.isGameover !== undefined) {
            const isGameover = metadata.gameover !== undefined;
            if (isGameover !== opts.where.isGameover) {
              return false;
            }
          }

          if (
            opts.where.updatedBefore !== undefined &&
            metadata.updatedAt >= opts.where.updatedBefore
          ) {
            return false;
          }

          if (
            opts.where.updatedAfter !== undefined &&
            metadata.updatedAt <= opts.where.updatedAfter
          ) {
            return false;
          }
        }

        return true;
      })
      .map(([key]) => key);
  }
}
