/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import { render } from '@testing-library/react';
import { it } from 'vitest';
import App from './App';

it('renders without crashing', () => {
  render(<App />);
});
