import React from 'react';
import ReactDOM from 'react-dom';
import { Client } from 'boardgame.io/react';

var TicTacToe = {
  setup: () => ({ cells: Array(9).fill(null) }),

  moves: {
    clickCell(G, ctx, id) {
      G.cells[id] = ctx.currentPlayer;
    },
  },
};

var App = Client({ game: TicTacToe, debug: { showGameInfo: false } });
ReactDOM.render(<App />, document.getElementById('app'));
