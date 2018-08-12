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

const Multiplayer = () => (
  <div id="turn-order">
    <div style={{ padding: 50 }}>
      <p>
        The following example demonstrates how to use
        <strong> changeActionPlayers </strong>
        to allow multiple players to play in a single turn.
      </p>

      <p>
        Click on <strong> Play Militia</strong>, and the other players will have
        to each click on <strong> Drop Cards </strong> before the current player
        can end their turn.
      </p>

      <App gameID="TurnExample" />

      <div className="runner-vert">
        <div className="run">
          <App gameID="TurnExample" playerID="0" />
        </div>
        <div className="run">
          <App gameID="TurnExample" playerID="1" />
        </div>
        <div className="run">
          <App gameID="TurnExample" playerID="2" />
        </div>
      </div>
    </div>
  </div>
);

export default Multiplayer;
