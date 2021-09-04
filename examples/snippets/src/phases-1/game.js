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
  moves: { DrawCard, PlayCard },
  turn: { minMoves: 1, maxMoves: 1 },
};

export default game;
