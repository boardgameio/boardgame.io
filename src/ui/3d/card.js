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
import TWEEN from '@tweenjs/tween.js';

export class CardImpl extends React.Component {
  static propTypes = {
    context: PropTypes.any.isRequired,
    image: PropTypes.string,
    width: PropTypes.number,
    height: PropTypes.number,
    thickness: PropTypes.number,
    responsive: PropTypes.bool,
    draggable: PropTypes.bool,
    x: PropTypes.number,
    z: PropTypes.number,
    splayX: PropTypes.number,
    splayY: PropTypes.number,
    splayZ: PropTypes.number,
  };

  static defaultProps = {
    responsive: true,
    draggable: true,
    splayX: 0,
    splayY: 0,
    splayZ: 0,
    x: 0,
    z: 0,
    width: 1,
    height: 1.5,
    thickness: 0.01,
  };

  constructor(props) {
    super(props);

    this.originalY = props.thickness / 2 - 0.0001;
    const geometry = new THREE.BoxGeometry(
      props.width,
      props.thickness,
      props.height,
    );

    let opts = { color: 0x777777 };
    if (props.image) {
      opts = { map: new THREE.TextureLoader().load(props.image) };
    }

    const material = new THREE.MeshLambertMaterial(opts);
    this.obj = new THREE.Mesh(geometry, material);
    this.obj.receiveShadow = true;
    this.obj.position.y = this.originalY;
    this.obj.userData.draggable = props.draggable;
    this.obj.userData.responsive = props.responsive;
  }

  onEvent = e => {
    if (!this.props.responsive) {
      return;
    }

    if (e.type == 'dragStart') {
      this.obj.castShadow = true;
      new TWEEN.Tween(this.obj.position)
        .to({ y: this.originalY + 0.5 }, 100)
        .easing(TWEEN.Easing.Quadratic.Out)
        .start();
    }

    if (e.type == 'dragEnd') {
      new TWEEN.Tween(this.obj.position)
        .to({ y: this.originalY }, 100)
        .onComplete(() => (this.obj.castShadow = false))
        .start();
    }

    if (e.type == 'drag') {
      this.obj.position.x = e.point.x;
      this.obj.position.z = e.point.z;
    }
  };

  componentDidMount() {
    this.props.context.add(this.obj, this.onEvent);
  }

  componentWillUnmount() {
    this.props.context.remove(this.obj);
  }

  render() {
    this.obj.position.x = this.props.x + this.props.splayX;
    this.obj.position.z = this.props.z + this.props.splayZ;
    this.obj.position.y = this.originalY + this.props.splayY;
    return null;
  }
}

const Card = props => (
  <UIContext.Consumer>
    {context => <CardImpl {...props} context={context} />}
  </UIContext.Consumer>
);

export { Card };
