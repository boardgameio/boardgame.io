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
 * Component that will show children on a cartesian regular grid.
 *
 * Props:
 *   rows       - Number of rows (height) of the grid.
 *   cols       - Number of columns (width) of the grid.
 *   style      - CSS style of the Grid HTML element.
 *   colorMap   - A map from 'x,y' => color.
 *   onClick    - (x, y) => {}
 *                Called when a square is clicked.
 *   onMouseOver    - (x, y) => {}
 *                Called when a square is mouse over.
 *   onMouseOut    - (x, y) => {}
 *                Called when a square is mouse out.
 *
 * Usage:
 *
 * <Grid rows={8} cols={8}>
 *   <Token x={1} y={2}/>
 * </Grid>
 */
export class Grid extends React.Component {
  static propTypes = {
    rows: PropTypes.number.isRequired,
    cols: PropTypes.number.isRequired,
    outline: PropTypes.bool,
    style: PropTypes.object,
    colorMap: PropTypes.object,
    cellSize: PropTypes.number,
    onClick: PropTypes.func,
    onMouseOver: PropTypes.func,
    onMouseOut: PropTypes.func,
    children: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.element),
      PropTypes.element,
    ]),
  };

  static defaultProps = {
    colorMap: {},
    outline: true,
    cellSize: 1,
  };

  _getCellColor(x, y) {
    const key = `${x},${y}`;
    let color = 'white';
    if (key in this.props.colorMap) {
      color = this.props.colorMap[key];
    }
    return color;
  }

  _getGrid() {
    if (!this.props.outline) {
      return null;
    }

    let squares = [];
    for (let x = 0; x < this.props.cols; x++) {
      for (let y = 0; y < this.props.rows; y++) {
        squares.push(
          <Square
            key={this.props.cols * y + x}
            style={{ fill: this._getCellColor(x, y) }}
            x={x}
            y={y}
            size={this.props.cellSize}
            onClick={this.onClick}
            onMouseOver={this.onMouseOver}
            onMouseOut={this.onMouseOut}
          />
        );
      }
    }
    return squares;
  }

  onClick = args => {
    if (this.props.onClick) {
      this.props.onClick(args);
    }
  };

  onMouseOver = args => {
    if (this.props.onMouseOver) {
      this.props.onMouseOver(args);
    }
  };

  onMouseOut = args => {
    if (this.props.onMouseOut) {
      this.props.onMouseOut(args);
    }
  };

  render() {
    const tokens = React.Children.map(this.props.children, child => {
      return React.cloneElement(child, {
        template: Square,
        onClick: this.onClick,
        onMouseOver: this.onMouseOver,
        onMouseOut: this.onMouseOut,
      });
    });

    return (
      <svg
        viewBox={'0 0 ' + this.props.cols + ' ' + this.props.rows}
        style={this.props.style}
      >
        <g>{this._getGrid()}</g>
        {tokens}
      </svg>
    );
  }
}

/**
 * Square
 *
 * Component that renders a square inside a Grid.
 *
 * Props:
 *   x       - X coordinate on grid coordinates.
 *   y       - Y coordinate on grid coordinates.
 *   size    - Square size.
 *   style   - Custom styling.
 *   onClick - Invoked when a Square is clicked.
 *   onMouseOver - Invoked when a Square is mouse over.
 *   onMouseOut - Invoked when a Square is mouse out.
 *
 * Not meant to be used by the end user directly (use Token).
 * Also not exposed in the NPM.
 */
export class Square extends React.Component {
  static propTypes = {
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
    size: PropTypes.number,
    style: PropTypes.any,
    onClick: PropTypes.func,
    onMouseOver: PropTypes.func,
    onMouseOut: PropTypes.func,
    children: PropTypes.element,
  };

  static defaultProps = {
    size: 1,
    x: 0,
    y: 0,
    style: { fill: '#fff' },
  };

  onClick = () => {
    this.props.onClick({
      x: this.props.x,
      y: this.props.y,
    });
  };

  onMouseOver = () => {
    this.props.onMouseOver({
      x: this.props.x,
      y: this.props.y,
    });
  };

  onMouseOut = () => {
    this.props.onMouseOut({
      x: this.props.x,
      y: this.props.y,
    });
  };

  render() {
    const tx = this.props.x * this.props.size;
    const ty = this.props.y * this.props.size;

    // If a child is passed, render child.
    if (this.props.children) {
      return (
        <g
          onClick={this.onClick}
          onMouseOver={this.onMouseOver}
          onMouseOut={this.onMouseOut}
          transform={`translate(${tx}, ${ty})`}
        >
          {this.props.children}
        </g>
      );
    }

    // If no child, render a square.
    return (
      <g
        onClick={this.onClick}
        onMouseOver={this.onMouseOver}
        onMouseOut={this.onMouseOut}
        transform={`translate(${tx}, ${ty})`}
      >
        <rect
          style={this.props.style}
          width={this.props.size}
          height={this.props.size}
          x={0}
          y={0}
        />
      </g>
    );
  }
}
