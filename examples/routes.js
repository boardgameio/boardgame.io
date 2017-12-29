/*
 * Copyright 2017 Google Inc.
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import Singleplayer from './singleplayer';
import Multiplayer from './multiplayer';
import Spectator from './spectator';

const routes = [
  {
    path: '/',
    text: 'Tic-Tac-Toe',
    component: Singleplayer
  },
  {
    path: '/multiplayer',
    text: 'Multiplayer',
    component: Multiplayer
  },
  {
    path: '/spectator',
    text: 'Spectator',
    component: Spectator
  }
];

export default routes;
