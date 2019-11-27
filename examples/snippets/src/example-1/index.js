import React from 'react';
import ReactDOM from 'react-dom';
import { Client } from 'boardgame.io/react';
import { Debug } from 'boardgame.io/debug';

var TicTacToe = {
  setup: () => ({ cells: Array(9).fill(null) }),

  moves: {
    clickCell(G, ctx, id) {
      G.cells[id] = ctx.currentPlayer;
    },
  },
};

var App = Client({ game: TicTacToe, debug: { impl: Debug } });
ReactDOM.render(<App />, document.getElementById('app'));
