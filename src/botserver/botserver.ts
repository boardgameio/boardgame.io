import type { GenericPubSub } from '../server/transport/pubsub/generic-pub-sub';
import type { Game } from '../types';
import type { BotCallback } from './manager';
import { BotManager } from './manager';
export interface BotCreationRequest {
  gameName: string;
  matchID: string;
  botOptsList: { playerID: string; playerCredentials: string }[];
}

interface BotServerConfig {
  games: Game[];
  runBot: BotCallback;
  masterServerHost: string;
  pubSub: GenericPubSub<BotCreationRequest>;
}

function validateConfig(config: BotServerConfig): BotServerConfig {
  if (!config) {
    throw new Error('BotServer config required');
  }

  const { games, runBot, masterServerHost, pubSub } = config;

  if (!games?.length) {
    throw new Error('At least one game required');
  }

  if (!runBot || typeof runBot !== 'function') {
    throw new Error('runBot callback function required');
  }

  if (!masterServerHost) {
    throw new Error('masterServerHost string required');
  }

  if (!pubSub) {
    throw new Error('pubSub required');
  }

  return config;
}

export const BOT_SERVER_CHANNEL = 'botServer';

export function runBotServer(botServerConfig: BotServerConfig): void {
  const { games, runBot, masterServerHost, pubSub } =
    validateConfig(botServerConfig);
  const manager = new BotManager(games, runBot, masterServerHost);
  pubSub.subscribe(BOT_SERVER_CHANNEL, manager.addBotsToGame);
}
