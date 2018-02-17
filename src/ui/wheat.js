/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import PropTypes from 'prop-types';

export class Wheat extends React.Component {
  static propTypes = {
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
    style: PropTypes.any,
    onClick: PropTypes.func,
    children: PropTypes.element,
  };

  static defaultProps = {
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
        <g transform="translate(-1.5, -1.15) scale(0.25, 0.25)">
          <g strokeWidth="0.1px" strokeLinejoin="miter" strokeLinecap="round">
            <polygon
              stroke="black"
              fill="yellow"
              points="9.3136,5.1677 9.2225,5.1151 9.0432,5.0212 8.8568,4.9429 8.6491,4.8775 8.4299,4.8305 8.2194,4.8049 8.013,4.8006 7.801,4.8149 7.599,4.8476 7.4154,4.9002 7.2418,4.9671 7.0711,5.0368 6.906,5.108 6.7749,5.1864 6.7231,5.2679 6.7559,5.3485 6.8305,5.4305 6.9117,5.5233 6.9813,5.6426 7.0343,5.7876 7.0733,5.9343 7.0981,6.0677 7.0898,6.1937 7.041,6.3105 7.0119,6.4207 7.0401,6.5334 7.1006,6.6403 7.1538,6.7454 7.164,6.8722 7.1469,7.0161 7.1201,7.1718 7.0815,7.3384 7.0348,7.4932 6.9783,7.637 6.9228,7.7769 6.8812,7.9045 6.8749,8.0139 6.9175,8.1013 7.0109,8.1483 7.1354,8.1396 7.2305,8.1401 7.2949,8.2035 7.3719,8.2712 7.4577,8.2843 7.5309,8.2488 7.5915,8.2144 7.6581,8.233 7.746,8.2969 7.8509,8.3416 7.9492,8.3225 8.0262,8.2608 8.0912,8.2193 8.1567,8.2504 8.2343,8.3253 8.3293,8.3591 8.4161,8.3253 8.491,8.2892 8.5854,8.3132 8.6914,8.3498 8.7799,8.3242 8.8421,8.2515 8.9153,8.2106 9.0163,8.2357 9.1026,8.2548 9.172,8.2144 9.2321,8.1461 9.2981,8.1041 9.3975,8.0992 9.4882,8.0729 9.5139,7.9894 9.4727,7.8723 9.4072,7.7606 9.3464,7.6506 9.2857,7.519 9.2279,7.3814 9.1792,7.2481 9.1383,7.1012 9.1039,6.9477 9.0766,6.8134 9.0826,6.7052 9.1437,6.6031 9.212,6.4846 9.2279,6.3645 9.1874,6.258 9.1306,6.1749 9.1011,6.1047 9.1082,6.0105 9.1295,5.8971 9.141,5.7895 9.1498,5.6901 9.182,5.5847 9.2404,5.47 9.313,5.3679 9.3759,5.2919 9.3999,5.2603 9.3968,5.2578"
            />
          </g>
        </g>
      </g>
    );
  }
}
