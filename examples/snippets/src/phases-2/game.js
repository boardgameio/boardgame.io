function DrawCard(G, ctx) {
  G.deck--;
  G.hand[ctx.currentPlayer]++;
}

function PlayCard(G, ctx) {
  G.deck++;
  G.hand[ctx.currentPlayer]--;
}

const game = {
  setup: ctx => ({ deck: 6, hand: Array(ctx.numPlayers).fill(0) }),
  phases: {
    draw: {
      moves: { DrawCard },
      endIf: G => G.deck <= 0,
      next: 'play',
      start: true,
    },

    play: {
      moves: { PlayCard },
      endIf: G => G.deck >= 6,
    },
  },
  turn: { moveLimit: 1 },
};

export default game;
