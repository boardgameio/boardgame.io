/*
 * Copyright 2018 The boardgame.io Authors.
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import { Client } from 'boardgame.io/react';
import Game from '../game';
import Board from './board';

const App = Client({
  game: Game,
  numPlayers: 3,
  board: Board,
  debug: false,
  multiplayer: true,
});

const Multiview = () => (
  <div style={{ padding: 50 }}>
    <h1>Secret Info</h1>
    <div className="runner">
      <div className="run">
        &lt;App playerID=&quot;0&quot;/&gt;
        <App gameID="liarsDice" playerID="0" />
      </div>
      <div className="run">
        &lt;App playerID=&quot;1&quot;/&gt;
        <App gameID="liarsDice" playerID="1" />
      </div>
      <div className="run">
        &lt;App playerID=&quot;2&quot;/&gt;
        <App gameID="liarsDice" playerID="2" />
      </div>
      <div className="run">
        Spectator View
        <App gameID="liarsDice" />
      </div>
    </div>
  </div>
);

export default Multiview;
