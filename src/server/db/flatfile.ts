import * as StorageAPI from './base';
import { State, Server, LogEntry } from '../../types';

/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

/**
 * FlatFile data storage.
 */
export class FlatFile extends StorageAPI.Async {
  private games: {
    init: (opts: object) => Promise<void>;
    setItem: (id: string, value: any) => Promise<any>;
    getItem: (id: string) => Promise<State | Server.MatchMetadata | LogEntry[]>;
    removeItem: (id: string) => Promise<void>;
    clear: () => {};
    keys: () => Promise<string[]>;
  };
  private dir: string;
  private logging?: boolean;
  private ttl?: boolean;
  private fileQueues: { [key: string]: Promise<any> };

  constructor({
    dir,
    logging,
    ttl,
  }: {
    dir: string;
    logging?: boolean;
    ttl?: boolean;
  }) {
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

  async createGame(
    gameID: string,
    opts: StorageAPI.CreateGameOpts
  ): Promise<void> {
    // Store initial state separately for easy retrieval later.
    const key = InitialStateKey(gameID);

    await this.setItem(key, opts.initialState);
    await this.setState(gameID, opts.initialState);
    await this.setMetadata(gameID, opts.metadata);
  }

  async fetch<O extends StorageAPI.FetchOpts>(
    gameID: string,
    opts: O
  ): Promise<StorageAPI.FetchResult<O>> {
    let result = {} as StorageAPI.FetchFields;

    if (opts.state) {
      result.state = (await this.getItem(gameID)) as State;
    }

    if (opts.metadata) {
      const key = MetadataKey(gameID);
      result.metadata = (await this.getItem(key)) as Server.MatchMetadata;
    }

    if (opts.log) {
      const key = LogKey(gameID);
      result.log = (await this.getItem(key)) as LogEntry[];
    }

    if (opts.initialState) {
      const key = InitialStateKey(gameID);
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

      await this.setItem(key, log.concat(deltalog));
    }

    return await this.setItem(id, state);
  }

  async setMetadata(id: string, metadata: Server.MatchMetadata): Promise<void> {
    const key = MetadataKey(id);

    return await this.setItem(key, metadata);
  }

  async wipe(id: string) {
    var keys = await this.games.keys();
    if (!(keys.indexOf(id) > -1)) return;

    await this.removeItem(id);
    await this.removeItem(InitialStateKey(id));
    await this.removeItem(LogKey(id));
    await this.removeItem(MetadataKey(id));
  }

  async listGames(): Promise<string[]> {
    const keys = await this.games.keys();
    const suffix = ':metadata';
    return keys
      .filter(k => k.endsWith(suffix))
      .map(k => k.substring(0, k.length - suffix.length));
  }
}

function InitialStateKey(gameID: string) {
  return `${gameID}:initial`;
}

function MetadataKey(gameID: string) {
  return `${gameID}:metadata`;
}

function LogKey(gameID: string) {
  return `${gameID}:log`;
}
