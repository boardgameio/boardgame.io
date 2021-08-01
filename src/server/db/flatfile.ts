import * as StorageAPI from './base';
import type { State, Server, LogEntry } from '../../types';

/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

interface InitOptions {
  dir: string;
  logging?: boolean;
  ttl?: boolean;
}

/**
 * FlatFile data storage.
 */
export class FlatFile extends StorageAPI.Async {
  private games: {
    init: (opts: InitOptions) => Promise<void>;
    setItem: (id: string, value: any) => Promise<any>;
    getItem: (id: string) => Promise<State | Server.MatchData | LogEntry[]>;
    removeItem: (id: string) => Promise<void>;
    clear: () => void;
    keys: () => Promise<string[]>;
  };
  private dir: string;
  private logging?: boolean;
  private ttl?: boolean;
  private fileQueues: { [key: string]: Promise<any> };

  constructor({ dir, logging, ttl }: InitOptions) {
    super();
    this.games = require('node-persist');
    this.dir = dir;
    this.logging = logging || false;
    this.ttl = ttl || false;
    this.fileQueues = {};
  }

  private async chainRequest(
    key: string,
    request: () => Promise<any>
  ): Promise<any> {
    if (!(key in this.fileQueues)) this.fileQueues[key] = Promise.resolve();

    this.fileQueues[key] = this.fileQueues[key].then(request, request);
    return this.fileQueues[key];
  }

  private async getItem<T extends any = any>(key: string): Promise<T> {
    return this.chainRequest(key, () => this.games.getItem(key));
  }

  private async setItem<T extends any = any>(
    key: string,
    value: T
  ): Promise<any> {
    return this.chainRequest(key, () => this.games.setItem(key, value));
  }

  private async removeItem(key: string): Promise<void> {
    return this.chainRequest(key, () => this.games.removeItem(key));
  }

  async connect() {
    await this.games.init({
      dir: this.dir,
      logging: this.logging,
      ttl: this.ttl,
    });
    return;
  }

  /**
   * Create new match.
   *
   * @param matchID
   * @param opts
   * @override
   */
  async createMatch(
    matchID: string,
    opts: StorageAPI.CreateMatchOpts
  ): Promise<void> {
    // Store initial state separately for easy retrieval later.
    const key = InitialStateKey(matchID);

    await this.setItem(key, opts.initialState);
    await this.setState(matchID, opts.initialState);
    await this.setMetadata(matchID, opts.metadata);
  }

  async fetch<O extends StorageAPI.FetchOpts>(
    matchID: string,
    opts: O
  ): Promise<StorageAPI.FetchResult<O>> {
    const result = {} as StorageAPI.FetchFields;

    if (opts.state) {
      result.state = (await this.getItem(matchID)) as State;
    }

    if (opts.metadata) {
      const key = MetadataKey(matchID);
      result.metadata = (await this.getItem(key)) as Server.MatchData;
    }

    if (opts.log) {
      const key = LogKey(matchID);
      result.log = (await this.getItem(key)) as LogEntry[];
    }

    if (opts.initialState) {
      const key = InitialStateKey(matchID);
      result.initialState = (await this.getItem(key)) as State;
    }

    return result as StorageAPI.FetchResult<O>;
  }

  async clear() {
    return this.games.clear();
  }

  async setState(id: string, state: State, deltalog?: LogEntry[]) {
    if (deltalog && deltalog.length > 0) {
      const key = LogKey(id);
      const log: LogEntry[] = ((await this.getItem(key)) as LogEntry[]) || [];

      await this.setItem(key, [...log, ...deltalog]);
    }

    return await this.setItem(id, state);
  }

  async setMetadata(id: string, metadata: Server.MatchData): Promise<void> {
    const key = MetadataKey(id);

    return await this.setItem(key, metadata);
  }

  async wipe(id: string) {
    const keys = await this.games.keys();
    if (!keys.includes(id)) return;

    await this.removeItem(id);
    await this.removeItem(InitialStateKey(id));
    await this.removeItem(LogKey(id));
    await this.removeItem(MetadataKey(id));
  }

  /**
   * List matches IDs.
   *
   * @param opts
   * @override
   */
  async listMatches(opts?: StorageAPI.ListMatchesOpts): Promise<string[]> {
    const keys = await this.games.keys();
    const suffix = ':metadata';

    const arr = await Promise.all(
      keys.map(async (k) => {
        if (!k.endsWith(suffix)) {
          return false;
        }

        const matchID = k.slice(0, k.length - suffix.length);

        if (!opts) {
          return matchID;
        }

        const game = await this.fetch(matchID, {
          state: true,
          metadata: true,
        });

        if (opts.gameName && opts.gameName !== game.metadata.gameName) {
          return false;
        }

        if (opts.where !== undefined) {
          if (typeof opts.where.isGameover !== 'undefined') {
            const isGameover = typeof game.metadata.gameover !== 'undefined';
            if (isGameover !== opts.where.isGameover) {
              return false;
            }
          }

          if (
            typeof opts.where.updatedBefore !== 'undefined' &&
            game.metadata.updatedAt >= opts.where.updatedBefore
          ) {
            return false;
          }

          if (
            typeof opts.where.updatedAfter !== 'undefined' &&
            game.metadata.updatedAt <= opts.where.updatedAfter
          ) {
            return false;
          }
        }

        return matchID;
      })
    );

    return arr.filter((r): r is string => typeof r === 'string');
  }
}

function InitialStateKey(matchID: string) {
  return `${matchID}:initial`;
}

function MetadataKey(matchID: string) {
  return `${matchID}:metadata`;
}

function LogKey(matchID: string) {
  return `${matchID}:log`;
}
