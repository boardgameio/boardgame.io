import { Game } from './game';

export function createTypescriptTestGame() {
  return Game({
    name: 'TypeScript',
    setup: () => ({ fullValue: 1 }),
    playerView: G => ({
      playerViewedValue: G.fullValue + 1,
    }),
    moves: {
      doIt(G) {
        return G;
      },
    },
  });
}

test('that a typescript game can be created', () => {
  const game = createTypescriptTestGame();
  expect(game.name).toEqual('TypeScript');
});
