/*
 * Copyright 2017 Google Inc.
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import { restore } from '../../both/action-creators';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import { Debug, DebugMove, KeyboardShortcut } from './debug.js';
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

Enzyme.configure({ adapter: new Adapter() });

const gamestate = {
  G: {},
  ctx: {}
};

test('is rendered', () => {
  const debug = Enzyme.mount(
      <Debug gamestate={gamestate} endTurn={() => {}} gameid="default" />);

  const titles = debug.find('h3').map(title => title.text());
  expect(titles).toEqual(['actions', 'state']);
});

test('parse arguments', () => {
  const spy = jest.fn();
  const root = Enzyme.mount(
      <DebugMove name='test' fn={spy} />
  );

  root.instance().span.innerText = '1,2';
  root.instance().onSubmit();
  expect(spy.mock.calls[0]).toEqual([1, 2]);

  root.instance().span.innerText = '3, unknown, 4';
  root.instance().onSubmit();
  expect(spy.mock.calls[1]).toEqual([3, undefined, 4]);
});

test('simulate shortcut', () => {
  const fn = jest.fn();
  const root = Enzyme.mount(
      <KeyboardShortcut value='e'>
        <DebugMove fn={fn} name='endTurn' />
      </KeyboardShortcut>
  );

  root.find(DebugMove).simulate('click');
  root.find('.move span').simulate('keyDown', {key: 'Enter'});

  expect(fn.mock.calls.length).toBe(1);

  root.find(DebugMove).simulate('click');
  root.find('.move span').simulate('keydown', {key: '1'});
  root.find('.move span').simulate('keydown', {key: 'Enter'});

  expect(fn.mock.calls.length).toBe(2);
});

test('escape blurs DebugMove', () => {
  const root = Enzyme.mount(
      <KeyboardShortcut value='e'>
        <DebugMove fn={jest.fn()} name='endTurn' />
      </KeyboardShortcut>
  );

  expect(root.state().active).toBe(false);

  root.find(DebugMove).simulate('click');
  expect(root.state().active).toBe(true);
  root.find('.move span').simulate('keydown', {key: 'Escape'});
  expect(root.state().active).toBe(false);

  root.find(DebugMove).simulate('click');
  expect(root.state().active).toBe(true);
  root.find('.move span').simulate('blur');
  expect(root.state().active).toBe(false);
});

test('shortcuts are unique a-z', () => {
  const moveAPI = {
    'takeCard': () => {},
    'takeToken': () => {},
  };

  const element = React.createElement(Debug, {
    gamestate,
    endTurn: () => {},
    moveAPI,
    gameid: 'default',
  });

  const instance = Enzyme.mount(element).instance();

  expect(instance.shortcuts).toEqual({
    'takeCard': 'a',
    'takeToken': 'b',
  });
});

test('shortcuts are unique first char', () => {
  const moveAPI = {
    'clickCell': () => {},
    'takeCard': () => {},
  };

  const element = React.createElement(Debug, {
    gamestate,
    endTurn: () => {},
    moveAPI,
    gameid: 'default',
  });

  const instance = Enzyme.mount(element).instance();

  expect(instance.shortcuts).toEqual({
    'clickCell': 'c',
    'takeCard': 't',
  });
});

test('save / restore', () => {
  let loggedAction = null;
  const store = createStore((state, action) => {
    loggedAction = action;
  });

  const debug = Enzyme.mount(
      <Provider store={store}>
      <Debug gamestate={gamestate} endTurn={() => {}} gameid="default" />
      </Provider>
  );

  const restoredState = { restore: true };
  const restoredJSON = JSON.stringify(restoredState);
  const setItem = jest.fn();
  const getItem = jest.fn(() => restoredJSON);
  window.localStorage = { setItem, getItem };

  debug.find('.key-box').at(0).simulate('click');
  expect(setItem).toHaveBeenCalled();

  debug.find('.key-box').at(1).simulate('click');
  expect(getItem).toHaveBeenCalled();

  expect(loggedAction).toEqual(restore(restoredState));
});
