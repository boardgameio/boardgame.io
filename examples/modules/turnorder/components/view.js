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

const App = Client({
  game: TurnExample,
  numPlayers: 3,
  board: Board,
  multiplayer: true,
});

const Multiplayer = () => (
  <div>
    <div className="runner" style={{ justifyContent: 'flex-start' }}>
      <div className="run">
        <App gameID="TurnExample" playerID="0" />
        &lt;App playerID=&quot;0&quot;/&gt;
      </div>
      <div className="run">
        <App gameID="TurnExample" playerID="1" />
        &lt;App playerID=&quot;1&quot;/&gt;
      </div>
      <div className="run">
        <App gameID="TurnExample" playerID="2" />
        &lt;App playerID=&quot;2&quot;/&gt;
      </div>
    </div>
  </div>
);

export default Multiplayer;
