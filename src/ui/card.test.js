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
  {
    const card = Enzyme.shallow(<Card isFaceUp />);
    expect(card.html()).toBe(
      '<div class="bgio-card"><div class="bgio-card__front">Card</div></div>'
    );
  }

  {
    const card = Enzyme.shallow(<Card isDraggable />);
    expect(card.html()).toContain('react-draggable');
  }

  {
    const card = Enzyme.shallow(<Card isFaceUp className="custom" />);
    expect(card.html()).toBe(
      '<div class="bgio-card custom"><div class="bgio-card__front">Card</div></div>'
    );
  }
});

test('handlers', () => {
  const onMouseOver = jest.fn();
  const onClick = jest.fn();
  const card = Enzyme.mount(
    <Card onMouseOver={onMouseOver} onClick={onClick} />
  );

  card.simulate('mouseover');
  card.simulate('click');

  expect(onMouseOver).toHaveBeenCalled();
  expect(onClick).toHaveBeenCalled();
});
