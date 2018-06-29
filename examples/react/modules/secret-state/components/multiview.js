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
        <App gameID="secret-state" playerID="0" />
        &lt;App playerID=&quot;0&quot;/&gt;
      </div>
      <div className="run">
        <App gameID="secret-state" playerID="1" />
        &lt;App playerID=&quot;1&quot;/&gt;
      </div>
      <div className="run">
        <App gameID="secret-state" playerID="2" />
        &lt;App playerID=&quot;2&quot;/&gt;
      </div>
      <div className="run">
        <App gameID="secret-state" />
        &lt;App/&gt;
      </div>
    </div>
  </div>
);

export default Multiview;
