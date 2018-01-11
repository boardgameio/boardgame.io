/*
 * Copyright 2018 The boardgame.io Authors.
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import singleplayer from './components/singleplayer';

const routes = [
  {
    path: '/chess',
    text: 'Singleplayer',
    component: singleplayer
  }
];

export default routes;
