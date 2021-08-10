import type { GenericPubSub } from './generic-pub-sub';

export class InMemoryPubSub<T> implements GenericPubSub<T> {
  callbacks: Map<string, ((payload: T) => void)[]> = new Map();

  publish(channelId: string, payload: T) {
    if (!this.callbacks.has(channelId)) {
      return;
    }
    const allCallbacks = this.callbacks.get(channelId);
    for (const callback of allCallbacks) {
      callback(payload);
    }
  }

  subscribe(channelId: string, callback: (payload: T) => void): void {
    if (!this.callbacks.has(channelId)) {
      this.callbacks.set(channelId, []);
    }
    this.callbacks.get(channelId).push(callback);
  }

  unsubscribeAll(channelId: string) {
    if (this.callbacks.has(channelId)) {
      this.callbacks.delete(channelId);
    }
  }
}
