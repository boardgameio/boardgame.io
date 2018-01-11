/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import Bishop from './bishop';
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

Enzyme.configure({ adapter: new Adapter() });

test('bishop white is rendered', () => {
  const piece = Enzyme.mount(<Bishop color='w'/>);
  expect(piece.find('path').length).toBeGreaterThan(0);
});

test('bishop black is rendered', () => {
  const piece = Enzyme.mount(<Bishop color='b'/>);
  expect(piece.find('path').length).toBeGreaterThan(0);
});
