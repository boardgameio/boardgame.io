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

const ChatPlugin = {
  name: 'chat',
  setup: () => ({ messages: [] }),
  api: ({ data, playerID }) => ({
    get: () => data.messages,
    send: content => {
      data.messages = [...data.messages, { playerID, content }];
    },
  }),
  flush: ({ api }) => {
    return { messages: api.get() };
  },
};

const TicTacToe = {
  setup: () => ({ cells: Array(9).fill(null) }),

  plugins: [ChatPlugin],

  moves: {
    clickCell(G, ctx, id) {
      debugger;
      ctx.chat.send('hello');
      const cells = [...G.cells];

      if (cells[id] === null) {
        cells[id] = ctx.currentPlayer;
      }

      return { ...G, cells };
    },
  },

  turn: { moveLimit: 1 },

  endIf: (G, ctx) => {
    if (IsVictory(G.cells)) {
      return { winner: ctx.currentPlayer };
    }
    if (G.cells.filter(c => c === null).length == 0) {
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
          <td style={cellStyle} key={id} onClick={() => this.onClick(id)}>
            {this.props.G.cells[id]}
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
        <pre>{JSON.stringify(this.props.plugins.chat, null, 2)}</pre>
        <button
          onClick={() => {
            this.props.client.plugins.chat();
          }}
        >
          Send
        </button>
      </div>
    );
  }
}

var TicTacToeClient = Client({
  board: TicTacToeBoard,
  game: TicTacToe,
  debug: true,
  multiplayer: Local(),
});

const App = () => (
  <div>
    <div style={{ float: 'left' }}>
      Player 0
      <TicTacToeClient playerID="0" />
    </div>

    <div style={{ float: 'right' }}>
      Player 1
      <TicTacToeClient playerID="1" />
    </div>
  </div>
);

ReactDOM.render(<App />, document.getElementById('app'));
