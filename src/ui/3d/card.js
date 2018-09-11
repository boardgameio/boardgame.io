/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import PropTypes from 'prop-types';
import UIContext from '../ui-context';
import * as THREE from 'three';

export class CardImpl extends React.Component {
  static propTypes = {
    context: PropTypes.any.isRequired,
  };

  constructor(props) {
    super(props);

    const geometry = new THREE.BoxGeometry(1, 0.01, 1.5);
    const material = new THREE.MeshLambertMaterial({ color: 0xaaaaaa });
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.castShadow = true;
  }

  componentDidMount() {
    this.props.context.scene.add(this.mesh);
  }

  componentWillUnmount() {
    this.props.context.scene.remove(this.mesh);
  }

  render() {
    return null;
  }
}

const Card = props => (
  <UIContext.Consumer>
    {context => <CardImpl {...props} context={context} />}
  </UIContext.Consumer>
);

export { Card };
