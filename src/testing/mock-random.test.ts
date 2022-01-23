import { Client } from '../client/client';
import type { Game } from '../types';
import { MockRandom } from './mock-random';

test('it creates a plugin object', () => {
  const plugin = MockRandom();
  expect(plugin).toEqual({
    name: 'random',
    noClient: expect.any(Function),
    api: expect.any(Function),
    setup: expect.any(Function),
    playerView: expect.any(Function),
  });
});

test('it can override random API methods', () => {
  const game: Game<{ roll: number }> = {
    moves: {
      roll: (G, ctx) => {
        G.roll = ctx.random.D6();
      },
    },
    plugins: [MockRandom({ D6: () => 1 })],
  };

  const client = Client({ game });
  client.moves.roll();
  expect(client.getState().G.roll).toBe(1);
});

test('it can use non-overridden API methods', () => {
  const game: Game<{ roll: number }> = {
    moves: {
      roll: (G, ctx) => {
        G.roll = ctx.random.D6();
      },
    },
    plugins: [MockRandom({ D10: () => 1 })],
    seed: 0,
  };

  const client = Client({ game });
  client.moves.roll();
  expect(client.getState().G.roll).toMatchInlineSnapshot(`4`);
});
