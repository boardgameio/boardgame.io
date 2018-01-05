/*
 * Copyright 2018 The boardgame.io Authors.
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import PropTypes from 'prop-types';
import Chess from 'chess.js';
import Grid from '../../../../src/ui/grid';
import Token from '../../../../src/ui/token';
import Checkerboard from './checkerboard';
import Bishop from './pieces/bishop';
import King from './pieces/king';
import Knight from './pieces/knight';
import Pawn from './pieces/pawn';
import Queen from './pieces/queen';
import Rook from './pieces/rook';

const COL_NAMES = 'abcdefgh';

class Board extends React.Component {
  static propTypes = {
    G:        PropTypes.any.isRequired,
    ctx:      PropTypes.any.isRequired,
    endTurn:  PropTypes.func.isRequired,
    moves:    PropTypes.any.isRequired,
    playerID:   PropTypes.string,
    isActive:   PropTypes.bool
  }

  constructor(props) {
    super(props);
    this.chess = new Chess();
  }

  state = {
    selected: ''
  }

  componentWillReceiveProps(nextProps) {
    this.chess.load_pgn(nextProps.G.pgn);
    this.setState({ selected: '' });
  }

  render() {
    let movable = this._getMoves().map((move) => move.to);
    return (<div>
      <Grid rows={8} cols={8} style={{width: '400px'}}>
        <Checkerboard movable={movable}
                      selected={this.state.selected}
                      onClick={this.click.bind(this)} />
        {this._getPieces()}
      </Grid>
      {this._getStatus()}
    </div>
    );
  }

  click(cellCode) {
    return () => {
      if (!this.state.selected && this._isSelectable(cellCode)) {
        this.setState({ selected: cellCode });
      }

      if (this.state.selected) {
        let moves = this._getMoves();
        let move = moves.find((move) => (move.from == this.state.selected &&
                                         move.to == cellCode));
        if (move) {
          this.props.moves.move(move.san);
          this.props.endTurn();
        } else {
          this.setState({ selected: '' });
        }
      }
    }
  }

  _getPieces() {
    let result = [];
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        let cellCode = COL_NAMES[x] + (8 - y);
        let p = this.chess.get(cellCode);
        if (p) {
          result.push((
            <Token y={y} x={x} animate={true}
                   key={this._getInitialCell(cellCode)}
                   onClick={this.click(cellCode).bind(this)}>
              {this._getPieceByTypeAndColor(p.type, p.color)}
            </Token>));
        }
      }
    }
    return result;
  }

  _getPieceByTypeAndColor(type, color) {
    switch (type) {
      case 'b': return <Bishop color={color} />;
      case 'k': return <King color={color} />;
      case 'n': return <Knight color={color} />;
      case 'p': return <Pawn color={color} />;
      case 'q': return <Queen color={color} />;
      case 'r': return <Rook color={color} />;
    }
  }

  _getStatus() {
    let message = null;
    if (this.chess.in_check()) {
      message = 'CHECK';
    }
    if (this.props.ctx.winner) {
      switch (this.props.ctx.winner) {
        case 'b': message = 'Black won!'; break;
        case 'w': message = 'White won!'; break;
        case 'd': message = 'Draw!'; break;
      }
    }
    if (message) {
      return (<p><strong>{message}</strong></p>);
    }
  }

  _getInitialCell(cellCode) {
    let history = this.chess.history({ verbose: true });
    let lastSeen = cellCode;
    for (let i = history.length - 1; i >= 0; i--) {
      let move = history[i];
      if (lastSeen == move.to) {
        lastSeen = move.from;
      }
    }
    return lastSeen;
  }

  _isSelectable(cellCode) {
    let piece = this.chess.get(cellCode);
    return (piece && piece.color === this._getCurrentPlayer() &&
            this.chess.moves({ square: cellCode }).length > 0);
  }

  _getCurrentPlayer() {
    if (this.props.ctx.currentPlayer == 0) {
      return 'w';
    } else {
      return 'b';
    }
  }

  _getMoves() {
    if (!this.state.selected) {
      return [];
    }
    return this.chess.moves({
      verbose: true,
      square: this.state.selected
    });
  }
}

export default Board;
