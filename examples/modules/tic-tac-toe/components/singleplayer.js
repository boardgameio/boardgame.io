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
  board: Board
});

const Singleplayer = () => (
  <div style={{padding: 50}}>
    <h1>Hotseat Tic-Tac-Toe</h1>
    <p>Because tic-tac-toe just <b>needs</b> to be played on a computer....</p>
    <App gameID="single" />
  </div>
);

export default Singleplayer;
