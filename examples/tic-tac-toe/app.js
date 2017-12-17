/*
 * Copyright 2017 Google Inc.
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import { render } from 'react-dom';
import Client from 'boardgame.io/client';
import { TicTacToe, Board } from './tic-tac-toe';
import './app.css';

export const App = Client({
  game: TicTacToe,
  board: Board,
  multiplayer: true,
});

render(<App/>, document.getElementById('app') ||
               document.createElement('div'));

if (module.hot) {
  module.hot.accept();
}
