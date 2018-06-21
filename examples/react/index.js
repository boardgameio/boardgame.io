/*
 * Copyright 2017 The boardgame.io Authors.
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import { render } from 'react-dom';
import App from './modules/app';

render(
  <App />,
  document.getElementById('test') || document.createElement('div')
);

if (module.hot) {
  module.hot.accept();
}
