/*
 * Copyright 2017 The boardgame.io Authors.
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import DragDrop from './drag-n-drop';
import Test3D from './test3d';

const routes = [
  {
    path: '/ui/2d',
    text: 'Drag and Drop',
    component: DragDrop,
  },
  {
    path: '/ui/3d',
    text: '3D',
    component: Test3D,
  },
];

export default { routes };
