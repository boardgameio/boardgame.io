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
 * Grid
 *
 * Component that will show children on cartesian plane using X and Y
 * coordinates.
 *
 * Props:
 *   rows       - Number of rows (height) of the grid.
 *   cols       - Number of columns (width) of the grid.
 *   style      - CSS style of the Grid HTML element.
 *
 * Usage:
 *
 * <Grid rows={8} cols={8}>
 *   <Token x={1} y={2}>
 *     <Knight color='dark' />
 *   </Token>
 * </Grid>
 *
 * or
 *
 * <Grid rows={1} cols={1} style={{width: '500px'}}>
 *   <Knight color='dark' />
 * </Grid>
 */
class Grid extends React.Component {
  static propTypes = {
    rows: PropTypes.number,
    cols: PropTypes.number,
    style: PropTypes.object,
    children: PropTypes.element,
  }

  cartesianCord = (props) => {
    return {x: props.x, y: props.y};
  }

  render() {
    const childrenWithExtraProp = React.Children.map(this.props.children,
      child => {
        return React.cloneElement(child, {
          _coordinateFn: this.cartesianCord
        });
      }
    );

    return (<svg viewBox={'0 0 ' + this.props.cols + ' ' + this.props.rows}
                 style={this.props.style}>
              {childrenWithExtraProp}
            </svg>);
  }
}

export default Grid;
