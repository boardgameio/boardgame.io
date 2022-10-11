import React from 'react';
import ReactDOM from 'react-dom';
import { Client } from 'boardgame.io/react';
import { Debug } from 'boardgame.io/debug';

var TicTacToe = {
  setup: () => ({ cells: Array(9).fill(null) }),

  moves: {
    clickCell({ G, playerID }, id) {
      G.cells[id] = playerID;
    },
  },
};

var App = Client({ game: TicTacToe, debug: { impl: Debug } });
ReactDOM.render(<App />, document.getElementById('app'));
