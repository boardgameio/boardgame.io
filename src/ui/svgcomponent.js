/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Models } from './svg';

class SvgComponent extends React.Component {
  static propTypes = {
    component: PropTypes.element.isRequired,
    _center: PropTypes.object,
    style: PropTypes.any,
    onClick: PropTypes.func,
  };

  static defaultProps = {
    style: { fill: '#ff0000' },
  };

  render() {
    let tx = 0,
      ty = 0;
    if (this.props._center !== undefined) {
      tx = this.props._center.x;
      ty = this.props._center.y;
    }

    return (
      <g onClick={this.props.onClick} transform={`translate(${tx}, ${ty})`}>
        {this.props.component}
      </g>
    );
  }
}

export const WheatSVG = props => (
  <SvgComponent component={Models.Wheat} {...props} />
);
export const WoodSVG = props => (
  <SvgComponent component={Models.Wood} {...props} />
);
export const Disc3DSVG = props => (
  <SvgComponent component={Models.Disc3D} {...props} />
);
export const MeepleSVG = props => (
  <SvgComponent
    component={Models.Meeple({ color: (props || {}).color })}
    {...props}
  />
);
MeepleSVG.propTypes = {
  color: PropTypes.string,
};
