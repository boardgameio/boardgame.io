/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import { GameInfo } from './gameinfo';
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

Enzyme.configure({ adapter: new Adapter() });

test('isMultiplayer', () => {
  const root = Enzyme.mount(<GameInfo isMultiplayer={true} />);
  expect(root.html()).toContain('isConnected');
  expect(root.html()).toContain('isMultiplayer');
});
