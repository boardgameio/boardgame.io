import { InMemory } from './inmemory';

const globalAny: any = global;

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
    globalAny.localStorage.setItem(
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
  constructor() {
    super();
    this.state = new WithLocalStorageMap('state');
    this.initial = new WithLocalStorageMap('initial');
    this.metadata = new WithLocalStorageMap('metadata');
    this.log = new WithLocalStorageMap('log');
  }
}

function initFromCache(key: string): any[] {
  return JSON.parse(globalAny.localStorage.getItem(getStorageKey(key))) || [];
}

function getStorageKey(key: string) {
  return `bgio_${key}`;
}
