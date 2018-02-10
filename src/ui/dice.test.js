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
    const dice = Enzyme.shallow(<Dice className="custom" />);
    expect(dice.html()).toContain('custom');
  }
  {
    const dice = Enzyme.shallow(<Dice dotStyle={false} faceValue={1} />); // renders plain text instead of styled dots
    expect(dice.html()).toContain(1);
  }
});

test('state change', () => {
  {
    const dice = Enzyme.mount(<Dice faceValue={4} />);
    dice.setProps({ faceValue: 1 });
    expect(dice.state().faceValue).toBe(1);
    dice.setProps({ faceValue: 1 });
    expect(dice.state().faceValue).toBe(1);
  }
});

test('onClick', () => {
  {
    const dice = Enzyme.mount(<Dice faceValue={4} />);
    expect(dice.state().faceValue).toBe(4);
  }
  {
    const onClick = jest.fn();
    const dice = Enzyme.mount(<Dice onClick={onClick} faceValue={4} />);
    dice.simulate('click');
    expect(onClick).toHaveBeenCalled();
    expect(dice.state().faceValue).not.toBe(0);
  }
  {
    const onClick = jest.fn();
    const dice = Enzyme.mount(<Dice onClick={null} faceValue={4} />);
    dice.simulate('click');
    expect(onClick).not.toHaveBeenCalled();
    expect(dice.state().faceValue).not.toBe(0);
  }
  {
    const onClick = jest.fn();
    const dice = Enzyme.mount(<Dice onClick={onClick} faceValue={4} />);
    dice.simulate('click');
    expect(dice.state().faceValue).not.toBe(0);
  }
});
