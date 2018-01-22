/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import PropTypes from 'prop-types';

class Queen extends React.Component {
  static propTypes = {
    color: PropTypes.string,
  };

  render() {
    let primaryColor = this.props.color == 'b' ? '#000000' : '#FFFFFF';
    let secondaryColor = this.props.color == 'b' ? '#FFFFFF' : '#000000';
    return (
      <g transform="scale(.022222,.022222)">
        <g
          style={{
            opacity: 1,
            fill: primaryColor,
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
            d="M 9 13 A 2 2 0 1 1  5,13 A 2 2 0 1 1  9 13 z"
            transform="translate(-1,-1)"
          />
          <path
            d="M 9 13 A 2 2 0 1 1  5,13 A 2 2 0 1 1  9 13 z"
            transform="translate(15.5,-5.5)"
          />
          <path
            d="M 9 13 A 2 2 0 1 1  5,13 A 2 2 0 1 1  9 13 z"
            transform="translate(32,-1)"
          />
          <path
            d="M 9 13 A 2 2 0 1 1  5,13 A 2 2 0 1 1  9 13 z"
            transform="translate(7,-4.5)"
          />
          <path
            d="M 9 13 A 2 2 0 1 1  5,13 A 2 2 0 1 1  9 13 z"
            transform="translate(24,-4)"
          />
          <path
            d="M 9,26 C 17.5,24.5 30,24.5 36,26 L 38,14 L 31,25 L 31,11 L 25.5,24.5 L 22.5,9.5 L 19.5,24.5 L 14,10.5 L 14,25 L 7,14 L 9,26 z "
            style={{ strokeLinecap: 'butt' }}
          />
          <path
            d="M 9,26 C 9,28 10.5,28 11.5,30 C 12.5,31.5 12.5,31 12,33.5 C 10.5,34.5 10.5,36 10.5,36 C 9,37.5 11,38.5 11,38.5 C 17.5,39.5 27.5,39.5 34,38.5 C 34,38.5 35.5,37.5 34,36 C 34,36 34.5,34.5 33,33.5 C 32.5,31 32.5,31.5 33.5,30 C 34.5,28 36,28 36,26 C 27.5,24.5 17.5,24.5 9,26 z "
            style={{ strokeLinecap: 'butt' }}
          />
          <path
            d="M 11.5,30 C 15,29 30,29 33.5,30"
            style={{
              fill: 'none',
              stroke: secondaryColor,
            }}
          />
          <path
            d="M 12,33.5 C 18,32.5 27,32.5 33,33.5"
            style={{
              fill: 'none',
              stroke: secondaryColor,
            }}
          />
        </g>
      </g>
    );
  }
}

export default Queen;
