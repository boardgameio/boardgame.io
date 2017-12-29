/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import Client from 'boardgame.io/client';
import TicTacToe from '../tic-tac-toe/game';
import Board from '../tic-tac-toe/board';

const App = Client({
  game: TicTacToe,
  board: Board,
  debug: false,
  multiplayer: true
});

const Spectator = () => (
  <div>
    <div className="runner">
      <div className="run">
        <App gameID="spectator" playerID="0" />
        &lt;App playerID=&quot;0&quot;/&gt;
      </div>
      <div className="run">
        <App gameID="spectator" playerID="1" />
        &lt;App playerID=&quot;1&quot;/&gt;
      </div>
      <div className="run">
        <App gameID="spectator" />
        <div>&lt;App/&gt;</div>
      </div>
    </div>
  </div>
);

export default Spectator;
