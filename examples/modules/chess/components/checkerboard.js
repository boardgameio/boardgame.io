/*
 * Copyright 2018 The boardgame.io Authors.
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import PropTypes from 'prop-types';

/**
 * Checkerboard
 *
 * Component that will show a configurable checker board for games like
 * chess, checkers and others. The vertical columns of squares are labeled
 * with letters from a to z, while the rows are labeled with numbers, starting
 * with 1.
 *
 * Props:
 *   rows    - How many rows to show up, 8 by default.
 *   cols    - How many columns to show up, 8 by default. Maximum is 26.
 *   onClick - On Click Callback, (row, col) of the square passed as argument.
 *   primaryColor - Primary color, #d18b47 by default.
 *   secondaryColor - Secondary color, #ffce9e by default.
 *   colorMap - Object of object having cell names as key and colors as values.
 *   Ex: { 'c5': 'red' } colors cells c5 with red.
 *
 * Usage:
 *
 * <Checkerboard>
 *   <Token square={'c5'}>
 *     <Knight color='dark' />
 *   </Token>
 * </Checkerboard>
 */
class Checkerboard extends React.Component {
  static propTypes = {
    rows: PropTypes.number,
    cols: PropTypes.number,
    onClick: PropTypes.func,
    primaryColor: PropTypes.string,
    secondaryColor: PropTypes.string,
    colorMap: PropTypes.object,
    style: PropTypes.object,
    children: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.element),
        PropTypes.element
    ]),
  };

  static defaultProps = {
    rows: 8,
    cols: 8,
    onClick: () => {},
    primaryColor: '#d18b47',
    secondaryColor: '#ffce9e',
    colorMap: {},
    style: {}
  };

  render() {
    // Children
    const childrenWithExtraProp = React.Children.map(this.props.children,
      child => {
        return React.cloneElement(child, {
          _coordinateFn: this.algebraicCord.bind(this)
        });
      }
    );
    return (<svg viewBox={'0 0 ' + this.props.cols + ' ' + this.props.rows}
                 style={this.props.style}>
              <g>{this._getSquares()}</g>
              {childrenWithExtraProp}
            </svg>);
  }

  algebraicCord(props) {
    return this._algebraicToCartesian(props.square);
  }

  _algebraicToCartesian(square) {
    let regexp = /([A-Za-z])([0-9]+)/g;
    let match = regexp.exec(square);
    if (match == null) {
      throw 'Invalid square provided: ' + square;
    }
    let colSymbol = match[1].toLowerCase();
    let col = colSymbol.charCodeAt(0) - 'a'.charCodeAt(0);
    let row = parseInt(match[2]);
    return { x: col, y: this.props.rows - row };
  }

  _cartesianToAlgebraic(x, y) {
    let colSymbol = String.fromCharCode(x + 'a'.charCodeAt(0));
    return colSymbol + (this.props.rows  - y);
  }

  _getSquares() {
    let squares = [];
    for (let x = 0; x < this.props.cols; x++) {
      for (let y = 0; y < this.props.rows; y++) {
        squares.push((<rect
          style={{fill: this._getCellColor(x, y)}}
          width="1"
          height="1"
          x={x}
          y={y}
          key={this.props.cols * y + x}
          onClick={this._onClick(x, y)}/>));
      }
    }
    return squares;
  }

  _onClick(x, y) {
    return () => {
      this.props.onClick({ square: this._cartesianToAlgebraic(x, y) })
    };
  }

  _getCellColor(x, y) {
    let color = this.props.secondaryColor;
    if ((x + y) % 2 == 0) {
      color = this.props.primaryColor;
    }
    let algebraic = this._cartesianToAlgebraic(x, y);
    if (algebraic in this.props.colorMap) {
      color = this.props.colorMap[algebraic];
    }
    return color;
  }
}

export default Checkerboard;
