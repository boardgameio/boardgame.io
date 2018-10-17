/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import PropTypes from 'prop-types';

class Bishop extends React.Component {
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
            fill: 'none',
            fillRule: 'evenodd',
            fillOpacity: 1,
            stroke: '#000000',
            strokeWidth: 1.5,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            strokeMiterlimit: 4,
            strokeDasharray: 'none',
            strokeOpacity: 1,
          }}
        >
          <g
            style={{
              fill: primaryColor,
              stroke: '#000000',
              strokeLinecap: 'butt',
            }}
          >
            <path d="M 9,36 C 12.39,35.03 19.11,36.43 22.5,34 C 25.89,36.43 32.61,35.03 36,36 C 36,36 37.65,36.54 39,38 C 38.32,38.97 37.35,38.99 36,38.5 C 32.61,37.53 25.89,38.96 22.5,37.5 C 19.11,38.96 12.39,37.53 9,38.5 C 7.646,38.99 6.677,38.97 6,38 C 7.354,36.06 9,36 9,36 z" />
            <path d="M 15,32 C 17.5,34.5 27.5,34.5 30,32 C 30.5,30.5 30,30 30,30 C 30,27.5 27.5,26 27.5,26 C 33,24.5 33.5,14.5 22.5,10.5 C 11.5,14.5 12,24.5 17.5,26 C 17.5,26 15,27.5 15,30 C 15,30 14.5,30.5 15,32 z" />
            <path d="M 25 8 A 2.5 2.5 0 1 1  20,8 A 2.5 2.5 0 1 1  25 8 z" />
          </g>
          <path
            d="M 17.5,26 L 27.5,26 M 15,30 L 30,30 M 22.5,15.5 L 22.5,20.5 M 20,18 L 25,18"
            style={{
              fill: 'none',
              stroke: secondaryColor,
              strokeLinejoin: 'miter',
            }}
          />
        </g>
      </g>
    );
  }
}

export default Bishop;
