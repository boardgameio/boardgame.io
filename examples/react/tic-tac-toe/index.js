/*
 * Copyright 2017 The boardgame.io Authors.
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import Singleplayer from './singleplayer';
import Multiplayer from './multiplayer';
import Spectator from './spectator';
import Authenticated from './authenticated';

const routes = [
  {
    path: '/',
    text: 'Singleplayer',
    component: Singleplayer,
  },
  {
    path: '/multiplayer',
    text: 'Multiplayer',
    component: Multiplayer,
  },
  {
    path: '/authenticated',
    text: 'Authenticated',
    component: Authenticated,
  },
  {
    path: '/spectator',
    text: 'Spectator',
    component: Spectator,
  },
];

export default { routes };
