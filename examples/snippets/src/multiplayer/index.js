import React from 'react';
import ReactDOM from 'react-dom';
import { Client } from 'boardgame.io/react';
import { Local } from 'boardgame.io/multiplayer';

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

  for (let pos of positions) {
    const symbol = cells[pos[0]];
    let winner = symbol;
    for (let i of pos) {
      if (cells[i] != symbol) {
        winner = null;
        break;
      }
    }
    if (winner != null) return true;
  }

  return false;
}

const TicTacToe = {
  setup: () => ({ cells: Array(9).fill(null) }),

  moves: {
    clickCell(G, ctx, id) {
      const cells = [...G.cells];

      if (cells[id] === null) {
        cells[id] = ctx.currentPlayer;
      }

      return { ...G, cells };
    },
  },

  turn: { minMoves: 1, maxMoves: 1 },

  endIf: (G, ctx) => {
    if (IsVictory(G.cells)) {
      return { winner: ctx.currentPlayer };
    }
    if (G.cells.filter((c) => c === null).length == 0) {
      return { draw: true };
    }
  },
};

function TicTacToeBoard({ G, ctx, moves, isActive, playerID }) {
  const canClickCell = (id) => isActive && G.cells[id] == null;

  const onClick = (id) => {
    if (canClickCell(id)) {
      moves.clickCell(id);
    }
  };

  let winner = '';
  if (ctx.gameover) {
    winner =
      ctx.gameover.winner !== undefined ? (
        <div id="winner">Winner: {ctx.gameover.winner}</div>
      ) : (
        <div id="winner">Draw!</div>
      );
  }

  const cellStyle = (active) => ({
    border: '1px solid #555',
    width: '3.125rem',
    height: '3.125rem',
    lineHeight: '3.125rem',
    textAlign: 'center',
    fontFamily: 'monospace',
    fontSize: '1.25rem',
    fontWeight: 'bold',
    background: active ? '#eeffe9' : 'transparent',
    padding: '0',
    boxSizing: 'border-box',
  });

  let tbody = [];
  for (let i = 0; i < 3; i++) {
    let cells = [];
    for (let j = 0; j < 3; j++) {
      const id = 3 * i + j;
      cells.push(
        <td key={id}>
          {canClickCell(id) ? (
            <button style={cellStyle(true)} onClick={() => onClick(id)} />
          ) : (
            <div style={cellStyle(false)}>{G.cells[id]}</div>
          )}
        </td>
      );
    }
    tbody.push(<tr key={i}>{cells}</tr>);
  }

  return (
    <div>
      <p
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
        }}
      >
        <span>Player {playerID}</span>
        {isActive && <span>Your turn!</span>}
      </p>
      <table id="board">
        <tbody>{tbody}</tbody>
      </table>
      <p>{winner}</p>
    </div>
  );
}

var TicTacToeClient = Client({
  board: TicTacToeBoard,
  game: TicTacToe,
  debug: false,
  multiplayer: Local(),
});

const App = () => (
  <div
    style={{ display: 'flex', justifyContent: 'space-around', gap: '1.25rem' }}
  >
    <TicTacToeClient playerID="0" />
    <TicTacToeClient playerID="1" />
  </div>
);

ReactDOM.render(<App />, document.getElementById('app'));
