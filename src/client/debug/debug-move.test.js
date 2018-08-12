/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import { DebugMove, DebugMoveArgField } from './debug-move';
import { KeyboardShortcut } from './keyboard-shortcut';
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

Enzyme.configure({ adapter: new Adapter() });

test('parse arguments', () => {
  const spy = jest.fn();
  const root = Enzyme.mount(<DebugMove name="test" fn={spy} shortcut="e" />);

  root.instance().onSubmit('1,2');
  expect(spy.mock.calls[0]).toEqual([1, 2]);

  root.instance().onSubmit('["a", "b"], ","');
  expect(spy.mock.calls[1]).toEqual([['a', 'b'], ',']);

  root.instance().onSubmit('3, unknown, 4');
  expect(spy.mock.calls.length).toEqual(2);
  expect(root.state().error).toEqual('ReferenceError: unknown is not defined');
});

test('DebugMove', () => {
  const fn = jest.fn();
  const root = Enzyme.mount(<DebugMove fn={fn} name="endTurn" shortcut="e" />);

  root.simulate('click');
  root.find('.move span').simulate('keyDown', { key: 'Enter' });

  expect(fn.mock.calls.length).toBe(1);

  root.simulate('click');
  root.find('.move span').simulate('keydown', { key: '1' });
  root.find('.move span').simulate('keydown', { key: 'Enter' });

  expect(fn.mock.calls.length).toBe(2);
});

test('escape blurs DebugMove', () => {
  const root = Enzyme.mount(
    <KeyboardShortcut value="e">
      <DebugMoveArgField onSubmit={jest.fn()} name="endTurn" />
    </KeyboardShortcut>
  );

  expect(root.state().active).toBe(false);

  root.find(DebugMoveArgField).simulate('click');
  expect(root.state().active).toBe(true);
  root.find('.move span').simulate('keydown', { key: 'Escape' });
  expect(root.state().active).toBe(false);

  root.find(DebugMoveArgField).simulate('click');
  expect(root.state().active).toBe(true);
  root.find('.move span').simulate('blur');
  expect(root.state().active).toBe(false);
});
