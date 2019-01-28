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
// example and source use different modules, so direct to source modules here to make THREE.js global.
var THREE = (window.THREE = require('../../../../node_modules/three'));
require('../../../../node_modules/three/examples/js/loaders/OBJLoader');

class Board extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      deck: [],
      free: true,
      loading: true,
    };
  }

  onClick = ({ x, y }) => {
    console.log(x + ' ' + y);
  };

  componentDidMount() {
    this.loader = new THREE.OBJLoader();
    this.loader.load(bishop, out => {
      this.setState({
        bishop: out,
      });
    });

    this.loader.load(knight, out => {
      this.setState({
        knight: out,
      });
    });
  }

  render() {
    return (
      <div>
        <div style={{ marginBottom: 20 }}>Showing chess pieces on the grid</div>
        <UI three={true}>
          <Grid rows={8} cols={8} onClick={this.onClick}>
            <Token
              x={3}
              y={3}
              mesh={this.state.knight}
              onClick={this.onClick}
              key={1}
            />
            <Token
              x={2}
              y={3}
              mesh={this.state.bishop}
              onClick={this.onClick}
              key={2}
            />
          </Grid>
        </UI>
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
