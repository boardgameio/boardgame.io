import { StorageAPI } from './base';
import { State, Server } from '../../types';

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
export class FlatFile extends StorageAPI {
  private games: {
    init: (opts: object) => void;
    setItem: (id: string, value: any) => void;
    getItem: (id: string) => State | Server.GameMetadata;
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

  async clear() {
    return this.games.clear();
  }

  async setState(id: string, state: State) {
    return await this.games.setItem(id, state);
  }

  async getState(id: string): Promise<State> {
    return (await this.games.getItem(id)) as State;
  }

  async getMetadata(id: string): Promise<Server.GameMetadata> {
    const key = MetadataKey(id);
    return (await this.games.getItem(key)) as Server.GameMetadata;
  }

  async setMetadata(id: string, metadata: Server.GameMetadata): Promise<void> {
    const key = MetadataKey(id);
    return await this.games.setItem(key, metadata);
  }

  async has(id: string): Promise<boolean> {
    var keys = await this.games.keys();
    return keys.indexOf(id) > -1;
  }

  async remove(id: string) {
    var keys = await this.games.keys();
    if (!(keys.indexOf(id) > -1)) return;
    this.games.removeItem(id);
  }

  async list(): Promise<string[]> {
    const keys = await this.games.keys();
    const suffix = ':metadata';
    return keys
      .filter(k => k.endsWith(suffix))
      .map(k => k.substring(0, k.length - suffix.length));
  }
}

function MetadataKey(gameID: string) {
  return `${gameID}:metadata`;
}
