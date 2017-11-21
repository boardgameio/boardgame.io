/*
 * Copyright 2017 Google Inc.
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import Client from './client';
import Game from '../both/game';
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import * as Multiplayer from './multiplayer/multiplayer';

Enzyme.configure({ adapter: new Adapter() });

class TestBoard extends React.Component {
  render() {
    return (
      <div id="board">
      Board
      </div>
    );
  }
}

test('board is rendered', () => {
  const Board = Client({
    game: Game({}),
    board: TestBoard,
  });

  const game = Enzyme.mount(<Board/>);
  const board = game.find('TestBoard');

  expect(board.text()).toBe('Board');
  expect(game.find('.debug-ui').length).toBe(1);
});

test('debug ui can be turned off', () => {
  const Board = Client({
    game: Game({}),
    board: TestBoard,
    debug: false,
  });

  const game = Enzyme.mount(<Board/>);
  expect(game.find('.debug-ui').length).toBe(0);
});

test('can pass empty board', () => {
  const Board = Client({
    game: Game({}),
  });

  const game = Enzyme.mount(<Board/>);
  expect(game).not.toBe(undefined);
});

test('move api', () => {
  const Board = Client({
    game: Game({
      moves: {
        'A': (G, ctx, arg) => ({ arg }),
      }
    }),
    board: TestBoard,
  });

  const game = Enzyme.mount(<Board/>);
  const board = game.find('TestBoard').instance();

  expect(board.props.G).toEqual({});
  board.props.moves.A(42);
  expect(board.props.G).toEqual({ arg: 42 });
});

test('update gameid', () => {
  let Board = null;
  let game = null;

  // No multiplayer.

  Board = Client({
    game: Game({
      moves: {
        'A': (G, ctx, arg) => ({ arg }),
      }
    }),
    board: TestBoard,
  });
  game = Enzyme.mount(<Board/>);

  expect(Multiplayer.gameid).toBe('default');
  game.setProps({ gameid: 'next' });
  expect(Multiplayer.gameid).toBe('default');

  // Multiplayer.

  Board = Client({
    game: Game({
      moves: {
        'A': (G, ctx, arg) => ({ arg }),
      }
    }),
    board: TestBoard,
    multiplayer: true
  });
  game = Enzyme.mount(<Board/>);

  const spy = jest.spyOn(Multiplayer, 'updateGameID');

  expect(Multiplayer.gameid).toBe('default');
  game.setProps({ gameid: 'default' });
  expect(Multiplayer.gameid).toBe('default');
  expect(spy).not.toHaveBeenCalled();

  expect(Multiplayer.gameid).toBe('default');
  game.setProps({ gameid: 'next' });
  expect(Multiplayer.gameid).toBe('next');
  expect(spy).toHaveBeenCalled();
});
