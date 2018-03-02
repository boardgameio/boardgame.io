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
import { WheatSVG, WoodSVG, MeepleSVG, Disc3DSVG } from './svgcomponent';

Enzyme.configure({ adapter: new Adapter() });

[
  <WheatSVG key={1} />,
  <WoodSVG key={2} />,
  <MeepleSVG key={3} />,
  <Disc3DSVG key={4} />,
].forEach(component => {
  test('rendering with or without x/y', () => {
    {
      const svgcomponent = Enzyme.mount(component);
      expect(svgcomponent.html()).toContain('translate(0, 0)');
    }
  });
});

test('rendering with or without x/y', () => {
  const svgcomponent = Enzyme.mount(<WheatSVG _center={{ x: 1, y: 2 }} />);
  expect(svgcomponent.html()).toContain('translate(1, 2)');
});

test('onclick', () => {
  const onClick = jest.fn();
  const svgcomponent = Enzyme.mount(<WheatSVG onClick={onClick} />);

  svgcomponent.simulate('click');

  expect(onClick).toHaveBeenCalled();
});
