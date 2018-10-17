/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

// TODO: separate testing for TicTacToe from this overall test

import React from 'react';
import PropTypes from 'prop-types';
import { MemoryRouter } from 'react-router';
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import App from './app';

Enzyme.configure({ adapter: new Adapter() });

const Grid = n => new Array(n).fill(null);

// This wraps up the App in a MemoryRouter, which let's us set the route how we want
const RoutedApp = props => (
  <MemoryRouter initialEntries={[props.route]}>
    <App />
  </MemoryRouter>
);
RoutedApp.propTypes = {
  route: PropTypes.string,
};

test('sanity', () => {
  Enzyme.mount(<RoutedApp route="/" />);
});

test('makeMove changes the game state', () => {
  const game = Enzyme.mount(<RoutedApp route="/" />);
  const board = game.find('Board').instance();

  expect(board.props.G).toEqual({
    cells: Grid(9),
  });

  const moves = [0, 1];

  for (let id of moves) {
    board.props.moves.clickCell(id);
  }

  expect(board.props.G).toEqual({
    cells: ['0', '1'].concat(Grid(7)),
  });
  expect(board.props.ctx.gameover).toEqual(undefined);
});

test('clicked cells are inactive', () => {
  const game = Enzyme.mount(<RoutedApp route="/" />);

  expect(game.find('td').get(0).props.className).toBe('active');
  game.find('td').forEach(node => node.simulate('click'));
  expect(game.find('td').get(0).props.className).toBe('');
});

test('victory', () => {
  const game = Enzyme.mount(<RoutedApp route="/" />);
  const board = game.find('Board').instance();
  const cells = new Array(9).fill(null);

  expect(board.props.G).toEqual({
    cells: cells,
  });
  expect(board.props.ctx.gameover).toEqual(undefined);

  const moves = [0, 3, 1, 4, 2];

  for (let id of moves) {
    board.props.moves.clickCell(id);
  }

  expect(board.props.G).toEqual({
    cells: ['0', '0', '0', '1', '1'].concat(Grid(4)),
  });
  expect(board.props.ctx.gameover).toEqual({ winner: '0' });
});
