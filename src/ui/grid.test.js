/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import Grid from './grid';
import Token from './token';
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

Enzyme.configure({ adapter: new Adapter() });

class MockChild extends React.Component {
  render() {
    return <rect width="3" height="2" style={{fill: 'red'}}/>;
  }
}

test('render correctly', () => {
  const grid = Enzyme.mount(
    <Grid rows={3} cols={4} style={{width: '500px'}}>
      <MockChild />
    </Grid>);
  expect(grid.html()).toContain('4 3');
  expect(grid.html()).toContain('width: 500px');
  expect(grid.html()).toContain('rect');
});

test('add coordinateFn correctly', () => {
  const grid = Enzyme.shallow(
    <Grid rows={3} cols={4} style={{width: '500px'}}>
      <MockChild />
    </Grid>);
  expect(grid.find(MockChild).prop('_coordinateFn')).not.toEqual(undefined);
});

test('correct x and y', () => {
  const grid = Enzyme.mount(
    <Grid rows={3} cols={4} style={{width: '500px'}}>
      <Token x={100} y={200}>
        <MockChild />
      </Token>
    </Grid>);
  expect(grid.html()).toContain('100,200');
});
