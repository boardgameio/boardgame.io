/*
 * Copyright 2017 The boardgame.io Authors.
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import tic_tac_toe from './tic-tac-toe';
import chess from './chess';
import secret_state from './secret-state';
import random from './random';
import threejs from './threejs';
import lobby from './lobby';
import simulator from './simulator';
import redacted_move from './redacted-move';
import undo from './undo';

const routes = [
  {
    name: 'Tic-Tac-Toe',
    routes: tic_tac_toe.routes,
  },
  {
    name: 'Chess',
    routes: chess.routes,
  },
  {
    name: 'Turn Orders',
    routes: simulator.routes,
  },
  {
    name: 'Random API',
    routes: random.routes,
  },
  {
    name: 'Secret State',
    routes: secret_state.routes,
  },
  {
    name: 'Redacted Move',
    routes: redacted_move.routes,
  },
  {
    name: 'Undo',
    routes: undo.routes,
  },
  {
    name: 'Other Frameworks',
    routes: threejs.routes,
  },
  {
    name: 'Lobby',
    routes: lobby.routes,
  },
];

export default routes;
