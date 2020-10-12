/*
 * Copyright 2018 The boardgame.io Authors.
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import Singleplayer from './singleplayer';
import Multiplayer from './multiplayer';

const routes = [
  {
    path: '/chess/singleplayer',
    text: 'Singleplayer',
    component: Singleplayer,
  },
  {
    path: '/chess/multiplayer0',
    text: 'Multiplayer (Player 0)',
    component: Multiplayer('0'),
  },
  {
    path: '/chess/multiplayer1',
    text: 'Multiplayer (Player 1)',
    component: Multiplayer('1'),
  },
  {
    path: '/chess/multiplayer',
    text: 'Multiplayer (Spectator)',
    component: Multiplayer(),
  },
];

export default { routes };
