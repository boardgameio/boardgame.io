/*
 * Copyright 2017 Google Inc.
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import { restore, makeMove, endTurn } from '../../both/action-creators';
import Game from '../../both/game';
import { createGameReducer } from '../../both/reducer';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import { GameLog, Debug, DebugMove, KeyboardShortcut } from './debug.js';
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

Enzyme.configure({ adapter: new Adapter() });

const gamestate = {
  G: {},
  ctx: {},
  log: [],
  _initial: {
    G: {},
    ctx: {},
    log: [],
  },
};

test('basic', () => {
  const debug = Enzyme.mount(
      <Debug gamestate={gamestate} endTurn={() => {}} gameid="default" />);

  const titles = debug.find('h3').map(title => title.text());
  expect(titles).toEqual(['actions', 'state']);

  expect(debug.state('showLog')).toEqual(false);
  debug.find('.menu .item').at(1).simulate('click');
  expect(debug.state('showLog')).toEqual(true);
  debug.find('.menu .item').at(0).simulate('click');
  expect(debug.state('showLog')).toEqual(false);
});

test('GameLog', () => {
  const log = [
    makeMove({ type: 'moveA' }),
    endTurn(),
    makeMove({ type: 'moveB' }),
    endTurn(),
  ];
  const gamelog = Enzyme.mount(<GameLog log={log} />);
  const turns = gamelog.find('.id').map(div => div.text());
  expect(turns).toEqual(['Turn #1', 'Turn #2']);
});

test('GameLog rewind', () => {
  const game = Game({
    moves: {
      'A': (G, ctx, arg) => arg,
    }
  });
  const reducer = createGameReducer({game});
  const store = createStore(reducer);

  store.dispatch(makeMove({
    type: 'A',
    args: [1],
  }));

  store.dispatch(endTurn());

  store.dispatch(makeMove({
    type: 'A',
    args: [2],
  }));

  store.dispatch(endTurn());

  const root = Enzyme.mount(
      <Provider store={store}>
      <Debug gamestate={store.getState()} endTurn={() => {}} gameid="default" showLog={true} />
      </Provider>
  );

  expect(store.getState().G).toEqual(2);
  root.find('.log-turn').at(0).simulate('mouseover');
  expect(store.getState().G).toEqual(1);
  root.find('.log-turn').at(0).simulate('mouseout');
  expect(store.getState().G).toEqual(2);

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

  debug.find('.key-box').at(2).simulate('click');
  expect(setItem).toHaveBeenCalled();

  debug.find('.key-box').at(3).simulate('click');
  expect(getItem).toHaveBeenCalled();

  expect(loggedAction).toEqual(restore(restoredState));
});

test('toggle Debug UI', () => {
  const debug = Enzyme.mount(
      <Debug gamestate={gamestate} endTurn={() => {}} gameid="default" />);

  expect(debug.find('.debug-ui').length).toEqual(1);
  debug.setState({ showDebugUI: false });
  debug.setProps({});  // https://github.com/airbnb/enzyme/issues/1245
  expect(debug.find('.debug-ui').length).toEqual(0);
});

test('toggle Log', () => {
  const debug = Enzyme.mount(
      <Debug gamestate={gamestate} endTurn={() => {}} gameid="default" />);

  expect(debug.find('GameLog').length).toEqual(0);
  debug.setState({ showLog: true });
  debug.setProps({});  // https://github.com/airbnb/enzyme/issues/1245
  expect(debug.find('GameLog').length).toEqual(1);
});
