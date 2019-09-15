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

class MockChild extends React.Component {
  render() {
    return <rect width="3" height="2" style={{ fill: 'red' }} />;
  }
}

test('render correctly', () => {
  const grid = Enzyme.mount(
    <Grid rows={3} cols={4} style={{ width: '500px' }}>
      <MockChild />
    </Grid>
  );
  expect(grid.html()).toContain('4 3');
  expect(grid.html()).toContain('width: 500px');
  expect(grid.html()).toContain('rect');
});

test('no outline', () => {
  const grid = Enzyme.mount(<Grid rows={3} cols={4} outline={false} />);
  expect(grid.html()).not.toContain('rect');
});

test('click handler', () => {
  {
    const onClick = jest.fn();
    const grid = Enzyme.mount(<Grid rows={3} cols={4} onClick={onClick} />);
    grid
      .find('Square')
      .at(0)
      .simulate('click');
    expect(onClick).toHaveBeenCalled();
  }

  // No crash when onClick is not provided.
  {
    const grid = Enzyme.mount(<Grid rows={3} cols={4} />);
    grid
      .find('Square')
      .at(0)
      .simulate('click');
  }
});

test('mouse over handler', () => {
  {
    const onMouseOver = jest.fn();
    const grid = Enzyme.mount(
      <Grid rows={3} cols={4} onMouseOver={onMouseOver} />
    );
    grid
      .find('Square')
      .at(0)
      .simulate('mouseOver');
    expect(onMouseOver).toHaveBeenCalled();
  }

  // No crash when onMouseOver is not provided.
  {
    const grid = Enzyme.mount(<Grid rows={3} cols={4} />);
    grid
      .find('Square')
      .at(0)
      .simulate('mouseOver');
  }
});

test('mouse out handler', () => {
  {
    const onMouseOut = jest.fn();
    const grid = Enzyme.mount(
      <Grid rows={3} cols={4} onMouseOut={onMouseOut} />
    );
    grid
      .find('Square')
      .at(0)
      .simulate('mouseOut');
    expect(onMouseOut).toHaveBeenCalled();
  }

  // No crash when onMouseOut is not provided.
  {
    const grid = Enzyme.mount(<Grid rows={3} cols={4} />);
    grid
      .find('Square')
      .at(0)
      .simulate('mouseOut');
  }
});

test('correct x and y', () => {
  const grid = Enzyme.mount(
    <Grid rows={3} cols={4} style={{ width: '500px' }}>
      <Token x={1} y={2}>
        <MockChild />
      </Token>
    </Grid>
  );
  expect(grid.html()).toContain('1, 2');

  // No crash when componentWillUnmount
  {
    grid
      .find('Square')
      .at(12)
      .instance()
      .componentWillUnmount();
  }
});

test('colorMap', () => {
  const colorMap = { '0,0': 'red' };
  const grid = Enzyme.mount(<Grid rows={1} cols={1} colorMap={colorMap} />);
  expect(grid.html()).toContain('fill: red');
});
