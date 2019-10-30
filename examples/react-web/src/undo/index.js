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
  multiplayer: Local(),
});

const View = () => (
  <div style={{ padding: 50 }}>
    <App playerID="0" />
    <App playerID="1" />
  </div>
);

const routes = [
  {
    path: '/undo/main',
    text: 'Examples',
    component: View,
  },
];

export default { routes };
