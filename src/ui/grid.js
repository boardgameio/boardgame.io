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

  _svgRef = React.createRef();

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
        // Overwrites Token's onClick, onMouseOver, onMouseOut
        onClick: this.onClick,
        onMouseOver: this.onMouseOver,
        onMouseOut: this.onMouseOut,
        svgRef: this._svgRef,
      });
    });

    return (
      <svg
        ref={this._svgRef}
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
 *   eventListeners - Array of objects with name and callback
 *   for DOM events.
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
    eventListeners: PropTypes.array,
    children: PropTypes.element,
    svgRef: PropTypes.object,
  };

  static defaultProps = {
    size: 1,
    x: 0,
    y: 0,
    style: { fill: '#fff' },
    eventListeners: [],
  };

  _gRef = React.createRef();

  onClick = e => {
    this.props.onClick(this.getCoords(), e);
  };

  onMouseOver = e => {
    this.props.onMouseOver(this.getCoords(), e);
  };

  onMouseOut = e => {
    this.props.onMouseOut(this.getCoords(), e);
  };

  getCoords() {
    return {
      x: this.props.x,
      y: this.props.y,
    };
  }

  componentDidMount() {
    const element = this._gRef.current;
    for (let listener of this.props.eventListeners) {
      element.addEventListener(listener.name, listener.callback);
    }
  }

  componentWillUnmount() {
    const element = this._gRef.current;
    for (let listener of this.props.eventListeners) {
      element.removeEventListener(listener.name, listener.callback);
    }
  }

  render() {
    const tx = this.props.x * this.props.size;
    const ty = this.props.y * this.props.size;

    // If no child, render a square.
    let children = (
      <rect
        style={this.props.style}
        width={this.props.size}
        height={this.props.size}
        x={0}
        y={0}
      />
    );
    // If a child is passed, render child.
    if (this.props.children) {
      children = this.props.children;
    }

    if (this.props.svgRef) {
      return (
        <g
          ref={this._gRef}
          onClick={this.onClick}
          onMouseOver={this.onMouseOver}
          onMouseOut={this.onMouseOut}
          transform={`translate(${tx}, ${ty})`}
        >
          {children}
        </g>
      );
    }

    return (
      <svg
        ref={this._gRef}
        onClick={this.onClick}
        onMouseOver={this.onMouseOver}
        onMouseOut={this.onMouseOut}
        transform={`translate(${tx}, ${ty})`}
      >
        {children}
      </svg>
    );
  }
}
