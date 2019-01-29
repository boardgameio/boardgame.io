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
import bishopObj from './pieces/bishop.gltf';
import './pieces/bishop.bin';
import kingObj from './pieces/king.gltf';
import './pieces/king.bin';
import knightObj from './pieces/knight.gltf';
import './pieces/knight.bin';
import pawnObj from './pieces/pawn.gltf';
import './pieces/pawn.bin';
import queenObj from './pieces/queen.gltf';
import './pieces/queen.bin';
import rookObj from './pieces/rook.gltf';
import './pieces/rook.bin';
var THREE = (window.THREE = require('../../../../../node_modules/three'));
require('../../../../../node_modules/three/examples/js/loaders/GLTFLoader');

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
    this.loader = new THREE.GLTFLoader();
  }

  _handleMesh = (out, type) => {
    out = out.scene.children[0];
    let temp = {};
    temp[type] = out;
    // get the relative size of he piece
    const bbox = new THREE.Box3().setFromObject(out);
    let meshSize = new THREE.Vector3();
    bbox.getSize(meshSize);
    temp[type].realSize = meshSize.x;
    this.setState(temp);
  };

  state = {
    selected: '',
    mesh: {},
    loading: true,
  };

  componentDidMount() {
    // loading 3d objects
    this.loader.load(bishopObj, out => this._handleMesh(out, 'bishop'));
    this.loader.load(kingObj, out => this._handleMesh(out, 'king'));
    this.loader.load(knightObj, out => this._handleMesh(out, 'knight'));
    this.loader.load(pawnObj, out => this._handleMesh(out, 'pawn'));
    this.loader.load(queenObj, out => this._handleMesh(out, 'queen'));
    this.loader.load(rookObj, out => this._handleMesh(out, 'rook'));
  }

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

  _getLargest() {
    let max = -Infinity;
    for (const p of 'bknpqr') {
      let piece = this._pieceShortToLong(p);
      max = this.state[piece].realSize > max ? this.state[piece].realSize : max;
    }
    this._maxRealSize = max;
  }

  _getSize(type) {
    // if not finished loading return null
    for (const p of 'bknpqr') {
      let piece = this._pieceShortToLong(p);
      if (!this.state[piece]) return null;
    }
    // otherwise return size ratio to max size
    let piece = this._pieceShortToLong(type);
    if (!this._maxRealSize) this._getLargest();
    return this.state[piece].realSize / this._maxRealSize;
  }

  _pieceShortToLong(type) {
    switch (type) {
      case 'b':
        return 'bishop';
      case 'k':
        return 'king';
      case 'n':
        return 'knight';
      case 'p':
        return 'pawn';
      case 'q':
        return 'queen';
      case 'r':
        return 'rook';
    }
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
              square={square}
              animate={true}
              size={this._getSize(p.type)}
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
    let piece = this._pieceShortToLong(type);
    let mesh;
    mesh = this.state[piece];
    if (mesh) {
      let ret = mesh.clone();
      let blackMat = new THREE.MeshLambertMaterial({ color: 0x555555 });
      let whiteMat = new THREE.MeshLambertMaterial({ color: 0xeeeeee });
      // rotate the piece and assign color.
      if (color == 'b') {
        if (piece == 'bishop') {
          // the bishop piece has different orientation with other pieces
          ret.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), Math.PI);
        }
        ret.traverse(obj => {
          if (obj.material) {
            obj.material = blackMat;
          }
        });
      } else {
        if (piece != 'bishop') {
          ret.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), Math.PI);
        }
        ret.traverse(obj => {
          if (obj.material) {
            obj.material = whiteMat;
          }
        });
      }
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
