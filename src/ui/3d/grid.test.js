/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import { Grid } from './grid';
import { UI } from './ui';
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import * as THREE from 'three';

THREE.WebGLRenderer = jest.fn(function() {
  this.shadowMap = {};
  this.setSize = () => {
    return null;
  };
  this.domElement = document.createElement('canvas');
  this.render = () => {
    return null;
  };
});
Enzyme.configure({ adapter: new Adapter() });

class MockChild extends React.Component {
  render() {
    return <rect width="3" height="2" style={{ fill: 'red' }} />;
  }
}

test('render correctly', () => {
  const grid = Enzyme.mount(
    <UI three={true}>
      <Grid rows={3} cols={4}>
        <MockChild />
      </Grid>
    </UI>
  );
  expect(grid.html()).toContain('rect');
  expect(grid.html()).toContain('bgio-canvas');
  const gridIns = grid.find('Grid').instance();
  expect(gridIns.squareGroup.children).toHaveLength(12);
});

// test callback function
test('click handler', () => {
  {
    const onClick = jest.fn();
    const onMouseOver = jest.fn();
    const onMouseOut = jest.fn();
    const grid = Enzyme.mount(
      <UI three={true}>
        <Grid
          rows={3}
          cols={4}
          onClick={onClick}
          onMouseOut={onMouseOut}
          onMouseOver={onMouseOver}
        >
          <MockChild />
        </Grid>
      </UI>
    );
    const uiIns = grid.instance();
    const gridIns = grid.find('Grid').instance();
    const id = gridIns.squareGroup.children[0].id;
    uiIns.callbacks_[id]({
      type: 'mouseOver',
    });
    uiIns.callbacks_[id]({
      type: 'click',
    });
    uiIns.callbacks_[id]({
      type: 'mouseOut',
    });
    expect(onClick).toHaveBeenCalled();
    expect(onMouseOut).toHaveBeenCalled();
    expect(onMouseOver).toHaveBeenCalled();
  }

  // No crash when onClick is not provided.
  const grid = Enzyme.mount(
    <UI three={true}>
      <Grid rows={3} cols={4}>
        <MockChild />
      </Grid>
    </UI>
  );
  const uiIns = grid.instance();
  const gridIns = grid.find('Grid').instance();
  const id = gridIns.squareGroup.children[0].id;
  uiIns.callbacks_[id]({
    type: 'mouseOver',
  });
  uiIns.callbacks_[id]({
    type: 'click',
  });
  uiIns.callbacks_[id]({
    type: 'mouseOut',
  });
});

test('colorMap', () => {
  const colorMap = { '0,0': '#d18b47' };
  const grid = Enzyme.mount(
    <UI three={true}>
      <Grid rows={1} cols={1} colorMap={colorMap} />
    </UI>
  );
  const gridIns = grid.find('Grid').instance();
  expect(gridIns.squareGroup.children[0].material.color.getHexString()).toBe(
    'd18b47'
  );
});
