/*
 * Copyright 2018 The boardgame.io Authors.
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import { Client } from 'boardgame.io/react';
import TurnExample from '../game';
import Board from './board';
import './view.css';

const App = Client({
  game: TurnExample,
  numPlayers: 3,
  board: Board,
  multiplayer: true,
});

const style = { border: '1px solid black' };
const Multiplayer = () => (
  <div>
    <div className="runner" style={{ justifyContent: 'flex-start' }}>
      <div className="run">
        <App gameID="TurnExample" />
      </div>
      <div className="runner-vert">
        <div className="run" style={style}>
          <App gameID="TurnExample" playerID="0" />
        </div>
        <div className="run" style={style}>
          <App gameID="TurnExample" playerID="1" />
        </div>
        <div className="run" style={style}>
          <App gameID="TurnExample" playerID="2" />
        </div>
      </div>
    </div>
  </div>
);

export default Multiplayer;
