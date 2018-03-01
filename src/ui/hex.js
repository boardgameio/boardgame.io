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

  static cc2graphical = (x, y, z, cellSize) => {
    const q = x;
    const r = z;
    const xw = cellSize * 3 * q / 2.0;
    const yw = cellSize * Math.sqrt(3) * (r + q / 2.0);
    // NOTE: _center is used as internal prop name
    const _center = { x: xw, y: yw };
    const width = cellSize * 2;
    const height = Math.sqrt(3) / 2 * width;
    return { _center, width, height, cellSize };
  };

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
        const dims = HexGrid.cc2graphical(x, y, z, this.props.cellSize);
        hexes.push(
          <Hex
            _center={dims._center}
            key={`${x}:${y}:${z}`}
            style={{ fill: this._getCellColor(x, y, z) }}
            size={this.props.cellSize}
            onClick={this.onClick}
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

  render() {
    const tokens = React.Children.map(this.props.children, child => {
      const t = child.props.template || Hex;
      const dims = HexGrid.cc2graphical(
        child.props.x,
        child.props.y,
        0,
        this.props.cellSize
      );

      return React.cloneElement(child, {
        ...dims,
        template: t,
        // _center: HexGrid.cc2graphical,
        _center: dims._center,
        onClick: this.onClick,
      });
    });

    const t = this.props.cellSize * this.props.levels * 2;
    return (
      <svg
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
 *
 * Not meant to be used by the end user directly (use Token).
 * Also not exposed in the NPM.
 */
export class Hex extends React.Component {
  static propTypes = {
    size: PropTypes.number,
    _center: PropTypes.number,
    style: PropTypes.any,
    onClick: PropTypes.func,
    children: PropTypes.element,
  };

  static defaultProps = {
    size: 1,
    style: { fill: '#fff' },
  };

  constructor(props) {
    super(props);
  }

  get width() {
    return this.props.size * 2;
  }

  get height() {
    return (Math.sqrt(3) / 2 * this.width).toFixed(3);
  }

  /**
   * Get the co-ordinates of the hex center.
   */
  get center() {
    return this.props._center;
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

  onClick = () => {
    this.props.onClick();
  };

  render() {
    const tx = this.center.x;
    const ty = this.center.y;

    // If a child is passed, render child.
    if (this.props.children) {
      return (
        <g onClick={this.onClick} transform={`translate(${tx}, ${ty})`}>
          {this.props.children}
        </g>
      );
    }

    // If no child, render a hex.
    return (
      <g onClick={this.onClick} transform={`translate(${tx}, ${ty})`}>
        <polygon
          style={this.props.style}
          points={this.points}
          stroke="#aaa"
          strokeWidth={0.01}
        />
      </g>
    );
  }
}
