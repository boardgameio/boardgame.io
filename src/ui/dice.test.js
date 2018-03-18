/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import { Dice } from './dice';
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

Enzyme.configure({ adapter: new Adapter() });

test('basic', () => {
  {
    const dice = Enzyme.shallow(<Dice />);
    expect(dice.html()).toContain('div');
  }
  {
    const dice = Enzyme.shallow(<Dice dotStyle={false} value={1} />); // renders plain text instead of styled dots
    expect(dice.text()).toContain(1);
  }
});

test('className manipulation', () => {
  {
    const dice = Enzyme.shallow(<Dice className="custom" />);
    expect(
      dice
        .find('div')
        .first()
        .hasClass('custom')
    ).toBe(true);
  }
  {
    const dice = Enzyme.shallow(<Dice />);
    expect(
      dice
        .find('div')
        .first()
        .hasClass('custom')
    ).toBe(false);
  }
});

test('onClick', () => {
  {
    const onClick = jest.fn();
    const dice = Enzyme.mount(<Dice onClick={onClick} value={4} />);
    dice.simulate('click');
    expect(onClick).toHaveBeenCalled();
  }
  {
    const onClick = jest.fn();
    const dice = Enzyme.mount(<Dice onClick={null} value={4} />);
    dice.simulate('click');
    expect(onClick).not.toHaveBeenCalled();
  }
});
