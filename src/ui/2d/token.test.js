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

test('click', () => {
  const onDrag = jest.fn();
  const onClick = jest.fn();
  const grid = Enzyme.mount(
    <Grid rows={2} cols={2} onClick={onClick}>
      <Token
        x={0}
        y={0}
        draggable={true}
        shouldDrag={() => true}
        onDrag={onDrag}
        onClick={onClick}
      >
        <circle r={0.25} />
      </Token>
    </Grid>
  );

  // Workaround because of JSDOM quirks
  grid.getDOMNode().getScreenCTM = () => ({
    inverse: () => ({ a: 1, b: 1, c: 1, d: 1 }),
  });
  grid.getDOMNode().addEventListener = () => {};
  grid.getDOMNode().removeEventListener = () => {};
  const token = grid.find('Token');
  const preventDefault = () => {};
  token.instance()._startDrag({ preventDefault, pageX: 1, pageY: 2 });
  token.instance()._drag({ preventDefault, pageX: 1, pageY: 2 });
  token.instance()._endDrag({ preventDefault });
  // Browser always send an onClick after dropping.
  token.instance()._onClick({});

  expect(onDrag).toHaveBeenCalled();
  expect(onClick).toHaveBeenCalled();
});

test('drag and drop - desktop', () => {
  const onDrag = jest.fn();
  const onDrop = jest.fn();
  const onClick = jest.fn();
  const grid = Enzyme.mount(
    <Grid rows={2} cols={2}>
      <Token
        x={0}
        y={0}
        draggable={true}
        shouldDrag={() => true}
        onDrag={onDrag}
        onDrop={onDrop}
        onClick={onClick}
      >
        <circle r={0.25} />
      </Token>
    </Grid>
  );

  // Workaround because of JSDOM quirks
  grid.getDOMNode().getScreenCTM = () => ({
    inverse: () => ({ a: 1, b: 1, c: 1, d: 1 }),
  });
  grid.getDOMNode().addEventListener = () => {};
  grid.getDOMNode().removeEventListener = () => {};
  const token = grid.find('Token');
  const preventDefault = () => {};
  token.instance()._startDrag({ preventDefault, pageX: 1, pageY: 2 });
  token.instance()._drag({ preventDefault, pageX: 200, pageY: 200 });
  token.instance()._endDrag({ preventDefault });
  // Browser always send an onClick after dropping, must be ignored.
  token.instance()._onClick({});

  expect(onDrag).toHaveBeenCalled();
  expect(onDrop).toHaveBeenCalled();
  expect(onClick).not.toHaveBeenCalled();
});

test('drag and drop - mobile', () => {
  const onDrop = jest.fn();
  const onClick = jest.fn();
  const grid = Enzyme.mount(
    <Grid rows={2} cols={2}>
      <Token
        x={0}
        y={0}
        draggable={true}
        shouldDrag={() => true}
        onDrop={onDrop}
        onClick={onClick}
      >
        <circle r={0.25} />
      </Token>
    </Grid>
  );

  // Workaround because of JSDOM quirks
  grid.getDOMNode().getScreenCTM = () => ({
    inverse: () => ({ a: 1, b: 1, c: 1, d: 1 }),
  });
  grid.getDOMNode().addEventListener = () => {};
  grid.getDOMNode().removeEventListener = () => {};
  const token = grid.find('Token');
  const preventDefault = () => {};
  token
    .instance()
    ._startDrag({ preventDefault, touches: [{ pageX: 1, pageY: 2 }] });
  token
    .instance()
    ._drag({ preventDefault, touches: [{ pageX: 200, pageY: 200 }] });
  token.instance()._endDrag({ preventDefault });

  expect(onDrop).toHaveBeenCalled();
  expect(onClick).not.toHaveBeenCalled();
});

test('ignore drag and drop events of non-dragged element', () => {
  const onDrag = jest.fn();
  const onDrop = jest.fn();
  const onClick = jest.fn();
  const grid = Enzyme.mount(
    <Grid rows={2} cols={2}>
      <Token
        x={0}
        y={0}
        draggable={true}
        shouldDrag={() => true}
        onDrag={onDrag}
        onDrop={onDrop}
        onClick={onClick}
      >
        <circle r={0.25} />
      </Token>
    </Grid>
  );

  // Workaround because of JSDOM quirks
  grid.getDOMNode().getScreenCTM = () => ({
    inverse: () => ({ a: 1, b: 1, c: 1, d: 1 }),
  });
  grid.getDOMNode().addEventListener = () => {};
  grid.getDOMNode().removeEventListener = () => {};
  const token = grid.find('Token');
  const preventDefault = () => {};
  token
    .instance()
    ._drag({ preventDefault, touches: [{ pageX: 200, pageY: 200 }] });
  token.instance()._endDrag({ preventDefault });

  expect(onDrag).not.toHaveBeenCalled();
  expect(onDrop).not.toHaveBeenCalled();
  expect(onClick).not.toHaveBeenCalled();
});

class MockComponent extends React.Component {
  state = { show: true };
  _shouldDrag = () => true;
  render() {
    const token = (
      <Token x={0} y={0} draggable={true} shouldDrag={this._shouldDrag}>
        <circle r={0.25} />
      </Token>
    );
    return (
      <Grid rows={2} cols={2}>
        {this.state.show ? token : null}
      </Grid>
    );
  }
}

test('unmount regression', () => {
  const grid = Enzyme.mount(<MockComponent />);
  grid.setState({ show: false });
  grid.setState({ show: true });
  grid.find('Token').setState({ dragged: true });
  grid.unmount();
});
