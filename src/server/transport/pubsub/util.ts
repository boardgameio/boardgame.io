import type { PubSubChannelId } from './generic-pub-sub';

export function globalChannelId(channelId: PubSubChannelId): string {
  return `${channelId.namespace}-${channelId.value}`;
}
