/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import Phases from './phases';

Enzyme.configure({ adapter: new Adapter() });

test('basic', () => {
  const game = Enzyme.mount(<Phases />);
  const board = game.find('Board');
  expect(board.props().G.deck).toBe(5);
});
