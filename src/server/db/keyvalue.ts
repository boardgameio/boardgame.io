import * as StorageAPI from './base';
import { State, Server, LogEntry } from '../../types';

export interface KeyValueStore {
  init(opts: object): Promise<void>;
  setItem(id: string, value: any): Promise<void>;
  getItem(id: string): Promise<State | Server.GameMetadata | LogEntry[]>;
  removeItem(id: string): Promise<void>;
  clear(): Promise<void>;
  keys(): Promise<string[]>;
}

export class KeyValue extends StorageAPI.Async {
  private store: KeyValueStore;
  private storeInitArgs: object;

  constructor(store: KeyValueStore, storeInitArgs: object) {
    super();
    this.store = store;
    this.storeInitArgs = storeInitArgs;
  }

  async connect() {
    return await this.store.init(this.storeInitArgs);
  }

  async createGame(
    gameID: string,
    opts: StorageAPI.CreateGameOpts
  ): Promise<void> {
    // Store initial state separately for easy retrieval later.
    const key = InitialStateKey(gameID);
    await this.store.setItem(key, opts.initialState);

    await this.setState(gameID, opts.initialState);
    await this.setMetadata(gameID, opts.metadata);
  }

  async fetch<O extends StorageAPI.FetchOpts>(
    gameID: string,
    opts: O
  ): Promise<StorageAPI.FetchResult<O>> {
    let result = {} as StorageAPI.FetchFields;

    if (opts.state) {
      result.state = (await this.store.getItem(gameID)) as State;
    }

    if (opts.metadata) {
      const key = MetadataKey(gameID);
      result.metadata = (await this.store.getItem(key)) as Server.GameMetadata;
    }

    if (opts.log) {
      const key = LogKey(gameID);
      result.log = (await this.store.getItem(key)) as LogEntry[];
    }

    if (opts.initialState) {
      const key = InitialStateKey(gameID);
      result.initialState = (await this.store.getItem(key)) as State;
    }

    return result as StorageAPI.FetchResult<O>;
  }

  async clear() {
    return await this.store.clear();
  }

  async setState(id: string, state: State, deltalog?: LogEntry[]) {
    if (deltalog && deltalog.length > 0) {
      const key = LogKey(id);
      const log: LogEntry[] =
        ((await this.store.getItem(key)) as LogEntry[]) || [];
      await this.store.setItem(key, log.concat(deltalog));
    }
    return await this.store.setItem(id, state);
  }

  async setMetadata(id: string, metadata: Server.GameMetadata): Promise<void> {
    const key = MetadataKey(id);
    return await this.store.setItem(key, metadata);
  }

  async wipe(id: string) {
    var keys = await this.store.keys();
    if (!(keys.indexOf(id) > -1)) return;
    await this.store.removeItem(id);
    await this.store.removeItem(LogKey(id));
    await this.store.removeItem(MetadataKey(id));
  }

  async listGames(): Promise<string[]> {
    const keys = await this.store.keys();
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
