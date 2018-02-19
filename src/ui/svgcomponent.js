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
    center: PropTypes.object,
    style: PropTypes.any,
    onClick: PropTypes.func,
  };

  static defaultProps = {
    style: { fill: '#ff0000' },
  };

  render() {
    let tx = 0,
      ty = 0;
    if (this.props.center !== undefined) {
      tx = this.props.center.x;
      ty = this.props.center.y;
    }

    return (
      <g onClick={this.props.onClick} transform={`translate(${tx}, ${ty})`}>
        {this.props.component}
      </g>
    );
  }
}
