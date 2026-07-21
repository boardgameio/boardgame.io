import type { Game, Plugin } from 'boardgame.io';
import { Server } from 'boardgame.io/server';

interface CustomPluginAPIs extends Record<string, unknown> {
  custom: { enabled: boolean };
}

const customPlugin: Plugin<CustomPluginAPIs['custom']> = {
  name: 'custom',
  api: () => ({ enabled: true }),
};

const customGame: Game<{ enabled: boolean }, CustomPluginAPIs> = {
  name: 'custom-plugin-game',
  plugins: [customPlugin],
  setup: ({ custom }) => ({ enabled: custom.enabled }),
};

Server({
  games: [customGame, { name: 'standard-game' }],
});
