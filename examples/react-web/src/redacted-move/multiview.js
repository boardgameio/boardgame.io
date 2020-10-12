/*
 * Copyright 2018 The boardgame.io Authors.
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import { Client } from 'boardgame.io/react';
import { Local } from 'boardgame.io/multiplayer';
import Game from './game';
import Board from './board';

const App = Client({
  game: Game,
  numPlayers: 2,
  board: Board,
  debug: false,
  multiplayer: Local(),
});

const Multiview = () => (
  <div style={{ padding: 50 }}>
    <h1>Redacted Moves</h1>
    <p>
      This examples demonstrates the use of redacted moves. Using redacted moves
      allows for secret information to be stripped from the log for other
      players.
    </p>
    <p>
      Clicking the button on one of the players, you should see complete log
      event for that player but a redacted one for everyone else.
    </p>
    <div className="runner">
      <div className="run">
        <App matchID="redacted-move" playerID="0" />
        &lt;App playerID=&quot;0&quot;/&gt;
      </div>
      <div className="run">
        <App matchID="redacted-move" playerID="1" />
        &lt;App playerID=&quot;1&quot;/&gt;
      </div>
      <div className="run">
        <App matchID="redacted-move" />
        &lt;App/&gt;
      </div>
    </div>
  </div>
);

export default Multiview;
