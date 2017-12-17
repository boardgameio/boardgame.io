/*
 * Copyright 2017 Google Inc.
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { App } from './app';

Enzyme.configure({ adapter: new Adapter() });

const Grid = (n) => Array(n).fill(null);

test('sanity', () => {
  Enzyme.mount(<App/>);
});

test('makeMove changes the game state', () => {
  const game = Enzyme.mount(<App/>);
  const board = game.find('Board').instance();

  expect(board.props.G).toEqual({
    cells: Grid(9),
    winner: null
  });

  const moves = [0, 1];

  for (let id of moves) {
    board.props.moves.clickCell(id);
    board.props.endTurn();
  }

  expect(board.props.G).toEqual({
    cells: [0, 1].concat(Grid(7)),
    winner: null
  });
});

test('clicked cells are inactive', () => {
  const game = Enzyme.mount(<App/>);

  expect(game.find('td').get(0).props.className).toBe('active');
  game.find('td').forEach(node => node.simulate('click'));
  expect(game.find('td').get(0).props.className).toBe('');
});

test('victory', () => {
  const game = Enzyme.mount(<App/>);
  const board = game.find('Board').instance();
  const cells = Array(9).fill(null);

  expect(board.props.G).toEqual({
    cells: cells,
    winner: null
  });

  const moves = [0, 3, 1, 4, 2];

  for (let id of moves) {
    board.props.moves.clickCell(id);
    board.props.endTurn();
  }

  expect(board.props.G).toEqual({
    cells: [0, 0, 0, 1, 1].concat(Grid(4)),
    winner: 0,
  });
});
