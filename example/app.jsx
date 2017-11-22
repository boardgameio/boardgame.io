/*
 * Copyright 2017 Google Inc.
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { render } from 'react-dom';
import Client from '../packages/client';
import { TicTacToe } from './game';
import './app.css';

class TicTacToeBoard extends React.Component {
  static propTypes = {
    G:        PropTypes.any.isRequired,
    ctx:      PropTypes.any.isRequired,
    endTurn:  PropTypes.func.isRequired,
    moves:    PropTypes.any.isRequired,
  }

  onClick = (id) => {
    if (this.isActive(id)) {
      this.props.moves.clickCell(id);
      this.props.endTurn();
    }
  }

  isActive(id) {
    if (this.props.G.winner != null) return false;
    if (this.props.G.cells[id] !== null) return false;
    return true;
  }

  render() {
    let tbody = [];
    for (let i = 0; i < 3; i++) {
      let cells = [];
      for (let j = 0; j < 3; j++) {
        const id = 3 * i + j;
        cells.push(
          <td key={id}
              className={this.isActive(id) ? 'active' : ''}
              onClick={() => this.onClick(id)}>
            {this.props.G.cells[id]}
          </td>
        );
      }
      tbody.push(<tr key={i}>{cells}</tr>);
    }

    let winner = '';
    if (this.props.G.winner !== null) {
      winner = <div id='winner'>Winner: {this.props.G.winner}</div>;
    }

    return (
      <div>
        <table id="board">
        <tbody>{tbody}</tbody>
        </table>
        {winner}
      </div>
    );
  }
}

export const App = Client({
  game: TicTacToe,
  board: TicTacToeBoard,
  multiplayer: true,
});

render(<App/>, document.getElementById('app') ||
               document.createElement('div'));

if (module.hot) {
  module.hot.accept();
}
