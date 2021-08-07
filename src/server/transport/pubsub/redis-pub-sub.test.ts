import type redis from 'redis';
import { RedisPubSub } from './redis-pub-sub';
import { PubSubChannelIdNamespace } from './generic-pub-sub';
import type { PubSubChannelId } from './generic-pub-sub';

const CHANNEL_FOO: PubSubChannelId = {
  namespace: PubSubChannelIdNamespace.MATCH,
  value: 'foo',
};
const CHANNEL_FOO_GLOBAL_ID = 'MATCH-foo';

describe('redis pub-sub', () => {
  let pubClient: redis.RedisClient;
  let subClient: redis.RedisClient;
  let pubSub: RedisPubSub<string>;

  beforeEach(() => {
    subClient = {
      subscribe: jest.fn(),
      unsubscribe: jest.fn(),
      on: jest.fn(),
    };
    pubClient = {
      publish: jest.fn(),
    };
    pubSub = new RedisPubSub(pubClient, subClient);
  });

  it('should publish a payload to redis', () => {
    const payload = 'hello world';
    pubSub.publish(CHANNEL_FOO, payload);
    expect(pubClient.publish).toHaveBeenCalledWith(
      CHANNEL_FOO_GLOBAL_ID,
      JSON.stringify(payload)
    );
  });

  it('should unsubscribe to a channel in redis', () => {
    pubSub.unsubscribe(CHANNEL_FOO);
    expect(subClient.unsubscribe).toHaveBeenCalledWith(CHANNEL_FOO_GLOBAL_ID);
  });

  it('should subscribe to a channel in redis', () => {
    pubSub.subscribe(CHANNEL_FOO);
    expect(subClient.subscribe).toHaveBeenCalledWith(CHANNEL_FOO_GLOBAL_ID);
  });

  it('should not subscribe twice to the same channel in redis', () => {
    pubSub.subscribe(CHANNEL_FOO);
    pubSub.subscribe(CHANNEL_FOO);
    expect(subClient.subscribe).toHaveBeenCalledTimes(1);
  });

  it('should receive a message after subscription', () => {
    const rxjsCallback = jest.fn();
    const payload = 'hello world';
    pubSub.subscribe(CHANNEL_FOO).subscribe(rxjsCallback);
    const redisCallback = subClient.on.mock.calls[0][1];
    redisCallback(CHANNEL_FOO_GLOBAL_ID, JSON.stringify(payload));
    expect(rxjsCallback).toHaveBeenCalledWith(payload);
  });

  it('should ignore message from unrelated channel', () => {
    const rxjsCallback = jest.fn();
    const payload = 'hello world';
    pubSub.subscribe(CHANNEL_FOO).subscribe(rxjsCallback);
    const redisCallback = subClient.on.mock.calls[0][1];
    redisCallback('notTheRightId', JSON.stringify(payload));
    expect(rxjsCallback).not.toHaveBeenCalled();
  });
});
