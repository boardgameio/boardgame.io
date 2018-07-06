/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import { PlayerInfo } from './playerinfo';
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

Enzyme.configure({ adapter: new Adapter() });

describe('PlayerInfo', () => {
  const ctx = {
    numPlayers: 2,
    currentPlayer: '0',
  };

  test('click', () => {
    const fn = jest.fn();
    const root = Enzyme.mount(<PlayerInfo ctx={ctx} onClick={fn} />);
    expect(fn).not.toHaveBeenCalled();
    root
      .find('.player')
      .at(0)
      .simulate('click');
    expect(root.html()).not.toContain('active');
    expect(fn).toHaveBeenCalled();
  });

  test('click while active', () => {
    const fn = jest.fn();
    const root = Enzyme.mount(
      <PlayerInfo ctx={ctx} onClick={fn} playerID="0" />
    );
    expect(fn).not.toHaveBeenCalled();
    root
      .find('.player')
      .at(0)
      .simulate('click');
    expect(root.html()).toContain('active');
    expect(fn).toHaveBeenCalled();
  });
});
