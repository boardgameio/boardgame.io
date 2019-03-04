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
import { Token } from './token';
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import * as THREE from 'three';

// mock renderer function
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

test('click handler', () => {
  const onClick = jest.fn();
  const onMouseOver = jest.fn();
  const onMouseOut = jest.fn();
  const token = Enzyme.mount(
    <UI three={true}>
      <Grid rows={3} cols={4}>
        <Token
          x={1}
          y={2}
          onClick={onClick}
          onMouseOut={onMouseOut}
          onMouseOver={onMouseOver}
        />
      </Grid>
    </UI>
  );

  const uiIns = token.instance();
  const tokenIns = token.find('TokenImpl').instance();

  const id = tokenIns.prevMesh.id;
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
});

test('correct x and y', () => {
  const grid = Enzyme.mount(
    <UI three={true}>
      <Grid rows={3} cols={4}>
        <Token x={1} y={2} />
      </Grid>
    </UI>
  );
  const tokenIns = grid.find('TokenImpl').instance();
  const x =
    tokenIns.props.x * (tokenIns.props.boardSize + tokenIns.props.padding);
  const y =
    tokenIns.props.y * (tokenIns.props.boardSize + tokenIns.props.padding);
  expect(tokenIns.prevMesh.position.x).toBe(x);
  expect(tokenIns.prevMesh.position.z).toBe(y);

  // No crash when componentWillUnmount
  {
    grid
      .find('TokenImpl')
      .instance()
      .componentWillUnmount();
  }
});
