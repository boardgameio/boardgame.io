/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import PropTypes from 'prop-types';

class Rook extends React.Component {
  static propTypes = {
    color: PropTypes.string,
  };

  render() {
    if (this.props.color == 'b') {
      return (
        <g transform="scale(.022222,.022222)">
          <g
            style={{
              opacity: 1,
              fill: '#000000',
              fillOpacity: 1,
              fillRule: 'evenodd',
              stroke: '#000000',
              strokeWidth: 1.5,
              strokeLinecap: 'round',
              strokeLinejoin: 'round',
              strokeMiterlimit: 4,
              strokeDasharray: 'none',
              strokeOpacity: 1,
            }}
          >
            <path
              d="M 9,39 L 36,39 L 36,36 L 9,36 L 9,39 z "
              style={{ strokeLinecap: 'butt' }}
            />
            <path
              d="M 12.5,32 L 14,29.5 L 31,29.5 L 32.5,32 L 12.5,32 z "
              style={{ strokeLinecap: 'butt' }}
            />
            <path
              d="M 12,36 L 12,32 L 33,32 L 33,36 L 12,36 z "
              style={{ strokeLinecap: 'butt' }}
            />
            <path
              d="M 14,29.5 L 14,16.5 L 31,16.5 L 31,29.5 L 14,29.5 z "
              style={{
                strokeLinecap: 'butt',
                strokeLinejoin: 'miter',
              }}
            />
            <path
              d="M 14,16.5 L 11,14 L 34,14 L 31,16.5 L 14,16.5 z "
              style={{ strokeLinecap: 'butt' }}
            />
            <path
              d="M 11,14 L 11,9 L 15,9 L 15,11 L 20,11 L 20,9 L 25,9 L 25,11 L 30,11 L 30,9 L 34,9 L 34,14 L 11,14 z "
              style={{ strokeLinecap: 'butt' }}
            />
            <path
              d="M 12,35.5 L 33,35.5 L 33,35.5"
              style={{
                fill: 'none',
                stroke: '#ffffff',
                strokeWidth: 1,
                strokeLinejoin: 'miter',
              }}
            />
            <path
              d="M 13,31.5 L 32,31.5"
              style={{
                fill: 'none',
                stroke: '#ffffff',
                strokeWidth: 1,
                strokeLinejoin: 'miter',
              }}
            />
            <path
              d="M 14,29.5 L 31,29.5"
              style={{
                fill: 'none',
                stroke: '#ffffff',
                strokeWidth: 1,
                strokeLinejoin: 'miter',
              }}
            />
            <path
              d="M 14,16.5 L 31,16.5"
              style={{
                fill: 'none',
                stroke: '#ffffff',
                strokeWidth: 1,
                strokeLinejoin: 'miter',
              }}
            />
            <path
              d="M 11,14 L 34,14"
              style={{
                fill: 'none',
                stroke: '#ffffff',
                strokeWidth: 1,
                strokeLinejoin: 'miter',
              }}
            />
          </g>
        </g>
      );
    } else {
      return (
        <g transform="scale(.022222,.022222)">
          <g
            style={{
              opacity: 1,
              fill: '#ffffff',
              fillOpacity: 1,
              fillRule: 'evenodd',
              stroke: '#000000',
              strokeWidth: 1.5,
              strokeLinecap: 'round',
              strokeLinejoin: 'round',
              strokeMiterlimit: 4,
              strokeDasharray: 'none',
              strokeOpacity: 1,
            }}
          >
            <path
              d="M 9,39 L 36,39 L 36,36 L 9,36 L 9,39 z "
              style={{ strokeLinecap: 'butt' }}
            />
            <path
              d="M 12,36 L 12,32 L 33,32 L 33,36 L 12,36 z "
              style={{ strokeLinecap: 'butt' }}
            />
            <path
              d="M 11,14 L 11,9 L 15,9 L 15,11 L 20,11 L 20,9 L 25,9 L 25,11 L 30,11 L 30,9 L 34,9 L 34,14"
              style={{ strokeLinecap: 'butt' }}
            />
            <path d="M 34,14 L 31,17 L 14,17 L 11,14" />
            <path
              d="M 31,17 L 31,29.5 L 14,29.5 L 14,17"
              style={{
                strokeLinecap: 'butt',
                strokeLinejoin: 'miter',
              }}
            />
            <path d="M 31,29.5 L 32.5,32 L 12.5,32 L 14,29.5" />
            <path
              d="M 11,14 L 34,14"
              style={{
                fill: 'none',
                stroke: '#000000',
                strokeLinejoin: 'miter',
              }}
            />
          </g>
        </g>
      );
    }
  }
}

export default Rook;
