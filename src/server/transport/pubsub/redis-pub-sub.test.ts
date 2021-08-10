import type redis from 'redis';
import { RedisPubSub } from './redis-pub-sub';

const CHANNEL_FOO = 'MATCH-foo';

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
      CHANNEL_FOO,
      JSON.stringify(payload)
    );
  });

  it('should unsubscribe to a channel in redis', () => {
    pubSub.unsubscribeAll(CHANNEL_FOO);
    expect(subClient.unsubscribe).toHaveBeenCalledWith(CHANNEL_FOO);
  });

  it('should receive a message after subscription', () => {
    const callback = jest.fn();
    const payload = 'hello world';
    pubSub.subscribe(CHANNEL_FOO, callback);
    const redisCallback = subClient.on.mock.calls[0][1];
    redisCallback(CHANNEL_FOO, JSON.stringify(payload));
    expect(callback).toHaveBeenCalledWith(payload);
  });

  it('should ignore message from unrelated channel', () => {
    const callback = jest.fn();
    const payload = 'hello world';
    pubSub.subscribe(CHANNEL_FOO, callback);
    const redisCallback = subClient.on.mock.calls[0][1];
    redisCallback('notTheRightId', JSON.stringify(payload));
    expect(callback).not.toHaveBeenCalled();
  });

  it('should ignore message after unsubscription', () => {
    const callback = jest.fn();
    const payload = 'hello world';
    pubSub.subscribe(CHANNEL_FOO, callback);
    pubSub.unsubscribeAll(CHANNEL_FOO);
    const redisCallback = subClient.on.mock.calls[0][1];
    redisCallback(CHANNEL_FOO, JSON.stringify(payload));
    expect(callback).not.toHaveBeenCalled();
  });
});
