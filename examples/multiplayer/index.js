/*
 * Copyright 2017 Google Inc.
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import Client from 'boardgame.io/client';
import { TicTacToe } from '../tic-tac-toe/game';
import { Board } from '../tic-tac-toe';

const App = Client({
  game: TicTacToe,
  board: Board,
  debug: false,
  multiplayer: true,
});

export const Multiplayer = () => (
  <div className="runner">
    <div className="run">
      <App gameID="multi" playerID="0" />
    </div>
    <div className="run">
      <App gameID="multi" playerID="1" />
    </div>
  </div>
);
