/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import { HexGrid } from './hex';
import Token from './token';
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

Enzyme.configure({ adapter: new Adapter() });

test('render correctly', () => {
  const grid = Enzyme.mount(<HexGrid levels={5} />);
  expect(grid.html()).toContain('svg');
});

test('outline', () => {
  const grid = Enzyme.mount(<HexGrid levels={5} outline={false} />);
  const hex = grid.find('polygon');
  expect(hex.length).toBe(0);
});

test('click handler', () => {
  {
    const onClick = jest.fn();
    const grid = Enzyme.mount(<HexGrid layers={4} onClick={onClick} />);
    grid
      .find('Hex')
      .at(0)
      .simulate('click');
    expect(onClick).toHaveBeenCalled();
  }

  // No crash when onClick is not provided.
  {
    const grid = Enzyme.mount(<HexGrid layers={4} />);
    grid
      .find('Hex')
      .at(0)
      .simulate('click');
  }
});

test('child', () => {
  {
    const grid = Enzyme.mount(
      <HexGrid layers={2} outline={false}>
        <Token />
      </HexGrid>
    );
    expect(grid.html()).toContain('polygon');
  }

  {
    const grid = Enzyme.mount(
      <HexGrid layers={2} outline={false}>
        <Token>
          <div />
        </Token>
      </HexGrid>
    );
    expect(grid.html()).not.toContain('polygon');
  }
});

test('colorMap', () => {
  const colorMap = { '0,0,0': '#123' };
  const grid = Enzyme.mount(<HexGrid layers={1} colorMap={colorMap} />);
  expect(grid.html()).toContain('fill: #123');
});
