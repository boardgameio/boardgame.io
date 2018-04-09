/*
 * Copyright 2018 The boardgame.io Authors.
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import Phases from './components/phases';
import { Basic } from './components/diagram';

const routes = [
  {
    path: '/phases',
    text: 'Phases',
    component: Phases,
  },
  {
    path: '/diagram',
    text: 'Diagram',
    component: Basic,
  },
];

export default routes;
