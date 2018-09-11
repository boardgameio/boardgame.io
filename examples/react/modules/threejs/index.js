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

function Init(root) {
  const client = Client({ game: TicTacToe });

  // Set up scene.

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xffffff);

  // Set up renderer.

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);

  // Add nine cubes.

  let cubes = [];
  for (let i = 0; i < 9; i++) {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshLambertMaterial({ color: 0xcccccc });
    const cube = new THREE.Mesh(geometry, material);
    const r = Math.floor(i / 3);
    const c = i % 3;
    cube.position.z = -c * 2;
    cube.position.x = r * 2;
    cube.userData.i = i;
    cubes.push(cube);
    scene.add(cube);
  }

  // Set up camera.

  const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.z = 5;
  camera.position.x = 12;
  camera.position.y = 15;
  camera.lookAt(cubes[4].position);
  scene.add(camera);

  // Set up lights.

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
  scene.add(ambientLight);
  const directionalLight = new THREE.DirectionalLight(0x555555);
  scene.add(directionalLight);

  // Animation logic.

  let rotation = 0;
  function animate() {
    requestAnimationFrame(animate);

    const { G } = client.getState();

    cubes.filter(c => G.cells[c.userData.i] == '0').forEach(c => {
      c.material.color.setHex(0xff0000);
      c.rotation.x = rotation;
    });

    cubes.filter(c => G.cells[c.userData.i] == '1').forEach(c => {
      c.material.color.setHex(0x00ff00);
      c.rotation.y = -rotation;
    });

    rotation += 0.03;
    renderer.render(scene, camera);
  }

  // Mouse handling.

  const mouse = new THREE.Vector2();
  const raycaster = new THREE.Raycaster();

  function onMouseMove(e) {
    const { ctx } = client.getState();
    if (ctx.gameover !== undefined) {
      root.style.cursor = '';
      return;
    }

    const x = e.clientX - root.offsetParent.offsetLeft;
    const y = e.clientY;
    mouse.x = x / window.innerWidth * 2 - 1;
    mouse.y = -(y / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const highlightedCubes = raycaster.intersectObjects(cubes);

    cubes.forEach(c => {
      c.material.color.setHex(0xcccccc);
    });

    highlightedCubes.forEach(c => {
      c.object.material.color.setHex(0xaaaaaa);
    });

    if (highlightedCubes.length > 0) {
      root.style.cursor = 'pointer';
    } else {
      root.style.cursor = '';
    }
  }

  function onMouseDown() {
    raycaster.setFromCamera(mouse, camera);
    raycaster.intersectObjects(cubes).forEach(cube => {
      client.moves.clickCell(cube.object.userData.i);
    });
  }

  root.appendChild(renderer.domElement);
  root.addEventListener('mousemove', onMouseMove);
  root.addEventListener('mousedown', onMouseDown);

  animate();
}

const routes = [
  {
    path: '/threejs/main',
    text: 'threejs',
    component: class App extends React.Component {
      componentDidMount() {
        Init(this.ref);
      }
      render() {
        return (
          <div
            ref={el => {
              this.ref = el;
            }}
          />
        );
      }
    },
  },
];

export default {
  routes,
};
