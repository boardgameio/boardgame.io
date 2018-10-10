/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import { makeMove } from '../core/action-creators';
import {
  MCTSVisualizer,
  MCTSRoot,
  MCTSNodeDetails,
} from './mcts-visualizer.js';
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
    expect(m.find('.parents').children()).toHaveLength(0);
    expect(m.find('.children').children()).toHaveLength(0);
  });

  test('with children', () => {
    const root = {
      value: 1,
      visits: 2,
      children: [],
    };
    const node = { parentAction: makeMove(), value: 10, children: [] };
    root.children = [node, node];

    const m = Enzyme.mount(<MCTSRoot root={root} />);
    expect(m.find('.parents').children()).toHaveLength(0);
    expect(m.find('.children').children()).toHaveLength(2);
  });

  test('clicks', () => {
    const root = {
      visits: 1,
      children: [],
    };
    const node = { parent: root, parentAction: makeMove(), visits: 2 };
    node.children = [node];
    root.children = [node, node];

    const m = Enzyme.mount(<MCTSRoot root={root} />);

    m
      .find('.children MCTSNode')
      .at(0)
      .simulate('click');

    expect(m.find('.root MCTSNode').text()).toContain('2');

    m.find('.parents MCTSNode').simulate('click');
    expect(m.find('.root MCTSNode').text()).toContain('1');
  });

  test('trigger preview of root', () => {
    const root = {
      visits: 1,
      children: [],
    };

    const m = Enzyme.mount(<MCTSRoot root={root} />);

    expect(m.find('MCTSNodeDetails')).toHaveLength(0);
    m
      .find('MCTSNode')
      .at(0)
      .simulate('mouseover');
    expect(m.find('MCTSNodeDetails')).toHaveLength(1);
    m
      .find('MCTSNode')
      .at(0)
      .simulate('mouseout');
    m.setProps({});
    expect(m.find('MCTSNodeDetails')).toHaveLength(0);
  });

  test('trigger preview of child', () => {
    const root = {
      visits: 1,
      children: [],
    };
    const node = { parent: root, parentAction: makeMove(), visits: 2 };
    node.children = [node];
    root.children = [node];

    const m = Enzyme.mount(<MCTSRoot root={root} />);

    expect(m.find('MCTSNodeDetails')).toHaveLength(0);
    m
      .find('.children MCTSNode')
      .at(0)
      .simulate('mouseover');
    expect(m.find('MCTSNodeDetails')).toHaveLength(1);
    m
      .find('.children MCTSNode')
      .at(0)
      .simulate('mouseout');
    m.setProps({});
    expect(m.find('MCTSNodeDetails')).toHaveLength(0);
  });

  test('trigger preview of parent', () => {
    const root = {
      visits: 1,
      children: [],
    };
    const node = { parent: root, parentAction: makeMove(), visits: 2 };
    node.children = [node];
    root.children = [node];

    const m = Enzyme.mount(<MCTSRoot root={node} />);

    expect(m.find('MCTSNodeDetails')).toHaveLength(0);
    m
      .find('.parents MCTSNode')
      .at(0)
      .simulate('mouseover');
    expect(m.find('MCTSNodeDetails')).toHaveLength(1);
    m
      .find('.parents MCTSNode')
      .at(0)
      .simulate('mouseout');
    m.setProps({});
    expect(m.find('MCTSNodeDetails')).toHaveLength(0);
  });
});

describe('MCTSNodeDetails', () => {
  test('basic', () => {
    const node = {
      value: 1,
      visits: 2,
      isRoot: true,
      parentVisits: 2,
      children: [],
      renderState: () => 'blah',
    };
    const m = Enzyme.mount(<MCTSNodeDetails {...node} />);
    expect(m.text()).toContain('value 1');
    expect(m.text()).toContain('visits 2');
    expect(m.text()).toContain('ratio 50');
    expect(m.text()).toContain('uct');
    expect(m.text()).toContain('blah');
    expect(m.html()).toContain('mcts-root');
  });
});
