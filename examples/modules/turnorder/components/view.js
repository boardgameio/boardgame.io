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

const App = Client({
  game: TurnExample,
  numPlayers: 4,
  board: Board,
});

const SingleView = () => (
  <div style={{ padding: 50 }}>
    <App gameID="TurnExample" />
  </div>
);

export default SingleView;
