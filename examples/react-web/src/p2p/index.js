/*
 * Copyright 2021 The boardgame.io Authors.
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import P2P from './p2p';

const routes = [
  {
    path: '/p2p/tic-tac-toe',
    text: 'Tic-Tac-Toe',
    component: P2P,
  },
];

export default { routes };
