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
import * as THREE from 'three';
import TWEEN from '@tweenjs/tween.js';

/**
 * Root element of the React/threejs based 3D UI framework.
 */
export class UI extends React.Component {
  static propTypes = {
    children: PropTypes.any,
    onInit: PropTypes.func,
  };

  constructor(props) {
    super(props);

    this.ref = React.createRef();

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xffffff);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.z = 12;
    this.camera.position.y = 15;
    this.camera.lookAt(new THREE.Vector3());
    this.scene.add(this.camera);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    this.scene.add(ambientLight);

    const light = new THREE.DirectionalLight(0x555555);
    light.position.y = 50;
    light.shadow.camera.left = -10;
    light.shadow.camera.bottom = -10;
    light.shadow.camera.right = 10;
    light.shadow.camera.top = 10;
    light.castShadow = true;
    this.scene.add(light);

    const geometry = new THREE.PlaneBufferGeometry(100, 100);
    const material = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const plane = new THREE.Mesh(geometry, material);
    plane.receiveShadow = true;
    plane.position.y = -0.1;
    plane.lookAt(plane.up);
    this.scene.add(plane);

    const helper = new THREE.GridHelper(2000, 2000);
    helper.material.opacity = 0.25;
    helper.material.transparent = true;
    this.scene.add(helper);

    if (props.onInit) {
      this.props.onInit(this.scene, this.renderer);
    }

    this._nextID = 1;
  }

  setupMouseEvents() {
    const mouse = new THREE.Vector2();
    this.raycaster = new THREE.Raycaster();

    const onMouseMove = e => {
      const x = e.clientX - root.offsetParent.offsetLeft;
      const y = e.clientY;
      mouse.x = x / window.innerWidth * 2 - 1;
      mouse.y = -(y / window.innerHeight) * 2 + 1;

      // this.raycaster.setFromCamera(mouse, this.camera);
      // raycaster.intersectObjects(cubes);
    };

    const onMouseDown = () => {
      // this.raycaster.setFromCamera(mouse, this.camera);
      // raycaster.intersectObjects(cubes);
    };

    const onMouseWheel = e => {
      e.preventDefault();
      if (e.wheelDelta > 0) {
        this.camera.zoom += 0.5;
        this.camera.updateProjectionMatrix();
      } else if (this.camera.zoom > 0.5) {
        this.camera.zoom -= 0.5;
        this.camera.updateProjectionMatrix();
      }
    };

    const root = this.ref.current;
    root.addEventListener('mousemove', onMouseMove);
    root.addEventListener('mousedown', onMouseDown);
    root.addEventListener('wheel', onMouseWheel);
  }

  animate = () => {
    requestAnimationFrame(this.animate);
    TWEEN.update();
    this.renderer.render(this.scene, this.camera);
  };

  getContext = () => {
    return {
      three: true,
      scene: this.scene,
      camera: this.camera,
      genID: () => this._nextID++,
    };
  };

  componentDidMount() {
    this.ref.current.appendChild(this.renderer.domElement);
    this.setupMouseEvents();
    this.animate();
  }

  render() {
    return (
      <UIContext.Provider value={this.getContext()}>
        <div className="bgio-ui" ref={this.ref}>
          {this.props.children}
        </div>
      </UIContext.Provider>
    );
  }
}
