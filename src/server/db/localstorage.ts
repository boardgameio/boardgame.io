import { InMemory } from './inmemory';

class WithLocalStorageMap<Tkey, Tvalue> extends Map {
  key: string;
  constructor(key: string) {
    super();
    const inCache = initFromCache(key);
    inCache.forEach((pair: any[]) => {
      this.set(pair[0], pair[1]);
    });
    this.key = getStorageKey(key);
  }
  sync(): void {
    !!this.key &&
      localStorage.setItem(
        this.key,
        JSON.stringify(Array.from(this.entries()))
      );
  }
  set(key: Tkey, value: Tvalue): this {
    super.set(key, value);
    this.sync();
    return this;
  }
  delete(key: Tkey): boolean {
    const result = super.delete(key);
    this.sync();
    return result;
  }
}

/**
 * locaStorage data storage.
 */

export class LocalStorage extends InMemory {
  constructor(storageKey) {
    super();
    // little curry would be nicer here
    this.state = new WithLocalStorageMap(
      appendStorageKeyPrefix(storageKey, 'state')
    );
    this.initial = new WithLocalStorageMap(
      appendStorageKeyPrefix(storageKey, 'initial')
    );
    this.metadata = new WithLocalStorageMap(
      appendStorageKeyPrefix(storageKey, 'metadata')
    );
    this.log = new WithLocalStorageMap(
      appendStorageKeyPrefix(storageKey, 'log')
    );
  }
}

function initFromCache(key: string): any[] {
  return JSON.parse(localStorage.getItem(getStorageKey(key))) || [];
}

function getStorageKey(key: string) {
  return `bgio_${key}`;
}

function appendStorageKeyPrefix(prefix: string, key: string) {
  return prefix ? `${prefix}_${key}` : key;
}
