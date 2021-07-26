import type redis from 'redis';
import { Observable } from 'rxjs';
import type { GenericPubSub, PubSubChannelId } from './generic-pub-sub';
import { globalChannelId } from './util';

export class RedisPubSub<T> implements GenericPubSub<T> {
  client: redis.RedisClient;
  subscriptions: Map<PubSubChannelId, Observable<T>> = new Map();

  constructor(client: redis.RedisClient) {
    this.client = client;
  }

  publish(channelId: PubSubChannelId, payload: T) {
    this.client.publish(globalChannelId(channelId), JSON.stringify(payload));
  }

  subscribe(channelId: PubSubChannelId): Observable<T> {
    if (this.subscriptions.has(channelId)) {
      return this.subscriptions.get(channelId);
    }
    const observable = new Observable<T>((subscribe) => {
      this.client.on('message', (redisChannelId, message) => {
        if (redisChannelId != globalChannelId(channelId)) {
          return;
        }
        subscribe.next(JSON.parse(message) as T);
      });
    });
    this.client.subscribe(globalChannelId(channelId));
    this.subscriptions.set(channelId, observable);
    return observable;
  }

  unsubscribe(channelId: PubSubChannelId) { 
    this.subscriptions.delete(channelId);
    this.client.unsubscribe(globalChannelId(channelId));
  }
}
