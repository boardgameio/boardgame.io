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
import Checkerboard from './checkerboard3d';
import { Token } from 'boardgame.io/ui';
import bishopObj from './pieces/bishop3d.obj';
import kingObj from './pieces/king3d.obj';
import knightObj from './pieces/knight3d.obj';
import pawnObj from './pieces/pawn3d.obj';
import queenObj from './pieces/queen3d.obj';
import rookObj from './pieces/rook3d.obj';
let THREE = (window.THREE = require('three'));

const COL_NAMES = 'abcdefgh';
const SELECTED_COLOR = 'green';
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
  };

  constructor(props) {
    super(props);
    this.chess = new Chess();
    this.loader = new THREE.OBJLoader();
    // loading 3d objects
    this.loader.load(bishopObj, out => this._handleMesh(out, 'bishop'));
    this.loader.load(kingObj, out => this._handleMesh(out, 'king'));
    this.loader.load(knightObj, out => this._handleMesh(out, 'knight'));
    this.loader.load(pawnObj, out => this._handleMesh(out, 'pawn'));
    this.loader.load(queenObj, out => this._handleMesh(out, 'queen'));
    this.loader.load(rookObj, out => this._handleMesh(out, 'rook'));
  }

  _handleMesh = (out, type) => {
    out = out.children[0];
    let temp = {};
    temp[type] = out;
    this.setState(temp);
  };

  state = {
    selected: '',
    mesh: {},
  };

  // eslint-disable-next-line react/no-deprecated
  componentWillReceiveProps(nextProps) {
    if (nextProps.G.pgn) {
      this.chess.load_pgn(nextProps.G.pgn);
      this.setState({ selected: '' });
    }
  }

  render() {
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
      </div>
    );
  }

  click = ({ square }) => {
    if (!this.props.isActive) {
      return;
    }

    if (!this.state.selected && this._isSelectable(square)) {
      this.setState({ selected: square });
    } else if (this.state.selected) {
      let moves = this._getMoves();
      let move = moves.find(
        move => move.from == this.state.selected && move.to == square
      );
      if (move) {
        this.props.moves.move(move.san);
      } else {
        this.setState({ selected: '' });
      }
    }
  };

  _getHighlightedSquares() {
    let result = {};
    if (this.state.selected) {
      result[this.state.selected] = SELECTED_COLOR;
    }
    for (let move of this._getMoves()) {
      result[move.to] = MOVABLE_COLOR;
    }
    return result;
  }

  _getPieces() {
    let result = [];
    for (let y = 1; y <= 8; y++) {
      for (let x = 0; x < 8; x++) {
        let square = COL_NAMES[x] + y;
        let p = this.chess.get(square);
        if (p) {
          result.push(
            <Token
              three={true}
              square={square}
              animate={true}
              key={this._getInitialCell(square)}
              onClick={this.click.bind(this)}
              mesh={this._getPieceByTypeAndColor(p.type, p.color)}
            />
          );
        }
      }
    }
    return result;
  }

  _getPieceByTypeAndColor(type, color) {
    let piece;
    let mesh;
    switch (type) {
      case 'b':
        piece = 'bishop';
        break;
      case 'k':
        piece = 'king';
        break;
      case 'n':
        piece = 'knight';
        break;
      case 'p':
        piece = 'pawn';
        break;
      case 'q':
        piece = 'queen';
        break;
      case 'r':
        piece = 'rook';
        break;
    }
    mesh = this.state[piece];
    if (mesh) {
      let ret = mesh.clone();
      let blackMat = new THREE.MeshLambertMaterial({ color: 0x333333 });
      let whiteMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
      if (color == 'b') ret.material = blackMat;
      else ret.material = whiteMat;
      return ret;
    } else return null;
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
}

export default Board;
