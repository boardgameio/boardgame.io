/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import Checkerboard from './checkerboard';
import Token from '../../../../src/ui/token';
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

Enzyme.configure({ adapter: new Adapter() });

test('render squares correctly', () => {
  const grid = Enzyme.mount(<Checkerboard />);
  expect(grid.find('rect').length).toEqual(64);
});

test('position', () => {
  const grid = Enzyme.shallow(<Checkerboard>
    <Token square="b5">
      <circle r="0.25" fill="red"/>
    </Token>
  </Checkerboard>);
  expect(grid.html()).toContain('translate(1,3)')
});

test('click', () => {
  const onClick = jest.fn();
  const grid = Enzyme.mount(<Checkerboard onClick={onClick}/>);
  grid.find('rect').at(5).simulate('click');
  expect(onClick).toHaveBeenCalledWith({ square: 'a3' });
});

test('invalid square', () => {
  let invalidSquare = () => {
    Enzyme.shallow(<Checkerboard/>).instance().algebraicCord({square: '*1'})
  };
  expect(invalidSquare).toThrow();
});

test('colorMap', () => {
  const grid = Enzyme.mount(<Checkerboard highlightedSquares={{'a5': 'blue'}}/>);
  expect(grid.find('rect').at(3).html()).toContain('blue');
});
