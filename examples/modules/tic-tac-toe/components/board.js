/*
 * Copyright 2017 The boardgame.io Authors.
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import PropTypes from 'prop-types';
import './board.css';

class Board extends React.Component {
  static propTypes = {
    G:        PropTypes.any.isRequired,
    ctx:      PropTypes.any.isRequired,
    endTurn:  PropTypes.func.isRequired,
    moves:    PropTypes.any.isRequired,
    playerID:   PropTypes.string,
    isActive:   PropTypes.bool
  }

  onClick = (id) => {
    if (this.isActive(id)) {
      this.props.moves.clickCell(id);
      this.props.endTurn();
    }
  }

  isActive(id) {
    if (!this.props.isActive) {
      return false;
    }
    if (this.props.ctx.winner !== null) return false;
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

    let winner = null;
    if (this.props.ctx.winner !== null) {
      winner = <div id='winner'>Winner: {this.props.ctx.winner}</div>;
    }

    let player = null;
    if (this.props.playerID !== null) {
      player = <div id='winner'>Player: {this.props.playerID}</div>;
    }

    return (
      <div>
        <table id="board">
        <tbody>{tbody}</tbody>
        </table>
        {player}
        {winner}
      </div>
    );
  }
}

export default Board;
