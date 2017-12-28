/*
 * Copyright 2017 Google Inc.
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import ChessPiece from './piece';
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

Enzyme.configure({ adapter: new Adapter() });

test('animation', () => {
  const piece = Enzyme.shallow(<ChessPiece x={1} y={2} type='b' color='dark'/>);
  piece.setState({ ... piece.state(),
                  'originX': 0,
                  'originY': 0,
                  'originTime': 0 });
  const inst = piece.instance();

  inst.animate(150)();
  expect(piece.state('x')).toBeCloseTo(0.032, 3);
  expect(piece.state('y')).toBeCloseTo(0.064, 3);

  inst.animate(375)();
  expect(piece.state('x')).toEqual(0.5);
  expect(piece.state('y')).toEqual(1.0, 1);

  inst.animate(600)();
  expect(piece.state('x')).toBeCloseTo(0.968, 3);
  expect(piece.state('y')).toBeCloseTo(1.936, 3);

  inst.animate(1000)();
  expect(piece.state('x')).toEqual(1);
  expect(piece.state('y')).toEqual(2);
});

test('props change', () => {
  const piece = Enzyme.shallow(<ChessPiece x={1} y={2} type='b' color='dark'/>);
  piece.setProps({x: 0, y: 2});
  expect(piece.state('originX')).toEqual(1);
  expect(piece.state('originY')).toEqual(2);

  piece.setProps({x: 0, y: 2});
  expect(piece.state('originX')).toEqual(1);
  expect(piece.state('originY')).toEqual(2);
});

test('handlers', () => {
  const onClick = jest.fn();
  const piece = Enzyme.mount(<ChessPiece x={0} y={0} type='b' color='light'
                              onClick={onClick}/>);

  piece.simulate('click');

  expect(onClick).toHaveBeenCalled();
});

test('bishop light is rendered', () => {
  const piece = Enzyme.mount(<ChessPiece x={0} y={0} type='b' color='light'/>);
  expect(piece.find('path').length).toBeGreaterThan(0);
});

test('bishop dark is rendered', () => {
  const piece = Enzyme.mount(<ChessPiece x={0} y={0} type='b' color='dark'/>);
  expect(piece.find('path').length).toBeGreaterThan(0);
});

test('king light is rendered', () => {
  const piece = Enzyme.mount(<ChessPiece x={0} y={0} type='k' color='light'/>);
  expect(piece.find('path').length).toBeGreaterThan(0);
});

test('king dark is rendered', () => {
  const piece = Enzyme.mount(<ChessPiece x={0} y={0} type='k' color='dark'/>);
  expect(piece.find('path').length).toBeGreaterThan(0);
});

test('knight light is rendered', () => {
  const piece = Enzyme.mount(<ChessPiece x={0} y={0} type='n' color='light'/>);
  expect(piece.find('path').length).toBeGreaterThan(0);
});

test('knight dark is rendered', () => {
  const piece = Enzyme.mount(<ChessPiece x={0} y={0} type='n' color='dark'/>);
  expect(piece.find('path').length).toBeGreaterThan(0);
});

test('pawn light is rendered', () => {
  const piece = Enzyme.mount(<ChessPiece x={0} y={0} type='p' color='light'/>);
  expect(piece.find('path').length).toBeGreaterThan(0);
});

test('pawn dark is rendered', () => {
  const piece = Enzyme.mount(<ChessPiece x={0} y={0} type='p' color='dark'/>);
  expect(piece.find('path').length).toBeGreaterThan(0);
});

test('queen light is rendered', () => {
  const piece = Enzyme.mount(<ChessPiece x={0} y={0} type='q' color='light'/>);
  expect(piece.find('path').length).toBeGreaterThan(0);
});

test('queen dark is rendered', () => {
  const piece = Enzyme.mount(<ChessPiece x={0} y={0} type='q' color='dark'/>);
  expect(piece.find('path').length).toBeGreaterThan(0);
});

test('rook light is rendered', () => {
  const piece = Enzyme.mount(<ChessPiece x={0} y={0} type='r' color='light'/>);
  expect(piece.find('path').length).toBeGreaterThan(0);
});

test('rook dark is rendered', () => {
  const piece = Enzyme.mount(<ChessPiece x={0} y={0} type='r' color='dark'/>);
  expect(piece.find('path').length).toBeGreaterThan(0);
});
