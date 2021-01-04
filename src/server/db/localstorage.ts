import { InMemory } from './inmemory';

class WithLocalStorageMap<Key, Value> extends Map {
  key: string;

  constructor(key: string) {
    super();
    this.key = key;
    const cache = JSON.parse(localStorage.getItem(this.key)) || [];
    cache.forEach((entry: [Key, Value]) => this.set(...entry));
  }

  sync(): void {
    const entries = [...this.entries()];
    localStorage.setItem(this.key, JSON.stringify(entries));
  }

  set(key: Key, value: Value): this {
    super.set(key, value);
    this.sync();
    return this;
  }

  delete(key: Key): boolean {
    const result = super.delete(key);
    this.sync();
    return result;
  }
}

/**
 * locaStorage data storage.
 */
export class LocalStorage extends InMemory {
  constructor(storagePrefix = 'bgio') {
    super();
    const StorageMap = (stateKey: string) =>
      new WithLocalStorageMap(`${storagePrefix}_${stateKey}`);
    this.state = StorageMap('state');
    this.initial = StorageMap('initial');
    this.metadata = StorageMap('metadata');
    this.log = StorageMap('log');
  }
}
