/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-syle
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import PropTypes from 'prop-types';
let THREE = window.THREE = require('three');
require('three/examples/js/loaders/OBJLoader');
require('three/examples/js/loaders/GLTFLoader');

// Not yet implemented.
export class Token extends React.Component {
  static propTypes = {
    x: PropTypes.number,
    y: PropTypes.number,
    z: PropTypes.number,
    mesh: PropTypes.any,
    padding: PropTypes.number,
    size: PropTypes.number,
    lift: PropTypes.number,
    parrent: PropTypes.instanceOf(THREE.Object3D),
    ui: PropTypes.object,
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
    mesh: new THREE.Mesh(
      new THREE.BoxBufferGeometry(1,1*0.3,1),
      new THREE.MeshLambertMaterial({color:'#eeeeee'}),
    ),
  };

  _attachMesh = mesh => {
    const size = this.props.size;
    let meshSize = new THREE.Vector3();
    let meshCenter = new THREE.Vector3();
    const bbox = new THREE.Box3().setFromObject(mesh);
    bbox.getSize(meshSize);
    bbox.getCenter(meshCenter);
    // determine the scale factor
    let scale = meshSize.z < meshSize.x ? meshSize.x : meshSize.z;
    scale = size / scale;
    mesh.scale.set(scale, scale, scale);
    // reset the center to (0,0,0)
    mesh.translateX(-meshCenter.x*scale);
    mesh.translateY(-meshCenter.y*scale);
    mesh.translateZ(-meshCenter.z*scale);
    // move the object to the location in the board
    const lift = this.props.lift + scale*meshSize.y / 2;
    mesh.translateX(this.props.x * (this.props.size + this.props.padding));
    mesh.translateZ(this.props.y * (this.props.size + this.props.padding));
    mesh.translateY(lift);
    this.props.parrent.add(mesh);
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
    this.props.ui.regCall(mesh, onEvent);
  };


  componentWillUnmount() {
    this.props.parrent.remove(this.prevMesh);
  }

  render() {
    let mesh = this.props.mesh;
    
    if(this.prevMesh === mesh)
      return null;

    if(!mesh){
      mesh=new THREE.Mesh(
        new THREE.BoxBufferGeometry(1,1*0.3,1),
        new THREE.MeshLambertMaterial({color:'#eeeeee'}));
    }else if (mesh instanceof THREE.Object3D) {
      this._attachMesh(mesh);
    } else if (mesh.type) {
      if (mesh.type ==='obj'){
        const loader = new THREE.OBJLoader();
        loader.load(mesh.url, this._attachMesh);
      }
      else if (mesh.type === 'gltf'){
        const loader = new THREE.GLTFLoader();
        loader.load(mesh.url,this._attachMesh);
      }
    } else {
      console.error('Illegal input Mesh')
    }
    this.props.parrent.remove(this.prevMesh);
    this.prevMesh = mesh;

    return null;
  }
}
