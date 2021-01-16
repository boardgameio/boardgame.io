/*
 * Copyright 2018 The boardgame.io Authors.
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Chess } from 'chess.js';
import { Checkerboard, cartesianToAlgebraic } from './checkerboard';
import { Token } from './token';
import Chat from './chat';
import Bishop from './pieces/bishop';
import King from './pieces/king';
import Knight from './pieces/knight';
import Pawn from './pieces/pawn';
import Queen from './pieces/queen';
import Rook from './pieces/rook';

const COL_NAMES = 'abcdefgh';
const HIGHLIGHTED_COLOR = 'green';
const MOVABLE_COLOR = 'palegreen';

class Board extends React.Component {
  static propTypes = {
    G: PropTypes.any.isRequired,
    ctx: PropTypes.any.isRequired,
    moves: PropTypes.any.isRequired,
    playerID: PropTypes.string,
    isActive: PropTypes.bool,
    isMultiplayer: PropTypes.bool,
    isConnected: PropTypes.bool,
    sendChatMessage: PropTypes.func,
    chatMessages: PropTypes.array,
  };

  constructor(props) {
    super(props);
    this.chess = new Chess();
  }

  state = {
    selected: '',
    highlighted: '',
    dragged: '',
  };

  render() {
    if (this.props.G.pgn !== undefined) {
      this.chess.load_pgn(this.props.G.pgn);
    }
    let disconnected = null;
    if (this.props.isMultiplayer && !this.props.isConnected) {
      disconnected = <p>Disconnected!</p>;
    }
    return (
      <div>
        <Checkerboard
          highlightedSquares={this._getHighlightedSquares()}
          style={{ width: '400px' }}
          onClick={this.click}
        >
          {this._getPieces()}
        </Checkerboard>

        {this._getStatus()}
        {disconnected}
        {this.props.isMultiplayer && this.props.playerID !== null && (
          <Chat
            onSend={this.props.sendChatMessage}
            messages={this.props.chatMessages}
          />
        )}
      </div>
    );
  }

  click = ({ square }) => {
    if (!this.props.isActive) {
      return;
    }

    if (!this.state.selected && this._isSelectable(square)) {
      this.setState({ ...this.state, selected: square, highlighted: square });
    } else if (this.state.selected) {
      this._tryMove(this.state.selected, square);
    }
  };

  _getHighlightedSquares() {
    let result = {};
    for (let move of this._getMoves()) {
      result[move.to] = MOVABLE_COLOR;
    }
    if (this.state.highlighted) {
      result[this.state.highlighted] = HIGHLIGHTED_COLOR;
    }
    return result;
  }

  _shouldDrag = ({ x, y }) => {
    const square = cartesianToAlgebraic(x, y);
    const result = this.props.isActive && this._isSelectable(square);
    if (result) {
      this.setState({
        ...this.state,
        dragged: this._getInitialCell(square),
      });
      return true;
    }
  };

  _onDrag = ({ x, y, originalX, originalY }) => {
    if (Math.sqrt((x - originalX) ** 2 + (y - originalY) ** 2) > 0.2) {
      this.setState({
        ...this.state,
        selected: this._getSquare(originalX, originalY),
        highlighted: this._getSquare(x, y),
      });
    } else {
      this.setState({
        ...this.state,
        selected: '',
        highlighted: '',
      });
    }
  };

  _onDrop = ({ x, y }) => {
    if (this.state.selected) {
      this.setState({ ...this.state, dragged: '' });
      this._tryMove(this.state.selected, this._getSquare(x, y));
    }
  };

  _getSquare(x, y) {
    return cartesianToAlgebraic(this._getInRange(x), this._getInRange(y));
  }

  _getInRange(x) {
    return Math.max(Math.min(Math.round(x), 7), 0);
  }

  _getPieces() {
    let dragged = [];
    let result = [];
    for (let y = 1; y <= 8; y++) {
      for (let x = 0; x < 8; x++) {
        let square = COL_NAMES[x] + y;
        let piece = this.chess.get(square);
        if (piece) {
          const token = (
            <Token
              draggable={true}
              shouldDrag={this._shouldDrag}
              onDrag={this._onDrag}
              onDrop={this._onDrop}
              square={square}
              animate={true}
              key={this._getInitialCell(square)}
            >
              {this._getPieceByTypeAndColor(piece.type, piece.color)}
            </Token>
          );
          if (square === this.state.dragged) {
            result.push(token);
          } else {
            dragged.push(token);
          }
        }
      }
    }
    return dragged.concat(result);
  }

  _getPieceByTypeAndColor(type, color) {
    switch (type) {
      case 'b':
        return <Bishop color={color} />;
      case 'k':
        return <King color={color} />;
      case 'n':
        return <Knight color={color} />;
      case 'p':
        return <Pawn color={color} />;
      case 'q':
        return <Queen color={color} />;
      case 'r':
        return <Rook color={color} />;
    }
  }

  _getStatus() {
    let message = null;
    if (this.chess.in_check()) {
      message = 'CHECK';
    }
    if (this.props.ctx.winner) {
      switch (this.props.ctx.winner) {
        case 'b':
          message = 'Black won!';
          break;
        case 'w':
          message = 'White won!';
          break;
        case 'd':
          message = 'Draw!';
          break;
      }
    }
    if (message) {
      return (
        <p>
          <strong>{message}</strong>
        </p>
      );
    }
  }

  _getInitialCell(square) {
    let history = this.chess.history({ verbose: true });
    let lastSeen = square;
    for (let i = history.length - 1; i >= 0; i--) {
      let move = history[i];
      if (lastSeen == move.to) {
        lastSeen = move.from;
      }
    }
    return lastSeen;
  }

  _isSelectable(square) {
    let piece = this.chess.get(square);
    return (
      piece &&
      piece.color === this._getCurrentPlayer() &&
      this.chess.moves({ square }).length > 0
    );
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
      square: this.state.selected,
    });
  }

  _tryMove(from, to) {
    const moves = this._getMoves();
    const move = moves.find((move) => move.from == from && move.to == to);
    if (move) {
      this.props.moves.move(move.san);
    }
    this.setState({ ...this.state, selected: '', highlighted: '' });
  }
}

export default Board;
