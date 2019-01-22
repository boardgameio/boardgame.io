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
import { UI, Card, Deck } from 'boardgame.io/ui';
import { Grid } from '../../../src/ui/3d/grid';
import { Token } from '../../../src/ui/3d/token';

function handler(type, fn) {
  return arg => {
    console.log(type + ': ' + JSON.stringify(arg));
    if (fn) fn(arg);
  };
}

class Board extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      deck: [],
      free: true,
    };
  }

  onClick = ({ x, y }) => {
    console.log(x + ' ' + y);
  };

  render() {
    return (
      <UI three={true}>
        <div style={{ marginBottom: 20 }}>Drag the card into the deck</div>

        <Grid rows={8} cols={8} onClick={this.onClick}>
          <Token
            x={1}
            y={1}
            mesh="https://raw.githubusercontent.com/SuperiorJT/Threejs-Chess/master/assets/models/Bishop.obj"
          />
        </Grid>
      </UI>
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
