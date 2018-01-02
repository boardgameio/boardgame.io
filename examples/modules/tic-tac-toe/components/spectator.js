/*
 * Copyright 2017 Google Inc.
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import Client from 'boardgame.io/client';
import TicTacToe from '../../../game';
import Board from './board';

const App = Client({
  game: TicTacToe,
  board: Board,
  debug: false,
  multiplayer: true
});

const Spectator = () => (
  <div style={{padding: 50}}>
    <h1>Tic-Tac-Toe: E-Sports Edition</h1>
    <p>#E-Sports Ready</p>
    <p>But seriously, the idea of the &quot;spectator&quot; board is you could actually display a game board that isn&apos;t a &quot;client&quot;, so that people could sit around a bigger screen, using their phones as private &quot;hands&quot; and the bigger screen as the &quot;game table&quot;. The possibilities are on limited by YOUR IMAGINATION.</p>
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
        Spectator
      </div>
    </div>
  </div>
);

export default Spectator;
