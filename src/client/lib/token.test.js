/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import Token from './token';
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

Enzyme.configure({ adapter: new Adapter() });

test('animation', () => {
  const token = Enzyme.shallow(
    <Token x={1} y={2} animate={true}><p>foo</p></Token>);
  token.setState({ ... token.state(),
                  'originX': 0,
                  'originY': 0,
                  'originTime': 0 });
  const inst = token.instance();

  inst._animate(150)();
  expect(token.state('x')).toBeCloseTo(0.032, 3);
  expect(token.state('y')).toBeCloseTo(0.064, 3);

  inst._animate(375)();
  expect(token.state('x')).toEqual(0.5);
  expect(token.state('y')).toEqual(1.0);

  inst._animate(600)();
  expect(token.state('x')).toBeCloseTo(0.968, 3);
  expect(token.state('y')).toBeCloseTo(1.936, 3);

  inst._animate(1000)();
  expect(token.state('x')).toEqual(1);
  expect(token.state('y')).toEqual(2);
});

test('props change', () => {
  const token = Enzyme.shallow(
    <Token x={1} y={2} animate={true}><p>foo</p></Token>);
  token.setProps({x: 0, y: 2});
  expect(token.state('originX')).toEqual(1);
  expect(token.state('originY')).toEqual(2);

  token.setProps({x: 0, y: 2});
  expect(token.state('originX')).toEqual(1);
  expect(token.state('originY')).toEqual(2);
});

test('handlers', () => {
  const onClick = jest.fn();
  const token = Enzyme.mount(
    <Token x={0} y={0} animate={false} onClick={onClick}><p>foo</p></Token>);

  token.simulate('click');

  expect(onClick).toHaveBeenCalled();
});

test('other coordinates', () => {
  let polar = (props) => {
    return {x: props.r * Math.cos(props.teta),
            y: props.r * Math.sin(props.teta)};
  };

  const token = Enzyme.shallow(
    <Token r={1} teta={Math.PI / 6} _coordinateFn={polar}><p>foo</p></Token>);

  expect(token.state('x')).toBeCloseTo(Math.sqrt(3) / 2, 3);
  expect(token.state('y')).toBeCloseTo(0.5, 3);
});
