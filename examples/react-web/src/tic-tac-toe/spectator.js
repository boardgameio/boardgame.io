/*
 * Copyright 2017 The boardgame.io Authors.
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import { Client } from 'boardgame.io/react';
import { SocketIO } from 'boardgame.io/multiplayer';
import TicTacToe from './game';
import Board from './board';

const hostname = window.location.hostname;
const App = Client({
  game: TicTacToe,
  board: Board,
  debug: false,
  multiplayer: SocketIO({ server: `${hostname}:8000` }),
});

const Spectator = () => (
  <div>
    <h1>Spectator</h1>
    <div className="runner">
      <div className="run">
        <App matchID="spectator" playerID="0" />
        &lt;App playerID=&quot;0&quot;/&gt;
      </div>
      <div className="run">
        <App matchID="spectator" playerID="1" />
        &lt;App playerID=&quot;1&quot;/&gt;
      </div>
      <div className="run">
        <App matchID="spectator" />
        Spectator
      </div>
    </div>
  </div>
);

export default Spectator;
