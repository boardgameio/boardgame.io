/*
 * Copyright 2018 The boardgame.io Authors.
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import { Client } from 'boardgame.io/react';
import ChessGame from '../game';
import ChessBoard from './board';

const App = Client({
  game: ChessGame,
  board: ChessBoard,
  multiplayer: true,
  debug: false,
});

const Multiplayer = () => (
  <div style={{ padding: 50 }}>
    <App gameID="multi" playerID="0" />
    <App gameID="multi" playerID="1" />
  </div>
);

export default Multiplayer;
