/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-syle
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import PropTypes from 'prop-types';
import UIContext from '../ui-context';
import * as THREE from 'three';

/**
 * Token
 *
 * Component that represents a board game piece (or token).
 * Can be used by itself or with one of the grid systems
 * provided (Grid or HexGrid).
 *
 * A token renders as a 3D Mesh. IF no mesh prop is passed.
 * It will render a white box on the grid.
 *
 * Props:
 *   x       - X coordinate on grid / hex grid.
 *   y       - Y coordinate on grid / hex grid.
 *   z       - Z coordinate on hex grid.
 *   onClick - Called when the token is clicked.
 *   onMouseOver - Called when the token is mouse over.
 *   onMouseOut - Called when the token is mouse out.
 *
 * Usage:
 *
 * <Grid rows={8} cols={8}>
 *   <Token x={1} y={2}/>
 * </Grid>
 *
 * <Grid rows={8} cols={8}>
 *   <Token x={1} y={2} size={0.5}/>
 * </Grid>
 *
 * <HexGrid>
 *   <Token x={1} y={2} z={-3}/>
 * </HexGrid>
 *
 * <Grid rows={8} cols={8}>
 *   <Token x={1} y={2} mesh={THREE.js 3D-Object}/>
 * </Grid>
 *
 */
export const Token = props => (
  <UIContext.Consumer>
    {context => <TokenImpl {...props} context={context} />}
  </UIContext.Consumer>
);

class TokenImpl extends React.Component {
  static propTypes = {
    x: PropTypes.number,
    y: PropTypes.number,
    z: PropTypes.number,
    mesh: PropTypes.any,
    padding: PropTypes.number,
    size: PropTypes.number,
    lift: PropTypes.number,
    boardSize: PropTypes.number,
    parent: PropTypes.instanceOf(THREE.Object3D),
    context: PropTypes.object,
    animate: PropTypes.bool,
    onClick: PropTypes.func,
    onMouseOver: PropTypes.func,
    onMouseOut: PropTypes.func,
    children: PropTypes.element,
    animationDuration: PropTypes.number,
  };

  static defaultProps = {
    animationDuration: 750,
    size: 1,
    padding: 0.1,
    lift: 0.1,
  };

  constructor(props) {
    super();

    if (!props.size) {
      this.size = props.boardSize;
    } else {
      this.size = props.size;
    }

    if (props.parent) {
      this.parent = props.parent;
    } else {
      this.parent = props.context;
    }
  }

  _attachMesh = mesh => {
    const size = this.size;
    let meshSize = new THREE.Vector3();
    let meshCenter = new THREE.Vector3();
    const bbox = new THREE.Box3().setFromObject(mesh);
    bbox.getSize(meshSize);
    bbox.getCenter(meshCenter);
    // determine the scale factor
    let scale = meshSize.z < meshSize.x ? meshSize.x : meshSize.z;
    scale = size / scale;
    mesh.scale.set(scale, scale, scale);
    // set the mesh to the ground
    if (this.props.boardSize && this.props.lift && this.props.padding) {
      mesh.position.x =
        this.props.x * (this.props.boardSize + this.props.padding);
      mesh.position.z =
        this.props.y * (this.props.boardSize + this.props.padding);
      mesh.position.y = -bbox.min.y + this.props.lift;
    } else {
      mesh.position.x = this.props.x;
      mesh.position.z = this.props.y;
      mesh.position.y = -bbox.min.y;
    }
    this.parent.add(mesh);
    // register the event
    const onEvent = e => {
      if (e.type == 'click') {
        this.props.onClick({ x: this.props.x, y: this.props.y });
      } else if (e.type == 'mouseOver') {
        this.props.onMouseOver({ x: this.props.x, y: this.props.y });
      } else if (e.type == 'mouseOut') {
        this.props.onMouseOut({ x: this.props.x, y: this.props.y });
      }
    };
    this.props.context.regCall(mesh, onEvent);
  };

  componentWillUnmount() {
    this.parent.remove(this.prevMesh);
  }

  render() {
    let mesh = this.props.mesh;

    if (this.prevMesh && this.prevMesh === mesh) return null;

    if (!mesh) {
      mesh = new THREE.Mesh(
        new THREE.BoxBufferGeometry(1, 1 * 0.3, 1),
        new THREE.MeshLambertMaterial({ color: '#eeeeee' })
      );
      this._attachMesh(mesh);
    } else if (mesh.isObject3D) {
      this._attachMesh(mesh);
    } else {
      console.error('Your input to tokens should be an three js 3d object');
    }
    this.parent.remove(this.prevMesh);
    this.prevMesh = mesh;

    return null;
  }
}
