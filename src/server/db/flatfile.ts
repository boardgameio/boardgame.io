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

    const setRequest = () => this.games.setItem(key, opts.initialState);
    this.requests = this.requests.then(setRequest, setRequest);

    await this.requests;

    await this.setState(gameID, opts.initialState);
    await this.setMetadata(gameID, opts.metadata);
  }

  async fetch<O extends StorageAPI.FetchOpts>(
    gameID: string,
    opts: O
  ): Promise<StorageAPI.FetchResult<O>> {
    let result = {} as StorageAPI.FetchFields;

    if (opts.state) {
      const fetchRequest = () => this.games.getItem(gameID);
      this.requests = this.requests.then(fetchRequest, fetchRequest);

      result.state = (await this.requests) as State;
    }

    if (opts.metadata) {
      const key = MetadataKey(gameID);

      const fetchRequest = () => this.games.getItem(key);
      this.requests = this.requests.then(fetchRequest, fetchRequest);

      result.metadata = (await this.requests) as Server.GameMetadata;
    }

    if (opts.log) {
      const key = LogKey(gameID);

      const fetchRequest = () => this.games.getItem(key);
      this.requests = this.requests.then(fetchRequest, fetchRequest);

      result.log = (await this.requests) as LogEntry[];
    }

    if (opts.initialState) {
      const key = InitialStateKey(gameID);

      const fetchRequest = () => this.games.getItem(key);
      this.requests = this.requests.then(fetchRequest, fetchRequest);

      result.initialState = (await this.requests) as State;
    }

    return result as StorageAPI.FetchResult<O>;
  }

  async clear() {
    return this.games.clear();
  }

  async setState(id: string, state: State, deltalog?: LogEntry[]) {
    if (deltalog && deltalog.length > 0) {
      const key = LogKey(id);

      const getRequest = () => this.games.getItem(key);
      this.requests = this.requests.then(getRequest, getRequest);

      const log: LogEntry[] = ((await this.requests) as LogEntry[]) || [];

      const setRequest = () => this.games.setItem(key, log.concat(deltalog));
      this.requests = this.requests.then(setRequest, setRequest);

      await this.requests;
    }

    const setRequest = () => this.games.setItem(id, state);
    this.requests = this.requests.then(setRequest, setRequest);

    return await this.requests;
  }

  async setMetadata(id: string, metadata: Server.GameMetadata): Promise<void> {
    const key = MetadataKey(id);

    const setRequest = () => this.games.setItem(key, metadata);
    this.requests = this.requests.then(setRequest, setRequest);

    return await this.requests;
  }

  async wipe(id: string) {
    var keys = await this.games.keys();
    if (!(keys.indexOf(id) > -1)) return;

    const removeIdRequest = () => this.games.removeItem(id);
    this.requests = this.requests.then(removeIdRequest, removeIdRequest);

    await this.requests;

    const removeLogRequest = () => this.games.removeItem(LogKey(id));
    this.requests = this.requests.then(removeLogRequest, removeLogRequest);

    await this.requests;

    const removeMetaRequest = () => this.games.removeItem(MetadataKey(id));
    this.requests = this.requests.then(removeMetaRequest, removeMetaRequest);

    await this.requests;
  }

  async listGames(): Promise<string[]> {
    const getKeysRequest = () => this.games.keys();
    this.requests = this.requests.then(getKeysRequest, getKeysRequest);

    const keys = await this.requests;
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
