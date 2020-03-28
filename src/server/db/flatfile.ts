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
    init: (opts: object) => void;
    setItem: (id: string, value: any) => void;
    getItem: (id: string) => State | Server.GameMetadata | LogEntry[];
    removeItem: (id: string) => void;
    clear: () => {};
    keys: () => string[];
  };
  private dir: string;
  private logging?: boolean;
  private ttl?: boolean;

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
    await this.games.setItem(key, opts.initialState);

    await this.setState(gameID, opts.initialState);
    await this.setMetadata(gameID, opts.metadata);
  }

  async fetch<O extends StorageAPI.FetchOpts>(
    gameID: string,
    opts: O
  ): Promise<StorageAPI.FetchResult<O>> {
    let result = {} as StorageAPI.FetchFields;

    if (opts.state) {
      result.state = (await this.games.getItem(gameID)) as State;
    }

    if (opts.metadata) {
      const key = MetadataKey(gameID);
      result.metadata = (await this.games.getItem(key)) as Server.GameMetadata;
    }

    if (opts.log) {
      const key = LogKey(gameID);
      result.log = (await this.games.getItem(key)) as LogEntry[];
    }

    if (opts.initialState) {
      const key = InitialStateKey(gameID);
      result.initialState = (await this.games.getItem(key)) as State;
    }

    return result as StorageAPI.FetchResult<O>;
  }

  async clear() {
    return this.games.clear();
  }

  async setState(id: string, state: State, deltalog?: LogEntry[]) {
    if (deltalog && deltalog.length > 0) {
      const key = LogKey(id);
      const log: LogEntry[] =
        ((await this.games.getItem(key)) as LogEntry[]) || [];
      await this.games.setItem(key, log.concat(deltalog));
    }
    return await this.games.setItem(id, state);
  }

  async setMetadata(id: string, metadata: Server.GameMetadata): Promise<void> {
    const key = MetadataKey(id);
    return await this.games.setItem(key, metadata);
  }

  async wipe(id: string) {
    var keys = await this.games.keys();
    if (!(keys.indexOf(id) > -1)) return;
    await this.games.removeItem(id);
    await this.games.removeItem(LogKey(id));
    await this.games.removeItem(MetadataKey(id));
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
