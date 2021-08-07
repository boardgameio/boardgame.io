import { InMemoryPubSub } from './in-memory-pub-sub';
import type { PubSubChannelId } from './generic-pub-sub';
import { PubSubChannelIdNamespace } from './generic-pub-sub';

const CHANNEL_FOO: PubSubChannelId = {
  namespace: PubSubChannelIdNamespace.MATCH,
  value: 'foo',
};

describe('in-memory pubsub', () => {
  it('should receive message from subscription', () => {
    const pubSub = new InMemoryPubSub<string>();
    const callback = jest.fn();
    pubSub.subscribe(CHANNEL_FOO).subscribe(callback);
    const payload = 'hello world';
    pubSub.publish(CHANNEL_FOO, payload);
    expect(callback).toHaveBeenCalledWith(payload);
  });

  it('should unsubscribe', () => {
    const pubSub = new InMemoryPubSub<string>();
    const callback = jest.fn();
    pubSub.subscribe(CHANNEL_FOO).subscribe(callback);
    pubSub.unsubscribe(CHANNEL_FOO);
    const payload = 'hello world';
    pubSub.publish(CHANNEL_FOO, payload);
    expect(callback).not.toHaveBeenCalled();
  });

  it('should ignore extra unsubscribe', () => {
    const pubSub = new InMemoryPubSub<string>();
    const callback = jest.fn();
    pubSub.subscribe(CHANNEL_FOO).subscribe(callback);
    pubSub.unsubscribe(CHANNEL_FOO);
    pubSub.unsubscribe(CHANNEL_FOO); // do nothing
    const payload = 'hello world';
    pubSub.publish(CHANNEL_FOO, payload);
    expect(callback).not.toHaveBeenCalled();
  });
});
