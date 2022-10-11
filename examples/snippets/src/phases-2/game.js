function DrawCard({ G, playerID }) {
  G.deck--;
  G.hand[playerID]++;
}

function PlayCard({ G, playerID }) {
  G.deck++;
  G.hand[playerID]--;
}

const game = {
  setup: ({ ctx }) => ({ deck: 6, hand: Array(ctx.numPlayers).fill(0) }),
  phases: {
    draw: {
      moves: { DrawCard },
      endIf: ({ G }) => G.deck <= 0,
      next: 'play',
      start: true,
    },

    play: {
      moves: { PlayCard },
      endIf: ({ G }) => G.deck >= 6,
    },
  },
  turn: { minMoves: 1, maxMoves: 1 },
};

export default game;
