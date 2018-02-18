/*
 * Copyright 2018 The boardgame.io Authors.
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import Multiplayer from './components/multiview';
import Singleplayer from './components/singleview';

const routes = [
  {
    path: '/liars-dice/singleplayer',
    text: 'Random Rolls',
    component: Singleplayer,
  },
  {
    path: '/liars-dice/multiplayer',
    text: 'Secret Info',
    component: Multiplayer,
  },
];

export default routes;
