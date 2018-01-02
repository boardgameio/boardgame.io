/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import { Card } from './card';
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

Enzyme.configure({ adapter: new Adapter() });

test('is rendered', () => {
  const game = Enzyme.mount(<Card />);
  expect(game.text()).toBe('Card');
});

test('handlers', () => {
  const onHover = jest.fn();
  const onClick = jest.fn();
  const card = Enzyme.mount(<Card onHover={onHover} onClick={onClick} />);

  card.simulate('mouseover');
  card.simulate('click');

  expect(onHover).toHaveBeenCalled();
  expect(onClick).toHaveBeenCalled();
});
