function militia(G, ctx) {
  ctx.events.setActivePlayers({ others: 'discard', moveLimit: 1 });
}

function discard(G, ctx) {}

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
