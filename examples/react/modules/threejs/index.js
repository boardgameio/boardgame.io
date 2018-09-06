/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import * as THREE from 'three';
import { Client } from 'boardgame.io/client';
import TicTacToe from '../tic-tac-toe/game';
import './main.css';

class App extends React.Component {
  state = {};

  constructor(props) {
    super(props);

    this.client = Client({ game: TicTacToe });

    this.client.subscribe(() => {
      const { ctx } = this.client.getState();
      if (ctx.gameover) {
        this.setState({ gameover: ctx.gameover });
      }
    });

    this.ref = null;
    this.scene = new THREE.Scene();
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.mouse = new THREE.Vector2();
    this.raycaster = new THREE.Raycaster();
    this.rotation = 0;
    this.cubes = [];
  }

  createScene() {
    const scene = this.scene;
    scene.background = new THREE.Color(0xffffff);

    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 5;
    camera.position.x = 12;
    camera.position.y = 15;
    scene.add(camera);
    this.camera = camera;

    for (let i = 0; i < 9; i++) {
      const geometry = new THREE.BoxGeometry(1, 1, 1);
      const material = new THREE.MeshLambertMaterial({ color: 0xcccccc });
      const cube = new THREE.Mesh(geometry, material);
      const r = Math.floor(i / 3);
      const c = i % 3;
      cube.position.z = -c * 2;
      cube.position.x = r * 2;
      cube.userData.i = i;
      scene.add(cube);
      this.cubes.push(cube);
    }

    this.camera.lookAt(this.cubes[4].position);

    let light = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(light);

    light = new THREE.DirectionalLight(0x555555);
    scene.add(light);
  }

  animate = () => {
    requestAnimationFrame(this.animate);

    const { G } = this.client.getState();

    this.cubes.filter(c => G.cells[c.userData.i] == '0').forEach(c => {
      c.material.color.setHex(0xff0000);
      c.rotation.x = this.rotation;
    });

    this.cubes.filter(c => G.cells[c.userData.i] == '1').forEach(c => {
      c.material.color.setHex(0x00ff00);
      c.rotation.y = -this.rotation;
    });

    this.rotation += 0.03;
    this.renderer.render(this.scene, this.camera);
  };

  onMouseMove = e => {
    const x = e.clientX - this.ref.offsetParent.offsetLeft;
    const y = e.clientY;
    this.mouse.x = x / window.innerWidth * 2 - 1;
    this.mouse.y = -(y / window.innerHeight) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const highlightedCubes = this.raycaster.intersectObjects(this.cubes);

    if (highlightedCubes.length > 0) {
      this.ref.style.cursor = 'pointer';
    } else {
      this.ref.style.cursor = '';
    }

    this.cubes.forEach(c => {
      c.userData.highlight = false;
      c.material.color.setHex(0xcccccc);
    });

    highlightedCubes.forEach(c => {
      c.object.material.color.setHex(0xaaaaaa);
    });
  };

  onMouseDown = () => {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    this.raycaster.intersectObjects(this.cubes).forEach(cube => {
      this.client.moves.clickCell(cube.object.userData.i);
    });
  };

  componentDidMount() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.ref.appendChild(this.renderer.domElement);
    this.createScene();
    this.animate();
  }

  render() {
    let text = '';
    if (this.state.gameover) {
      if (this.state.gameover.draw) text = 'draw';
      if (this.state.gameover.winner == '0') text = 'winner: red';
      if (this.state.gameover.winner == '1') text = 'winner: green';
    }

    return (
      <div
        className="root"
        onMouseDown={this.onMouseDown}
        onMouseMove={this.onMouseMove}
        ref={e => (this.ref = e)}
      >
        <div className="text">{text}</div>
      </div>
    );
  }
}

const routes = [
  {
    path: '/threejs/main',
    text: 'threejs',
    component: App,
  },
];

export default {
  routes,
};
