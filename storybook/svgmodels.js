/*
 * Copyright 2018 The boardgame.io Authors.
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { storiesOf } from '@storybook/react';
import { Models, SvgComponent } from 'boardgame.io/ui';

const components = Object.keys(Models).map(modelname => {
  return {
    modelname: modelname,
    component: Models[modelname],
  };
});

const so = storiesOf('SVG Models', module);
components.forEach(c =>
  so.add(c.modelname, () => <SvgView component={c.component} />)
);

export class SvgView extends React.Component {
  static propTypes = {
    component: PropTypes.element.isRequired,
  };
  render() {
    return (
      <div style={{ padding: '50px' }}>
        <svg width={500} height={500} viewBox="0 0 1 1">
          <rect fill="lightgreen" x="0" y="0" width="500" height="500" />
          <g transform="translate(0.5, 0.5)">
            <SvgComponent component={this.props.component} />
          </g>
        </svg>
      </div>
    );
  }
}
