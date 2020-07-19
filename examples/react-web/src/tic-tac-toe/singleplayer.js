/*
 * Copyright 2017 The boardgame.io Authors.
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import { Client } from 'boardgame.io/react';
import { Debug } from 'boardgame.io/debug';
import TicTacToe from './game';
import Board from './board';

const App = Client({
  game: TicTacToe,
  board: Board,
  debug: { impl: Debug },
});

const Singleplayer = () => (
  <div>
    <h1>Singleplayer</h1>
    <App matchID="single" />
  </div>
);

export default Singleplayer;
