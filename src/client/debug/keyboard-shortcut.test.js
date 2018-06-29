/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import { KeyboardShortcut } from './keyboard-shortcut';
import Mousetrap from 'mousetrap';
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

Enzyme.configure({ adapter: new Adapter() });

jest.mock('mousetrap', () => {
  let keys = {};

  return {
    bind: (key, fn) => {
      keys[key] = fn;
    },
    unbind: key => {
      delete keys[key];
    },
    simulate: key => {
      keys[key]({
        preventDefault: () => {},
      });
    },
  };
});

test('KeyboardShortcut', () => {
  const fn = jest.fn();
  Enzyme.mount(<KeyboardShortcut value="e" onPress={fn} />);
  Mousetrap.simulate('e');
  expect(fn).toHaveBeenCalled();
});
