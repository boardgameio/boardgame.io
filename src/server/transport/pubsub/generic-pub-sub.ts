import type { Observable } from 'rxjs';

/** Generic interface for pub-subs.  */
export interface GenericPubSub<T> {
  // Publish an event for a match.
  publish(channelId: PubSubChannelId, payload: T);

  // Subscribes to events related to a single match.
  subscribe(channelId: PubSubChannelId): Observable<T>;

  // Cleans up subscription for a given channel.
  unsubscribe(channelId: PubSubChannelId);
}

/** All possible namespaces for IDs that pubsubs might be used.  */
export enum PubSubChannelIdNamespace {
  MATCH = 'MATCH',
}

export interface PubSubChannelId {
  namespace: PubSubChannelIdNamespace;
  value: string;
}
