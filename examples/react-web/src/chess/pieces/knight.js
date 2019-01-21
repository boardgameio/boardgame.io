/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import PropTypes from 'prop-types';

class Knight extends React.Component {
  static propTypes = {
    color: PropTypes.string,
  };

  render() {
    let primaryColor = this.props.color == 'b' ? '#000000' : '#FFFFFF';
    let secondaryColor = this.props.color == 'b' ? '#FFFFFF' : '#000000';
    let extra = null;
    if (this.props.color == 'b') {
      extra = (
        <path
          d="M 24.55,10.4 L 24.1,11.85 L 24.6,12 C 27.75,13 30.25,14.49 32.5,18.75 C 34.75,23.01 35.75,29.06 35.25,39 L 35.2,39.5 L 37.45,39.5 L 37.5,39 C 38,28.94 36.62,22.15 34.25,17.66 C 31.88,13.17 28.46,11.02 25.06,10.5 L 24.55,10.4 z "
          style={{
            fill: '#ffffff',
            stroke: 'none',
          }}
        />
      );
    }
    return (
      <g transform="scale(.022222,.022222)">
        <g
          style={{
            opacity: 1,
            fill: 'none',
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
            d="M 22,10 C 32.5,11 38.5,18 38,39 L 15,39 C 15,30 25,32.5 23,18"
            style={{
              fill: primaryColor,
              stroke: '#000000',
            }}
          />
          <path
            d="M 24,18 C 24.38,20.91 18.45,25.37 16,27 C 13,29 13.18,31.34 11,31 C 9.958,30.06 12.41,27.96 11,28 C 10,28 11.19,29.23 10,30 C 9,30 5.997,31 6,26 C 6,24 12,14 12,14 C 12,14 13.89,12.1 14,10.5 C 13.27,9.506 13.5,8.5 13.5,7.5 C 14.5,6.5 16.5,10 16.5,10 L 18.5,10 C 18.5,10 19.28,8.008 21,7 C 22,7 22,10 22,10"
            style={{
              fill: primaryColor,
              stroke: '#000000',
            }}
          />
          <path
            d="M 9.5 25.5 A 0.5 0.5 0 1 1 8.5,25.5 A 0.5 0.5 0 1 1 9.5 25.5 z"
            style={{
              fill: secondaryColor,
              stroke: secondaryColor,
            }}
          />
          <path
            d="M 15 15.5 A 0.5 1.5 0 1 1  14,15.5 A 0.5 1.5 0 1 1  15 15.5 z"
            transform="matrix(0.866,0.5,-0.5,0.866,9.693,-5.173)"
            style={{
              fill: secondaryColor,
              stroke: secondaryColor,
            }}
          />
          {extra}
        </g>
      </g>
    );
  }
}

export default Knight;
