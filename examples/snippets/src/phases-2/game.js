function DrawCard(G, ctx) {
  G.deck--;
  G.hand[ctx.currentPlayer]++;
}

function PlayCard(G, ctx) {
  G.deck++;
  G.hand[ctx.currentPlayer]--;
}

const game = {
  name: 'phases',
  setup: ctx => ({ deck: 6, hand: Array(ctx.numPlayers).fill(0) }),
  phases: {
    draw: {
      moves: { DrawCard },
      endIf: G => G.deck <= 0,
      start: true,
      next: 'play',
    },
    play: {
      moves: { PlayCard },
    },
  },
  turn: { moveLimit: 1 },
};

export default {
  game,
  debug: false,
  numPlayers: 3,
  multiplayer: { local: true },
};
