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
 *   radius     - The number of levels around the central hex.
 *   style      - CSS style of the HTML element.
 *
 * Usage:
 *
 * <HexGrid radius={5}>
 *   <Hex x={0} y={0} z={0}/>
 * </HexGrid>
 */
export class HexGrid extends React.Component {
  static propTypes = {
    radius: PropTypes.number.isRequired,
    outline: PropTypes.bool,
    style: PropTypes.object,
    hexSize: PropTypes.number,
    children: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.element),
      PropTypes.element,
    ]),
  };

  static defaultProps = {
    radius: 5,
    outline: true,
    hexSize: 1,
  };

  _getOutline() {
    if (!this.props.outline) {
      return null;
    }

    let hexes = [];
    const r = this.props.radius;
    for (let x = -r; x <= r; x++) {
      for (let y = -r; y <= r; y++) {
        const z = -x - y;
        if (Math.abs(z) > r) continue;
        hexes.push(
          <Hex
            key={`${x}:${y}:${z}`}
            x={x}
            y={y}
            z={z}
            size={this.props.hexSize}
          />
        );
      }
    }
    return hexes;
  }

  render() {
    const t = this.props.hexSize * this.props.radius * 2;
    return (
      <svg
        viewBox={-t + ' ' + -t + ' ' + 2 * t + ' ' + 2 * t}
        style={this.props.style}
      >
        <g>{this._getOutline()}</g>
        {this.props.children}
      </svg>
    );
  }
}

/**
 * Hex (flat-topped).
 *
 */
export class Hex extends React.Component {
  static propTypes = {
    x: PropTypes.number,
    y: PropTypes.number,
    z: PropTypes.number,
    size: PropTypes.number,
  };

  static defaultProps = {
    size: 1,
    x: 0,
    y: 0,
    z: 0,
  };

  state = {
    highlight: false,
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
    const q = this.props.x;
    const r = this.props.z;
    const x = this.props.size * 3 * q / 2.0;
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

  onClick = () => {
    this.setState(old => ({ highlight: !old.highlight }));
  };

  render() {
    const sx = this.center.x;
    const sy = this.center.y;

    const fill = this.state.highlight ? '#aaa' : '#fff';

    return (
      <g className="hex" transform={`translate(${sx}, ${sy})`}>
        <polygon
          points={this.points}
          onClick={this.onClick}
          fill={fill}
          stroke="#aaa"
          strokeWidth={0.01}
        />
      </g>
    );
  }
}
