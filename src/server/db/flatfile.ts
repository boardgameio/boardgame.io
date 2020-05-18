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
  private requests: Promise<any>;

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
    this.requests = Promise.resolve();
  }

  private async request<T extends any = any>(
    action: () => Promise<T>
  ): Promise<T> {
    this.requests = this.requests.then(action, action);
    return this.requests;
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

    await this.request(() => this.games.setItem(key, opts.initialState));

    await this.setState(gameID, opts.initialState);
    await this.setMetadata(gameID, opts.metadata);
  }

  async fetch<O extends StorageAPI.FetchOpts>(
    gameID: string,
    opts: O
  ): Promise<StorageAPI.FetchResult<O>> {
    let result = {} as StorageAPI.FetchFields;

    if (opts.state) {
      result.state = (await this.request(() =>
        this.games.getItem(gameID)
      )) as State;
    }

    if (opts.metadata) {
      const key = MetadataKey(gameID);
      result.metadata = (await this.request(() =>
        this.games.getItem(key)
      )) as Server.MatchMetadata;
    }

    if (opts.log) {
      const key = LogKey(gameID);
      result.log = (await this.request(() =>
        this.games.getItem(key)
      )) as LogEntry[];
    }

    if (opts.initialState) {
      const key = InitialStateKey(gameID);
      result.initialState = (await this.request(() =>
        this.games.getItem(key)
      )) as State;
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
        ((await this.request(() => this.games.getItem(key))) as LogEntry[]) ||
        [];

      await this.request(() => this.games.setItem(key, log.concat(deltalog)));
    }

    return await this.request(() => this.games.setItem(id, state));
  }

  async setMetadata(id: string, metadata: Server.MatchMetadata): Promise<void> {
    const key = MetadataKey(id);

    return await this.request(() => this.games.setItem(key, metadata));
  }

  async wipe(id: string) {
    var keys = await this.games.keys();
    if (!(keys.indexOf(id) > -1)) return;

    await this.request(() => this.games.removeItem(id));
    await this.request(() => this.games.removeItem(LogKey(id)));
    await this.request(() => this.games.removeItem(MetadataKey(id)));
  }

  async listGames(): Promise<string[]> {
    const keys = await this.request(() => this.games.keys());
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
