/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import PropTypes from 'prop-types';

/**
 * Grid
 *
 * Component that will show children on cartesian plane using X and Y
 * coordinates.
 *
 * Props:
 *   rows       - Number of rows (height) of the grid.
 *   cols       - Number of columns (width) of the grid.
 *   style      - CSS style of the Grid HTML element.
 *   colorMap   - A map from 'x,y' => color.
 *   onClick    - (x, y) => {}
 *                Called when a square is clicked.
 *
 * Usage:
 *
 * <Grid rows={8} cols={8}>
 *   <Token x={1} y={2}>
 *     <Knight color='dark' />
 *   </Token>
 * </Grid>
 *
 * or
 *
 * <Grid rows={1} cols={1} style={{width: '500px'}}>
 *   <Knight color='dark' />
 * </Grid>
 */
class Grid extends React.Component {
  static propTypes = {
    rows: PropTypes.number.isRequired,
    cols: PropTypes.number.isRequired,
    style: PropTypes.object,
    colorMap: PropTypes.object,
    onClick: PropTypes.func,
    children: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.element),
      PropTypes.element,
    ]),
  };

  static defaultProps = {
    colorMap: {},
  };

  cartesianCord = props => {
    return { x: props.x, y: props.y };
  };

  _getCellColor(x, y) {
    const key = `${x},${y}`;
    let color = 'white';
    if (key in this.props.colorMap) {
      color = this.props.colorMap[key];
    }
    return color;
  }

  _getSquares() {
    let squares = [];
    for (let x = 0; x < this.props.cols; x++) {
      for (let y = 0; y < this.props.rows; y++) {
        squares.push(
          <rect
            style={{ fill: this._getCellColor(x, y) }}
            width="1"
            height="1"
            x={x}
            y={y}
            key={this.props.cols * y + x}
            onClick={() => this.props.onClick(x, y)}
          />
        );
      }
    }
    return squares;
  }

  render() {
    const tokens = React.Children.map(this.props.children, child => {
      return React.cloneElement(child, {
        _coordinateFn: this.cartesianCord,
      });
    });

    return (
      <svg
        viewBox={'0 0 ' + this.props.cols + ' ' + this.props.rows}
        style={this.props.style}
      >
        <g>{this._getSquares()}</g>
        {tokens}
      </svg>
    );
  }
}

export default Grid;
