/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import { MCTSVisualizer, MCTSRoot, MCTSNode } from './mcts-visualizer.js';
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

Enzyme.configure({ adapter: new Adapter() });

describe('MCTSVisualizer', () => {
  test('returns a function', () => {
    const r = MCTSVisualizer();
    expect(r).toBeDefined();
    expect(r({})).toBeDefined();
  });
});

describe('MCTSRoot', () => {
  test('basic', () => {
    const root = {
      value: 1,
      visits: 2,
      children: [],
    };
    const m = Enzyme.mount(<MCTSRoot root={root} />);
    expect(m.find('.mcts-tree').text()).toContain('value 1');
    expect(m.find('.mcts-tree').text()).toContain('visits 2');
    expect(m.find('.mcts-tree').text()).toContain('ratio 50');
    expect(m.find('.mcts-root').length).toBe(1);
    expect(m.find('.mcts-node').length).toBe(1);

    root.value = 3;
    m.setProps({ root });
    expect(m.find('.mcts-tree').text()).toContain('value 3');
  });

  test('with children', () => {
    const root = {
      value: 1,
      visits: 2,
      children: [],
    };
    const node = { value: 10, children: [] };
    root.children = [node, node];

    const m = Enzyme.mount(<MCTSRoot root={root} />);
    expect(m.find('.mcts-root').text()).toContain('value 1');
    expect(m.find('.mcts-root').text()).toContain('visits 2');
    expect(m.find('.mcts-root').text()).toContain('ratio 50');
    expect(m.find('.mcts-root').length).toBe(1);
    expect(m.find('.mcts-node').length).toBe(3);
  });

  test('clicks', () => {
    const root = {
      value: 1,
      visits: 2,
      children: [],
    };
    const node = { parent: root, value: 10, children: [] };
    root.children = [node, node];

    const m = Enzyme.mount(<MCTSRoot root={root} />);

    m
      .find('.mcts-node')
      .at(1)
      .simulate('click');
    expect(m.find('.mcts-root').text()).toContain('value 10');

    m.find('.mcts-parent').simulate('click');
    expect(m.find('.mcts-root').text()).toContain('value 1');
  });
});

describe('MCTSNode', () => {
  test('basic', () => {
    const node = {
      value: 1,
      visits: 2,
      parentVisits: 2,
      renderState: () => 'blah',
    };
    const m = Enzyme.mount(<MCTSNode {...node} />);
    expect(m.find('.mcts-node').text()).toContain('value 1');
    expect(m.find('.mcts-node').text()).toContain('visits 2');
    expect(m.find('.mcts-node').text()).toContain('ratio 50');
    expect(m.find('.mcts-node').text()).toContain('uct');
    expect(m.find('.mcts-node').text()).toContain('blah');
  });
});
