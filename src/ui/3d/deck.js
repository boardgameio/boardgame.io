/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import PropTypes from 'prop-types';
import UIContext from '../ui-context';
import { Card } from './card';
import * as THREE from 'three';

export class DeckImpl extends React.Component {
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
    const material = new THREE.MeshLambertMaterial({ color: 0xcccccc });
    this.obj = new THREE.Mesh(geometry, material);
    this.obj.userData.droppable = true;
    this.obj.userData.responsive = true;
    this.obj.position.y = this.originalY;
  }

  onEvent = e => {
    if (e.type == 'drop') {
      e.what[0].position.x = -2;
      e.what[0].position.z = 0;
      e.what[0].position.y += 20 * 0.02;
    }
  };

  componentDidMount() {
    this.props.context.add(this.obj, this.onEvent);
  }

  componentWillUnmount() {
    this.props.context.remove(this.obj);
  }

  render() {
    this.obj.position.x = -2;

    let cards = [];
    for (let i = 0; i < 20; i++) {
      cards.push(<Card key={i} responsive={false} x={-2} splayY={i * 0.02} />);
    }
    return cards;
  }
}

const Deck = props => (
  <UIContext.Consumer>
    {context => <DeckImpl {...props} context={context} />}
  </UIContext.Consumer>
);

export { Deck };
