/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import PropTypes from 'prop-types';

export class SvgComponent extends React.Component {
  static propTypes = {
    component: PropTypes.element.isRequired,
    x: PropTypes.number,
    y: PropTypes.number,
    style: PropTypes.any,
    onClick: PropTypes.func,
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

    return (
      <g onClick={this.onClick} transform={`translate(${tx}, ${ty})`}>
        {this.props.component}
      </g>
    );
  }
}
