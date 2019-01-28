/*
 * Copyright 2018 The boardgame.io Authors.
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import { Client } from 'boardgame.io/react';
import { Game } from 'boardgame.io/core';
import { UI, Grid, Token } from 'boardgame.io/ui';
import bishop from './chess3d/pieces/bishop3d.obj';
import knight from './chess3d/pieces/knight3d.obj';
var THREE = (window.THREE = require('three'));
require('three/examples/js/loaders/OBJLoader');
import './loading.css';

class Board extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      deck: [],
      free: true,
      loading: true,
    };

    THREE.DefaultLoadingManager.onStart = (url, itemsLoaded, itemsTotal) => {
      console.log(
        'Started loading file: ' +
          url +
          '.\nLoaded ' +
          itemsLoaded +
          ' of ' +
          itemsTotal +
          ' files.'
      );
    };
    THREE.DefaultLoadingManager.onLoad = () => {
      this.setState({ loading: false });
      console.log('Loading Complete!');
    };

    THREE.DefaultLoadingManager.onProgress = function(
      url,
      itemsLoaded,
      itemsTotal
    ) {
      console.log(
        'Loading file: ' +
          url +
          '.\nLoaded ' +
          itemsLoaded +
          ' of ' +
          itemsTotal +
          ' files.'
      );
    };

    THREE.DefaultLoadingManager.onError = function(url) {
      console.log('There was an error loading ' + url);
    };

    this.loader = new THREE.OBJLoader();
    this.loader.load(bishop, out => {
      this.bishop = out;
      console.log('loaded bishop');
    });

    this.loader.load(knight, out => {
      console.log('loaded knight');
      this['knight'] = out;
    });
    //set up loading
    this.loader = <div className="loader" />;
  }

  onClick = ({ x, y }) => {
    console.log(x + ' ' + y);
  };

  render() {
    const ui = (
      <UI three={true}>
        <Grid rows={8} cols={8} onClick={this.onClick}>
          <Token
            x={3}
            y={3}
            mesh={this.knight}
            onClick={this.onClick}
            key={1}
          />
          <Token
            x={2}
            y={3}
            mesh={this.bishop}
            onClick={this.onClick}
            key={2}
          />
        </Grid>
      </UI>
    );

    return (
      <div>
        <div style={{ marginBottom: 20 }}>Drag the card into the deck</div>
        {this.state.loading ? this.loader : ui}
      </div>
    );
  }
}

const App = Client({
  game: Game({}),
  board: Board,
  debug: false,
});

const Singleplayer = () => (
  <div style={{ padding: 50 }}>
    <App gameID="single" />
  </div>
);

export default Singleplayer;
