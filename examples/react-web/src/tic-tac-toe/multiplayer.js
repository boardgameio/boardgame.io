/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import { Client } from 'boardgame.io/react';
import { Local } from 'boardgame.io/multiplayer';
import TicTacToe from './game';
import Board from './board';

const App = Client({
  game: TicTacToe,
  board: Board,
  multiplayer: Local(),
});

const Multiplayer = () => (
  <div>
    <h1>Multiplayer</h1>
    <div className="runner" style={{ maxWidth: '600px' }}>
      <div className="run">
        <App matchID="multi" playerID="0" />
        &lt;App playerID=&quot;0&quot;/&gt;
      </div>
      <div className="run">
        <App matchID="multi" playerID="1" />
        &lt;App playerID=&quot;1&quot;/&gt;
      </div>
    </div>
  </div>
);

export default Multiplayer;
