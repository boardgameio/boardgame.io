/** Generic interface for pub-subs.  */
export interface GenericPubSub<T> {
  // Publish an event for a match.
  publish(channelId: string, payload: T);

  // Subscribes to events related to a single match.
  subscribe(channelId: string, callback: (payload: T) => void): void;

  // Cleans up subscription for a given channel.
  unsubscribeAll(channelId: string);
}
