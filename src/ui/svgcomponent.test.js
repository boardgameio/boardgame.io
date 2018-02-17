/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { SvgComponent } from './svgcomponent';

Enzyme.configure({ adapter: new Adapter() });

const testcomponent = () => {
  return <div />;
};

test('rendering with or without x/y', () => {
  {
    const svgcomponent = Enzyme.mount(
      <SvgComponent component={testcomponent()} />
    );
    expect(svgcomponent.html()).toContain('translate(0, 0)');
  }
  {
    const svgcomponent = Enzyme.mount(
      <SvgComponent x={1} y={2} component={testcomponent()} />
    );
    expect(svgcomponent.html()).toContain('translate(1, 2)');
  }
});

test('onclick', () => {
  const onClick = jest.fn();
  const svgcomponent = Enzyme.mount(
    <SvgComponent component={testcomponent()} onClick={onClick} />
  );

  svgcomponent.simulate('click');

  expect(onClick).toHaveBeenCalled();
});
