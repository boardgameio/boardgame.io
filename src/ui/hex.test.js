/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import { HexGrid } from './hex';
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

Enzyme.configure({ adapter: new Adapter() });

test('render correctly', () => {
  const grid = Enzyme.mount(<HexGrid radius={5} />);
  expect(grid.html()).toContain('svg');
});

test('click', () => {
  const grid = Enzyme.mount(<HexGrid radius={5} />);
  const hex = grid.find('polygon').at(0);
  expect(hex.html()).toContain('fill="#fff"');
  hex.simulate('click');
  expect(hex.html()).toContain('fill="#aaa"');
});

test('outline', () => {
  const grid = Enzyme.mount(<HexGrid radius={5} outline={false} />);
  const hex = grid.find('polygon');
  expect(hex.length).toBe(0);
});
