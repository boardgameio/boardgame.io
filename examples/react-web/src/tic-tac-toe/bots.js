/*
 * Copyright 2017 The boardgame.io Authors.
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import { Client } from 'boardgame.io/react';
import { Local } from 'boardgame.io/multiplayer';
import { MCTSBot } from 'boardgame.io/ai';
import TicTacToe from './game';
import Board from './board';

const App = Client({
  game: TicTacToe,
  board: Board,
  debug: false,
  multiplayer: Local({
    bots: {
      1: MCTSBot,
    },
  }),
});

const Bots = () => (
  <div>
    <h1>Singleplayer vs AI</h1>
    <App playerID="0" matchID="single-vs-ai" />
  </div>
);

export default Bots;
