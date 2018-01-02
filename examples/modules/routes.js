/*
 * Copyright 2017 The boardgame.io Authors.
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import core from './core';
import tic_tac_toe from './tic-tac-toe';
import chess from './chess';

const routes = [
  {
    name: 'Boardgame.io',
    routes: core.routes
  },
  {
    name: 'Tic-Tac-Toe',
    routes: tic_tac_toe.routes
  },
  {
    name: 'Chess',
    routes: chess.routes
  }
];

export default routes;
