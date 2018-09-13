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
  };

  constructor(props) {
    super(props);

    /**
     * Set of callbacks that children of this element pass via context.subscribeToMouseEvents
     * in order to receive mouse events that pertain to the objects that they manage.
     * @private
     */
    this.callbacks_ = {};

    /**
     * Reference to the root div element.
     * @private
     */
    this.ref_ = React.createRef();

    // Set up scene.

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xffffff);

    // Set up renderer.

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    // Set up camera.

    this.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.z = 7;
    this.camera.position.y = 10;
    this.camera.lookAt(new THREE.Vector3());
    this.scene.add(this.camera);

    // Set up lights.

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

    // Set up ground.

    const geometry = new THREE.PlaneBufferGeometry(100, 100);
    const material = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const plane = new THREE.Mesh(geometry, material);
    plane.receiveShadow = true;
    plane.lookAt(plane.up);
    this.scene.add(plane);

    const helper = new THREE.GridHelper(2000, 2000);
    helper.material.opacity = 0.1;
    helper.material.transparent = true;
    helper.position.y = 0.01;
    this.scene.add(helper);

    this.childGroup = new THREE.Group();
    this.scene.add(this.childGroup);
  }

  setupMouseEvents() {
    const mouse = new THREE.Vector2();
    this.raycaster = new THREE.Raycaster();

    const onGenericMouseEvent = e => {
      this.raycaster.setFromCamera(mouse, this.camera);
      this.raycaster.intersectObjects(this.childGroup.children).forEach(obj => {
        const callback = this.callbacks_[obj.object.id];
        if (callback) {
          callback(e);
        }
      });
    };

    const onMouseMove = e => {
      let x = e.clientX;
      let y = e.clientY;

      let el = document.getElementById('bgio-canvas');
      while (el && el.offsetLeft) {
        x -= el.offsetLeft;
        y -= el.offsetTop;
        el = el.offsetParent;
      }

      mouse.x = x / window.innerWidth * 2 - 1;
      mouse.y = -(y / window.innerHeight) * 2 + 1;

      onGenericMouseEvent(e);
    };

    const onMouseWheel = e => {
      onGenericMouseEvent(e);

      if (e.defaultPrevented) {
        return;
      }

      if (e.wheelDelta > 0) {
        this.camera.zoom += 0.5;
        this.camera.updateProjectionMatrix();
      } else if (this.camera.zoom > 0.5) {
        this.camera.zoom -= 0.5;
        this.camera.updateProjectionMatrix();
      }

      e.preventDefault();
    };

    const root = this.ref_.current;
    root.addEventListener('mousemove', onMouseMove);
    root.addEventListener('wheel', onMouseWheel);
    root.addEventListener('mousedown', onGenericMouseEvent);
    root.addEventListener('mouseup', onGenericMouseEvent);
    root.addEventListener('click', onGenericMouseEvent);
  }

  animate = () => {
    requestAnimationFrame(this.animate);
    TWEEN.update();
    this.renderer.render(this.scene, this.camera);
  };

  add = (obj, callback) => {
    this.childGroup.add(obj);

    if (callback !== undefined) {
      this.callbacks_[obj.id] = callback;
    }
  };

  getContext = () => {
    return {
      three: true,
      add: this.add,
      remove: obj => this.scene.remove(obj),
      scene: this.scene,
      camera: this.camera,
    };
  };

  componentDidMount() {
    this.renderer.domElement.id = 'bgio-canvas';
    this.ref_.current.appendChild(this.renderer.domElement);
    this.setupMouseEvents();
    this.animate();
  }

  render() {
    return (
      <UIContext.Provider value={this.getContext()}>
        <div className="bgio-ui" ref={this.ref_}>
          {this.props.children}
        </div>
      </UIContext.Provider>
    );
  }
}
