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
import { Tween, Easing } from '@tweenjs/tween.js';

export class CardImpl extends React.Component {
  static propTypes = {
    context: PropTypes.any.isRequired,
    width: PropTypes.number,
    height: PropTypes.number,
    thickness: PropTypes.number,
  };

  static defaultProps = {
    width: 1,
    height: 1.5,
    thickness: 0.01,
  };

  state = {
    isHighlighted: false,
  };

  constructor(props) {
    super(props);

    this.originalY = props.thickness / 2 - 0.0001;
    const geometry = new THREE.BoxGeometry(
      props.width,
      props.thickness,
      props.height
    );
    const material = new THREE.MeshLambertMaterial({ color: 0x777777 });
    this.obj = new THREE.Mesh(geometry, material);
    this.obj.position.y = this.originalY;
    this.obj.castShadow = true;
  }

  onEvent = e => {
    if (e.type == 'click') {
      if (!this.state.isHighlighted) {
        new Tween(this.obj.position)
          .to({ y: this.originalY + 0.5 }, 100)
          .easing(Easing.Quadratic.Out)
          .start();
        this.setState({ isHighlighted: true });
      } else {
        new Tween(this.obj.position).to({ y: this.originalY }, 100).start();
        this.setState({ isHighlighted: false });
      }
    }
  };

  componentDidMount() {
    this.props.context.add(this.obj, this.onEvent);
  }

  componentWillUnmount() {
    this.props.context.remove(this.obj);
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
