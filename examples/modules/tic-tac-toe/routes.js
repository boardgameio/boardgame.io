/*
 * Copyright 2017 The boardgame.io Authors.
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import Singleplayer from './components/singleplayer';
import Multiplayer from './components/multiplayer';
import Spectator from './components/spectator';

const routes = [
  {
    path: '/tic-tac-toe',
    text: 'Singleplayer',
    component: Singleplayer
  },
  {
    path: '/tic-tac-toe/multiplayer',
    text: 'Multiplayer',
    component: Multiplayer
  },
  {
    path: '/tic-tac-toe/spectator',
    text: 'Spectator',
    component: Spectator
  }
];

export default routes;
