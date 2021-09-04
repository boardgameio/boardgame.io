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
    clickCell({ G, playerID }, id) {
      const cells = [...G.cells];

      if (cells[id] === null) {
        cells[id] = playerID;
      }

      return { ...G, cells };
    },
  },

  turn: { minMoves: 1, maxMoves: 1 },

  endIf: ({ G, ctx }) => {
    if (IsVictory(G.cells)) {
      return { winner: ctx.currentPlayer };
    }
    if (G.cells.filter((c) => c === null).length == 0) {
      return { draw: true };
    }
  },
};

class TicTacToeBoard extends React.Component {
  onClick(id) {
    if (this.isActive(id)) {
      this.props.moves.clickCell(id);
      this.props.events.endTurn();
    }
  }

  isActive(id) {
    return this.props.isActive && this.props.G.cells[id] == null;
  }

  render() {
    let winner = '';
    if (this.props.ctx.gameover) {
      winner =
        this.props.ctx.gameover.winner !== undefined ? (
          <div id="winner">Winner: {this.props.ctx.gameover.winner}</div>
        ) : (
          <div id="winner">Draw!</div>
        );
    }

    const cellStyle = (id) => ({
      cursor: 'pointer',
      border: '1px solid #555',
      width: '3.125rem',
      height: '3.125rem',
      lineHeight: '3.125rem',
      textAlign: 'center',
      fontFamily: 'monospace',
      fontSize: '1.25rem',
      fontWeight: 'bold',
      background: this.isActive(id) ? '#eeffe9' : 'transparent',
    });

    let tbody = [];
    for (let i = 0; i < 3; i++) {
      let cells = [];
      for (let j = 0; j < 3; j++) {
        const id = 3 * i + j;
        cells.push(
          <td style={cellStyle(id)} key={id} onClick={() => this.onClick(id)}>
            {this.props.G.cells[id]}
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
          <span>Player {this.props.playerID}</span>
          {this.props.isActive && <span>Your turn!</span>}
        </p>
        <table id="board">
          <tbody>{tbody}</tbody>
        </table>
        <p>{winner}</p>
      </div>
    );
  }
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
