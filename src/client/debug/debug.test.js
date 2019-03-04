/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import { stringify } from 'flatted';
import { Client } from '../client';
import { sync } from '../../core/action-creators';
import Game from '../../core/game';
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
      step={async () => {}}
      endTurn={() => {}}
      gameID="default"
    />
  );

  const titles = debug.find('h3').map(title => title.text());
  expect(titles).toEqual(['Players', 'Moves', 'Events']);

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

describe('save / restore', () => {
  let loggedAction = null;
  const store = createStore((state, action) => {
    loggedAction = action;
  });

  const restoredState = { restore: true };
  let restoredJSON = stringify(restoredState);
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
    expect(loggedAction).toEqual(sync(restoredState));
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

  expect(debug.find('.debug-ui')).toHaveLength(1);
  Mousetrap.simulate('d');
  debug.setProps({}); // https://github.com/airbnb/enzyme/issues/1245
  expect(debug.find('.debug-ui')).toHaveLength(0);
});

describe('log', () => {
  test('toggle', () => {
    const debug = Enzyme.mount(
      <Debug gamestate={gamestate} endTurn={() => {}} gameID="default" />
    );

    expect(debug.find('GameLog')).toHaveLength(0);
    Mousetrap.simulate('l');
    debug.setProps({}); // https://github.com/airbnb/enzyme/issues/1245
    expect(debug.find('GameLog')).toHaveLength(1);
  });

  test('hover', () => {
    const overrideGameState = jest.fn();
    const game = Game({
      moves: {
        A: (G, ctx, arg) => ({ arg }),
      },
    });

    const client = Client({ game });
    client.moves.A(42);
    client.events.endTurn();

    const debug = Enzyme.mount(
      <Debug
        overrideGameState={overrideGameState}
        reducer={client.reducer}
        gamestate={client.getState()}
        endTurn={() => {}}
        gameID="default"
      />
    );

    expect(debug.find('GameLog')).toHaveLength(0);
    Mousetrap.simulate('l');
    debug.setProps({}); // https://github.com/airbnb/enzyme/issues/1245
    expect(debug.find('GameLog')).toHaveLength(1);

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

  expect(debug.find('.ai-visualization')).toHaveLength(0);
  debug.setState({ AIMetadata: {} });
  expect(debug.find('.ai-visualization')).toHaveLength(1);
});

describe('simulate', () => {
  jest.useFakeTimers();

  test('basic', () => {
    const step = jest.fn(async () => true);
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
    expect(step).toHaveBeenCalled();
  });

  test('break out if no action is returned', () => {
    const step = jest.fn(async () => undefined);
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

test('controls docking', () => {
  const root = Enzyme.mount(
    <Debug gamestate={gamestate} endTurn={() => {}} gameID="default" />
  );

  expect(root.state()).toMatchObject({ dockControls: false });
  Mousetrap.simulate('t');
  expect(root.state()).toMatchObject({ dockControls: true });
  expect(root.find('Controls').html()).toContain('docktop');
});

test('show/hide game info', () => {
  const root = Enzyme.mount(
    <Debug gamestate={gamestate} endTurn={() => {}} gameID="default" />
  );

  expect(root.state()).toMatchObject({ showGameInfo: true });
  Mousetrap.simulate('i');
  expect(root.state()).toMatchObject({ showGameInfo: false });
});
