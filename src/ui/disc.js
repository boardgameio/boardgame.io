/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import PropTypes from 'prop-types';

export class Disc extends React.Component {
  static propTypes = {
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
    r: PropTypes.number,
    style: PropTypes.any,
    onClick: PropTypes.func,
    children: PropTypes.element,
  };

  static defaultProps = {
    r: 1,
    x: 0,
    y: 0,
    style: { fill: '#ff0000' },
  };

  onClick = () => {
    this.props.onClick({
      x: this.props.x,
      y: this.props.y,
    });
  };

  render() {
    const tx = this.props.x; //* this.props.size;
    const ty = this.props.y; //* this.props.size;

    // If a child is passed, render child.
    if (this.props.children) {
      return (
        <g onClick={this.onClick} transform={`translate(${tx}, ${ty})`}>
          {this.props.children}
        </g>
      );
    }

    // If no child, render a disc.
    return (
      <g onClick={this.onClick} transform={`translate(${tx}, ${ty})`}>
        <g transform="translate(-2.77, -2.33) scale(0.015, 0.015)">
          <g
            strokeWidth="0.3px"
            strokeLinejoin="miter"
            strokeLinecap="round"
            stroke="rgb(51,26,0)"
          >
            <polygon
              fill="rgb(17,114,9)"
              points="110.1651,48.8118 105.9342,44.8845 99.5795,42.0763 92.0698,40.4442 84.1052,39.971 76.242,40.6401 69.0388,42.4554 63.1995,45.4174 59.6841,49.4452 59.6947,54.2302 64.3328,59.0517 73.7635,62.7322 86.2905,64.0285 98.5471,62.4147 107.2763,58.5048 111.0215,53.5814 "
              opacity="0.9"
            />
            <polygon
              fill="rgb(8,51,4)"
              points="109.6203,60.8423 111.0215,53.5814 107.2763,58.5048 105.9562,66.1367 "
              opacity="0.9"
            />
            <polygon
              fill="rgb(11,72,6)"
              points="65.3605,66.6598 64.3328,59.0517 59.6947,54.2302 60.8725,61.4654 "
              opacity="0.9"
            />
            <polygon
              fill="rgb(20,133,11)"
              points="105.9562,66.1367 107.2763,58.5048 98.5471,62.4147 97.6512,70.2982 "
              opacity="0.9"
            />
            <polygon
              fill="rgb(22,150,12)"
              points="74.3073,70.6008 73.7635,62.7322 64.3328,59.0517 65.3605,66.6598 "
              opacity="0.9"
            />
            <polygon
              fill="rgb(28,189,15)"
              points="97.6512,70.2982 98.5471,62.4147 86.2905,64.0285 86.1023,71.995 "
              opacity="0.9"
            />
            <polygon
              fill="rgb(29,196,15)"
              points="86.1023,71.995 86.2905,64.0285 73.7635,62.7322 74.3073,70.6008 "
              opacity="0.9"
            />
          </g>
        </g>
      </g>
    );
  }
}
