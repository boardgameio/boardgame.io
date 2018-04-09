/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import Queen from './queen';
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

Enzyme.configure({ adapter: new Adapter() });

test('queen white is rendered', () => {
  const piece = Enzyme.mount(<Queen color="w" />);
  expect(piece.find('path').length).toBeGreaterThan(0);
});

test('queen black is rendered', () => {
  const piece = Enzyme.mount(<Queen color="b" />);
  expect(piece.find('path').length).toBeGreaterThan(0);
});
