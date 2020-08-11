import React from 'react';
import ReactDOM from 'react-dom';
import { Client } from 'boardgame.io/react';
import { Debug } from 'boardgame.io/debug';

function IsVictory(cells) {
  const positions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  const isRowComplete = row => {
    const symbols = row.map(i => cells[i]);
    return symbols.every(i => i !== null && i === symbols[0]);
  };

  return positions.map(isRowComplete).some(i => i === true);
}

const TicTacToe = {
  setup: () => ({ cells: Array(9).fill(null) }),

  moves: {
    clickCell(G, ctx, id) {
      if (G.cells[id] === null) {
        G.cells[id] = ctx.currentPlayer;
      }
    },
  },

  endIf: (G, ctx) => {
    if (IsVictory(G.cells)) {
      return { winner: ctx.currentPlayer };
    }
    if (G.cells.filter(c => c === null).length == 0) {
      return { draw: true };
    }
  },
};

const TicTacToeBoard = ({ G, ctx, moves, events, ...props }) => {
  const onClick = React.useCallback(
    id => {
      if (isActive(id)) {
        moves.clickCell(id);
        events.endTurn();
      }
    },
    [moves, events]
  );

  const isActive = id => props.isActive && G.cells[id] == null;

  let winner = '';
  if (ctx.gameover) {
    winner =
      ctx.gameover.winner !== undefined ? (
        <div id="winner">Winner: {ctx.gameover.winner}</div>
      ) : (
        <div id="winner">Draw!</div>
      );
  }

  const cellStyle = {
    cursor: 'pointer',
    border: '1px solid #555',
    width: '50px',
    height: '50px',
    lineHeight: '50px',
    textAlign: 'center',
    fontFamily: 'monospace',
    fontSize: '20px',
    fontWeight: 'bold',
  };

  let tbody = [];
  for (let i = 0; i < 3; i++) {
    let cells = [];
    for (let j = 0; j < 3; j++) {
      const id = 3 * i + j;
      cells.push(
        <td style={cellStyle} key={id} onClick={() => onClick(id)}>
          {G.cells[id]}
        </td>
      );
    }
    tbody.push(<tr key={i}>{cells}</tr>);
  }

  return (
    <div>
      <table id="board">
        <tbody>{tbody}</tbody>
      </table>
      {winner}
    </div>
  );
};

var App = Client({
  board: TicTacToeBoard,
  game: TicTacToe,
  debug: { impl: Debug },
});

ReactDOM.render(<App />, document.getElementById('app'));
