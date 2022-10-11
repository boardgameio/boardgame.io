function militia({ G, events }) {
  events.setActivePlayers({ others: 'discard', minMoves: 1, maxMoves: 1 });
}

function discard({ G, ctx }) {}

const game = {
  moves: { militia },
  turn: {
    stages: {
      discard: {
        moves: { discard },
      },
    },
  },
};

export default game;
