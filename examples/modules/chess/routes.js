/*
 * Copyright 2018 The boardgame.io Authors.
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import Singleplayer from './components/singleplayer';
import Multiplayer from './components/multiplayer';

const routes = [
  {
    path: '/chess/singleplayer',
    text: 'Singleplayer',
    component: Singleplayer,
  },
  {
    path: '/chess/multiplayer',
    text: 'Multiplayer',
    component: Multiplayer,
  },
];

export default routes;
