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
    onMouseEvent: PropTypes.func,
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
    const material = new THREE.MeshLambertMaterial({ color: 0xeeeeee });
    const plane = new THREE.Mesh(geometry, material);
    plane.receiveShadow = true;
    plane.lookAt(plane.up);
    plane.position.y = -0.01;
    this.plane = plane;
    this.scene.add(plane);

    const helper = new THREE.GridHelper(2000, 2000);
    helper.material.opacity = 0.1;
    helper.material.transparent = true;
    this.scene.add(helper);

    this.childGroup = new THREE.Group();
    this.scene.add(this.childGroup);
  }

  setupMouseEvents() {
    // List of objects currently being dragged.
    let dragging_ = [];

    // The 2D viewport co-ordinates of the mouse.
    const mouse = new THREE.Vector2();

    // Raycaster that's used to calculate objects that the
    // mouse intersects.
    this.raycaster = new THREE.Raycaster();

    const getClickType = e => {
      if (e.which !== undefined) {
        switch (e.which) {
          case 1:
            return 'leftclick';
          case 2:
            return 'middleclick';
          case 3:
            return 'rightclick';
        }
      }

      if (e.button !== undefined) {
        switch (e.button) {
          case 0:
            return 'leftclick';
          case 1:
            return 'middleclick';
          case 2:
            return 'rightclick';
        }
      }
    };

    const dispatchMouseCallbacks = (e, objects) => {
      if (objects === undefined) {
        this.raycaster.setFromCamera(mouse, this.camera);
        objects = this.raycaster.intersectObjects(
          this.childGroup.children,
          true
        );
      }

      if (this.props.onMouseEvent) {
        this.props.onMouseEvent(e, objects);
      }

      objects.forEach(obj => {
        e.point = obj.point;
        if (obj.object.id in this.callbacks_) {
          this.callbacks_[obj.object.id](e);
        }
        if (obj.object.parent.id in this.callbacks_) {
          this.callbacks_[obj.object.parent.id](e);
        }
      });
    };

    const onMouseDown = e => {
      const type = getClickType(e);

      this.raycaster.setFromCamera(mouse, this.camera);
      const objects = this.raycaster.intersectObjects(
        this.childGroup.children,
        true
      );

      if (type == 'leftclick') {
        dragging_ = objects.filter(
          obj => obj.object.userData.draggable && obj.object.userData.responsive
        );
      } else {
        e = { ...e, type };
      }

      dispatchMouseCallbacks(e, objects);

      if (dragging_.length > 0) {
        dragging_ = [dragging_[0]];
        dispatchMouseCallbacks({ ...e, type: 'dragStart' }, dragging_);
      }
    };

    const onMouseUp = e => {
      this.raycaster.setFromCamera(mouse, this.camera);
      const objects = this.raycaster.intersectObjects(
        this.childGroup.children,
        true
      );

      dispatchMouseCallbacks(e, objects);

      if (dragging_.length > 0) {
        const droppable = objects.filter(
          obj => obj.object.userData.droppable && obj.object.userData.responsive
        );

        if (droppable.length > 0) {
          const what = dragging_.map(o => o.object);
          dispatchMouseCallbacks({ ...e, type: 'drop', what }, droppable);
        }

        dispatchMouseCallbacks({ ...e, type: 'dragEnd' }, dragging_);
        dragging_ = [];
      }
    };

    const onMouseMove = e => {
      let x = e.clientX;
      let y = e.clientY;

      const el = document.getElementById('bgio-canvas');

      let t = el;
      while (t) {
        if (t.offsetLeft) x -= t.offsetLeft;
        if (t.offsetTop) y -= t.offsetTop;
        t = t.offsetParent;
      }

      t = el;
      while (t) {
        if (t.scrollLeft) x += t.scrollLeft;
        if (t.scrollTop) y += t.scrollTop;
        t = t.parentNode;
      }

      mouse.x = (x / window.innerWidth) * 2 - 1;
      mouse.y = -(y / window.innerHeight) * 2 + 1;

      dispatchMouseCallbacks(e);

      this.raycaster.setFromCamera(mouse, this.camera);
      const r = this.raycaster.intersectObject(this.plane);

      if (r.length > 0) {
        const e = { ...e, type: 'drag' };
        dragging_.forEach(obj => {
          e.point = r[0].point;
          if (obj.object.id in this.callbacks_) {
            this.callbacks_[obj.object.id](e);
          }
          if (obj.object.parent.id in this.callbacks_) {
            this.callbacks_[obj.object.parent.id](e);
          }
        });
      }
    };

    const onMouseWheel = e => {
      dispatchMouseCallbacks(e);

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
    root.addEventListener('mousedown', onMouseDown);
    root.addEventListener('mouseup', onMouseUp);
    root.addEventListener('click', dispatchMouseCallbacks);
    root.addEventListener('contextmenu', e => e.preventDefault());
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
