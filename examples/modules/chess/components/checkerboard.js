/*
 * Copyright 2018 The boardgame.io Authors.
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import PropTypes from 'prop-types';

const NUM_COLS = 8;
const NUM_ROWS = 8;
const PRIMARY_COLOR = '#d18b47';
const SECONDARY_COLOR = '#ffce9e';
const MOVABLE_COLOR = 'palegreen';
const SELECTED_COLOR = 'green';
const COL_NAMES = 'abcdefgh';

class Checkerboard extends React.Component {
  static propTypes = {
    movable: PropTypes.array,
    selected: PropTypes.string,
    onClick: PropTypes.func
  };

  render() {
    // Add tiles
    let rects = [];
    for (let j = 0; j < NUM_COLS; j++) {
      for (let i = 0; i < NUM_ROWS; i++) {
        let cellCode = COL_NAMES[i] + (j + 1);
        let onClickCallback = () => () => {};
        if (this.props.onClick) {
          onClickCallback = this.props.onClick(cellCode);
        }
        rects.push((<rect
          style={{fill: this._getCellColor(i, j, cellCode)}}
          width="1"
          height="1"
          x={i}
          y={NUM_COLS - j - 1}
          key={NUM_COLS * j + i}
          onClick={onClickCallback}/>));
      }
    }
    return (<g>{rects}</g>);
  }

  _getCellColor(i, j, cellCode) {
    let color = SECONDARY_COLOR;
    if ((i + j) % 2 == 0) {
      color = PRIMARY_COLOR;
    }
    if (this.props.movable.includes(cellCode)) {
      color = MOVABLE_COLOR;
    }
    if (this.props.selected === cellCode) {
      color = SELECTED_COLOR;
    }
    return color;
  }
}

export default Checkerboard;
