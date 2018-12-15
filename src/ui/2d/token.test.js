/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import { Grid } from './grid';
import { Token } from './token';
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

Enzyme.configure({ adapter: new Adapter() });

test('animation', () => {
  const token = Enzyme.shallow(
    <Token x={1} y={2} animate={true}>
      <p>foo</p>
    </Token>
  );
  token.setState({
    ...token.state(),
    originX: 0,
    originY: 0,
    originTime: 0,
  });
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
  const token = Enzyme.mount(
    <Token x={1} y={2} animate={true}>
      <p>foo</p>
    </Token>
  );
  token.setProps({ x: 0, y: 2 });
  expect(token.state('originX')).toEqual(1);
  expect(token.state('originY')).toEqual(2);
});

test('debounce', () => {
  const token = Enzyme.mount(
    <Token x={1} y={2} animate={true}>
      <p>foo</p>
    </Token>
  );
  token.setProps({ x: 0, y: 2 });
  expect(token.state('originX')).toEqual(1);
  expect(token.state('originY')).toEqual(2);

  token.setProps({ x: 0, y: 2 });
  expect(token.state('originX')).toEqual(1);
  expect(token.state('originY')).toEqual(2);
});

test('click handler', () => {
  const onClick = jest.fn();
  const token = Enzyme.mount(
    <Token x={0} y={0} animate={false} onClick={onClick}>
      <p>foo</p>
    </Token>
  );

  token.simulate('click');

  expect(onClick).toHaveBeenCalled();
});

test('mouse over handler', () => {
  const onMouseOver = jest.fn();
  const token = Enzyme.mount(
    <Token x={0} y={0} animate={false} onMouseOver={onMouseOver}>
      <p>foo</p>
    </Token>
  );

  token.simulate('mouseOver');

  expect(onMouseOver).toHaveBeenCalled();
});

test('mouse out handler', () => {
  const onMouseOut = jest.fn();
  const token = Enzyme.mount(
    <Token x={0} y={0} animate={false} onMouseOut={onMouseOut}>
      <p>foo</p>
    </Token>
  );

  token.simulate('mouseOut');

  expect(onMouseOut).toHaveBeenCalled();
});

test('shouldDrag', () => {
  const shouldDrag = jest.fn();
  const grid = Enzyme.mount(
    <Grid rows={2} cols={2}>
      <Token x={0} y={0} draggable={true} shouldDrag={shouldDrag}>
        <circle r={0.25} />
      </Token>
    </Grid>
  );

  const mouseDownEvt = new window['MouseEvent']('mousedown', {});
  grid
    .find('Token')
    .getDOMNode()
    .dispatchEvent(mouseDownEvt);

  expect(shouldDrag).toHaveBeenCalled();
});

test('drag and drop', () => {
  const onDrag = jest.fn();
  const onDrop = jest.fn();
  const grid = Enzyme.mount(
    <Grid rows={2} cols={2}>
      <Token
        x={0}
        y={0}
        draggable={true}
        shouldDrag={() => true}
        onDrag={onDrag}
        onDrop={onDrop}
      >
        <circle r={0.25} />
      </Token>
    </Grid>
  );

  // Workaround because of JSDOM quirks
  grid.getDOMNode().getScreenCTM = () => ({
    inverse: () => ({ a: 0, b: 0, c: 0, d: 0 }),
  });
  grid.getDOMNode().addEventListener = () => {};
  grid.getDOMNode().removeEventListener = () => {};
  const mouseDownEvt = new window['MouseEvent']('mousedown', {
    pageX: 1,
    pageY: 2,
  });
  const token = grid.find('Token');
  token.getDOMNode().dispatchEvent(mouseDownEvt);
  token.instance()._drag(mouseDownEvt);
  token.instance()._endDrag(mouseDownEvt);
  token.instance().UNSAFE_componentWillUnmount();

  expect(onDrag).toHaveBeenCalled();
  expect(onDrop).toHaveBeenCalled();
});
