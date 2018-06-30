/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import { restore, makeMove, gameEvent } from '../../core/action-creators';
import Game from '../../core/game';
import { CreateGameReducer } from '../../core/reducer';
import { createStore } from 'redux';
import { Debug } from './debug';
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
  const store = { getState: () => ({ log: [] }) };
  const debug = Enzyme.mount(
    <Debug
      gamestate={gamestate}
      store={store}
      step={() => {}}
      endTurn={() => {}}
      gameID="default"
    />
  );

  const titles = debug.find('h3').map(title => title.text());
  expect(titles).toEqual(['Controls', 'Players', 'Moves', 'Events', 'State']);

  expect(debug.state('showLog')).toEqual(false);
  debug
    .find('.menu .item')
    .at(1)
    .simulate('click');
  expect(debug.state('showLog')).toEqual(true);
  debug
    .find('.menu .item')
    .at(0)
    .simulate('click');
  expect(debug.state('showLog')).toEqual(false);

  debug.unmount();
});

test('shortcuts are unique a-z', () => {
  const moves = {
    takeCard: () => {},
    takeToken: () => {},
  };

  const element = React.createElement(Debug, {
    gamestate,
    moves,
    gameID: 'default',
  });

  const instance = Enzyme.mount(element).instance();

  expect(instance.shortcuts).toEqual({
    takeCard: 'a',
    takeToken: 'b',
  });
});

test('shortcuts are unique first char', () => {
  const moves = {
    clickCell: () => {},
    playCard: () => {},
  };

  const element = React.createElement(Debug, {
    gamestate,
    moves,
    gameID: 'default',
  });

  const instance = Enzyme.mount(element).instance();

  expect(instance.shortcuts).toEqual({
    clickCell: 'c',
    playCard: 'p',
  });
});

describe('save / restore', () => {
  let loggedAction = null;
  const store = createStore((state, action) => {
    loggedAction = action;
  });

  const restoredState = { restore: true };
  let restoredJSON = JSON.stringify(restoredState);
  const setItem = jest.fn();
  const getItem = jest.fn(() => restoredJSON);

  beforeEach(() => {
    window.localStorage = { setItem, getItem };

    Enzyme.mount(
      <Debug
        store={store}
        gamestate={gamestate}
        endTurn={() => {}}
        gameID="default"
      />
    );
  });

  test('save', () => {
    Mousetrap.simulate('2');
    expect(setItem).toHaveBeenCalled();
  });

  test('restore', () => {
    Mousetrap.simulate('3');
    expect(getItem).toHaveBeenCalled();
    expect(loggedAction).toEqual(restore(restoredState));
  });

  test('restore from nothing does nothing', () => {
    restoredJSON = null;
    loggedAction = null;
    Mousetrap.simulate('3');
    expect(loggedAction).toEqual(null);
  });
});

test('toggle Debug UI', () => {
  const debug = Enzyme.mount(
    <Debug gamestate={gamestate} endTurn={() => {}} gameID="default" />
  );

  expect(debug.find('.debug-ui').length).toEqual(1);
  Mousetrap.simulate('d');
  debug.setProps({}); // https://github.com/airbnb/enzyme/issues/1245
  expect(debug.find('.debug-ui').length).toEqual(0);
});

describe('log', () => {
  test('toggle', () => {
    const debug = Enzyme.mount(
      <Debug gamestate={gamestate} endTurn={() => {}} gameID="default" />
    );

    expect(debug.find('GameLog').length).toEqual(0);
    Mousetrap.simulate('l');
    debug.setProps({}); // https://github.com/airbnb/enzyme/issues/1245
    expect(debug.find('GameLog').length).toEqual(1);
  });

  test('hover', () => {
    const overrideGameState = jest.fn();
    const game = Game({
      moves: {
        A: (G, ctx, arg) => ({ arg }),
      },
    });
    const reducer = CreateGameReducer({ game });
    let state = reducer(undefined, { type: 'init' });
    state = reducer(state, makeMove('A', [42]));
    state = reducer(state, gameEvent('endTurn'));

    const debug = Enzyme.mount(
      <Debug
        overrideGameState={overrideGameState}
        reducer={reducer}
        gamestate={state}
        endTurn={() => {}}
        gameID="default"
      />
    );

    expect(debug.find('GameLog').length).toEqual(0);
    Mousetrap.simulate('l');
    debug.setProps({}); // https://github.com/airbnb/enzyme/issues/1245
    expect(debug.find('GameLog').length).toEqual(1);

    debug
      .find('GameLog .log-event')
      .at(0)
      .simulate('mouseenter');
    expect(overrideGameState).toHaveBeenCalled();
  });
});

test('toggle help', () => {
  const debug = Enzyme.mount(
    <Debug gamestate={gamestate} endTurn={() => {}} gameID="default" />
  );

  expect(debug.state()).toMatchObject({ help: false });
  Mousetrap.simulate('?');
  expect(debug.state()).toMatchObject({ help: true });
});

test('toggle AI visualizer', () => {
  const debug = Enzyme.mount(
    <Debug
      gamestate={gamestate}
      visualizeAI={jest.fn()}
      endTurn={() => {}}
      gameID="default"
    />
  );

  expect(debug.find('.pane').length).toBe(1);
  debug.setState({ AIMetadata: {} });
  expect(debug.find('.pane').length).toBe(2);
});

describe('simulate', () => {
  jest.useFakeTimers();

  test('basic', () => {
    const step = jest.fn(() => true);
    Enzyme.mount(
      <Debug
        step={step}
        gamestate={gamestate}
        endTurn={() => {}}
        gameID="default"
      />
    );
    expect(step).not.toHaveBeenCalled();
    Mousetrap.simulate('5');
    jest.runAllTimers();
    expect(step).toHaveBeenCalledTimes(10000);
  });

  test('break out if no action is returned', () => {
    const step = jest.fn(() => undefined);
    Enzyme.mount(
      <Debug
        step={step}
        gamestate={gamestate}
        endTurn={() => {}}
        gameID="default"
      />
    );

    expect(step).not.toHaveBeenCalled();
    Mousetrap.simulate('5');
    jest.runAllTimers();
    expect(step).toHaveBeenCalledTimes(1);
  });
});
