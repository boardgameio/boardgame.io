/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import PropTypes from 'prop-types';

class Pawn extends React.Component {
  static propTypes = {
    color: PropTypes.string,
  };

  render() {
    let primaryColor = this.props.color == 'b' ? '#000000' : '#FFFFFF';
    return (
      <g transform="scale(.022222,.022222)">
        <path
          d="M 22,9 C 19.79,9 18,10.79 18,13 C 18,13.89 18.29,14.71 18.78,15.38 C 16.83,16.5 15.5,18.59 15.5,21 C 15.5,23.03 16.44,24.84 17.91,26.03 C 14.91,27.09 10.5,31.58 10.5,39.5 L 33.5,39.5 C 33.5,31.58 29.09,27.09 26.09,26.03 C 27.56,24.84 28.5,23.03 28.5,21 C 28.5,18.59 27.17,16.5 25.22,15.38 C 25.71,14.71 26,13.89 26,13 C 26,10.79 24.21,9 22,9 z "
          style={{
            opacity: 1,
            fill: primaryColor,
            fillOpacity: 1,
            fillRule: 'nonzero',
            stroke: '#000000',
            strokeWidth: 1.5,
            strokeLinecap: 'round',
            strokeLinejoin: 'miter',
            strokeMiterlimit: 4,
            strokeDasharray: 'none',
            strokeOpacity: 1,
          }}
        />
      </g>
    );
  }
}

export default Pawn;
