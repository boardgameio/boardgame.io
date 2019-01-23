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
 * HexGrid
 *
 * Component to display a hex grid.
 * Reference: https://www.redblobgames.com/grids/hexagons/.
 *
 * We use cube co-ordinates (see reference).
 *
 * Props:
 *   levels     - The number of levels around the central hex.
 *   style      - CSS style of the HTML element.
 *
 * Usage:
 *
 * <HexGrid levels={5}>
 *   <Token x={0} y={0} z={0}/>
 * </HexGrid>
 */
export class HexGrid extends React.Component {
  static propTypes = {
    levels: PropTypes.number.isRequired,
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
    levels: 5,
    colorMap: {},
    outline: true,
    cellSize: 1,
  };

  _svgRef = React.createRef();

  _getCellColor(x, y, z) {
    const key = `${x},${y},${z}`;
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

    let hexes = [];
    const r = this.props.levels;
    for (let x = -r; x <= r; x++) {
      for (let y = -r; y <= r; y++) {
        const z = -x - y;
        if (Math.abs(z) > r) continue;
        hexes.push(
          <Hex
            key={`${x}:${y}:${z}`}
            style={{ fill: this._getCellColor(x, y, z) }}
            x={x}
            y={y}
            z={z}
            size={this.props.cellSize}
            onClick={this.onClick}
            onMouseOver={this.onMouseOver}
            onMouseOut={this.onMouseOut}
          />
        );
      }
    }
    return hexes;
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
        template: Hex,
        onClick: this.onClick,
        onMouseOver: this.onMouseOver,
        onMouseOut: this.onMouseOut,
        svgRef: this._svgRef,
      });
    });

    const t = this.props.cellSize * this.props.levels * 2;
    return (
      <svg
        ref={this._svgRef}
        viewBox={-t + ' ' + -t + ' ' + 2 * t + ' ' + 2 * t}
        style={this.props.style}
      >
        <g>{this._getGrid()}</g>
        {tokens}
      </svg>
    );
  }
}

/**
 * Hex (flat-topped).
 *
 * Component that renders a hexagon inside a HexGrid.
 *
 * Props:
 *   x       - X coordinate (cube coordinates).
 *   y       - Y coordinate (cube coordinates).
 *   z       - Z coordinate (cube coordinates).
 *   size    - Hex size.
 *   style   - Custom styling.
 *   onClick - Invoked when a Hex is clicked.
 *   onMouseOver - Invoked when a Hex is mouse over.
 *   onMouseOut - Invoked when a Hex is mouse out.
 *   eventListeners - Array of objects with name and callback
 *   for DOM events.
 *
 * Not meant to be used by the end user directly (use Token).
 * Also not exposed in the NPM.
 */
export class Hex extends React.Component {
  static propTypes = {
    x: PropTypes.number,
    y: PropTypes.number,
    z: PropTypes.number,
    size: PropTypes.number,
    style: PropTypes.any,
    onClick: PropTypes.func,
    onMouseOver: PropTypes.func,
    onMouseOut: PropTypes.func,
    eventListeners: PropTypes.array,
    children: PropTypes.element,
  };

  static defaultProps = {
    size: 1,
    x: 0,
    y: 0,
    z: 0,
    style: { fill: '#fff' },
    eventListeners: [],
  };

  _gRef = React.createRef();

  constructor(props) {
    super(props);
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

  get width() {
    return this.props.size * 2;
  }

  get height() {
    return ((Math.sqrt(3) / 2) * this.width).toFixed(3);
  }

  /**
   * Get the co-ordinates of the hex center.
   */
  get center() {
    const q = this.props.x;
    const r = this.props.z;
    const x = (this.props.size * 3 * q) / 2.0;
    const y = this.props.size * Math.sqrt(3) * (r + q / 2.0);
    return { x, y };
  }

  /**
   * Get the points of the vertices.
   */
  get points() {
    //   b____c
    //   /    \
    // a/      \d
    //  \      /
    //   \____/
    //   f    e

    const s = this.props.size;
    const h = this.height;

    const xa = -s;
    const xb = -s / 2.0;
    const xc = +s / 2.0;
    const xd = +s;
    const xe = xc;
    const xf = xb;

    const ya = 0.0;
    const yb = h / 2.0;
    const yc = yb;
    const yd = ya;
    const ye = -h / 2.0;
    const yf = ye;

    const flatTop = [
      `${xa},${ya}`,
      `${xb},${yb}`,
      `${xc},${yc}`,
      `${xd},${yd}`,
      `${xe},${ye}`,
      `${xf},${yf}`,
    ];

    return flatTop.join(' ');
  }

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
      z: this.props.z,
    };
  }

  render() {
    const tx = this.center.x;
    const ty = this.center.y;

    // If no child, render a hex.
    let children = (
      <polygon
        style={this.props.style}
        points={this.points}
        stroke="#aaa"
        strokeWidth={0.01}
      />
    );
    // If a child is passed, render child.
    if (this.props.children) {
      children = this.props.children;
    }

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
}
