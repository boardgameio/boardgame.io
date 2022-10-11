/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */
/* eslint-disable unicorn/no-array-callback-reference */

import React from 'react';
import type { BoardProps } from './react';
import { Client } from './react';
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { Local } from './transport/local';
import { SocketIO } from './transport/socketio';

Enzyme.configure({ adapter: new Adapter() });

class TestBoard extends React.Component<
  BoardProps & { doStuff?; extraValue? }
> {
  render() {
    return <div id="board">Board</div>;
  }
}

test('board is rendered', () => {
  const Board = Client({
    game: {},
    board: TestBoard,
  });

  const game = Enzyme.mount(<Board />);
  const board = game.find(TestBoard);

  expect(board.props().isActive).toBe(true);
  expect(board.text()).toBe('Board');

  game.unmount();
});

test('board props', () => {
  const Board = Client({
    game: {},
    board: TestBoard,
  });
  const board = Enzyme.mount(<Board />).find(TestBoard);
  expect(board.props().isMultiplayer).toEqual(false);
  expect(board.props().isActive).toBe(true);
});

test('can pass extra props to Client', () => {
  const Board = Client({
    game: {},
    board: TestBoard,
  });
  const board = Enzyme.mount(
    <Board doStuff={() => true} extraValue={55} />
  ).find(TestBoard);
  expect(board.props().doStuff()).toBe(true);
  expect(board.props().extraValue).toBe(55);
});

test('debug ui can be turned off', () => {
  const Board = Client({
    game: {},
    board: TestBoard,
    debug: false,
  });

  const game = Enzyme.mount(<Board />);
  expect(game.find('.debug-ui')).toHaveLength(0);
});

test('custom loading component', () => {
  const Loading = () => <div>custom</div>;
  const Board = Client({
    game: {},
    loading: Loading,
    board: TestBoard,
    multiplayer: SocketIO(),
  });
  const board = Enzyme.mount(<Board />);
  expect(board.html()).toContain('custom');
});

test('can pass empty board', () => {
  const Board = Client({
    game: {},
  });

  const game = Enzyme.mount(<Board />);
  expect(game).not.toBe(undefined);
});

test('move api', () => {
  const Board = Client({
    game: {
      moves: {
        A: (_, arg) => ({ arg }),
      },
    },
    board: TestBoard,
  });

  const game = Enzyme.mount(<Board />);
  const board = game.find('TestBoard').instance() as TestBoard;

  expect(board.props.G).toEqual({});
  board.props.moves.A(42);
  expect(board.props.G).toEqual({ arg: 42 });
});

test('update matchID / playerID', () => {
  let Board = null;
  let game = null;

  // No multiplayer.

  Board = Client({
    game: {
      moves: {
        A: (_, arg) => ({ arg }),
      },
    },
    board: TestBoard,
  });
  game = Enzyme.mount(<Board />);
  game.setProps({ matchID: 'a' });
  game.setProps({ playerID: '3' });
  expect(game.instance().transport).toBe(undefined);

  // Multiplayer.

  Board = Client({
    game: {
      moves: {
        A: (_, arg) => ({ arg }),
      },
    },
    board: TestBoard,
    multiplayer: Local(),
  });
  game = Enzyme.mount(<Board matchID="a" playerID="1" credentials="foo" />);
  const m = game.instance().client.transport;
  const g = game.instance().client;

  const spy1 = jest.spyOn(m, 'updateMatchID');
  const spy2 = jest.spyOn(m, 'updatePlayerID');
  const spy3 = jest.spyOn(g, 'updateCredentials');

  expect(m.matchID).toBe('a');
  expect(m.playerID).toBe('1');

  game.setProps({ matchID: 'a' });
  game.setProps({ playerID: '1' });
  game.setProps({ credentials: 'foo' });

  expect(m.matchID).toBe('a');
  expect(m.playerID).toBe('1');
  expect(spy1).not.toHaveBeenCalled();
  expect(spy2).not.toHaveBeenCalled();
  expect(spy3).not.toHaveBeenCalled();

  game.setProps({ matchID: 'next' });
  game.setProps({ playerID: 'next' });
  game.setProps({ credentials: 'bar' });

  expect(m.matchID).toBe('next');
  expect(m.playerID).toBe('next');
  expect(spy1).toHaveBeenCalled();
  expect(spy2).toHaveBeenCalled();
  expect(spy3).toHaveBeenCalled();
});

test('local playerView', () => {
  const Board = Client({
    game: {
      setup: () => ({ secret: true }),
      playerView: ({ playerID }) => ({ stripped: playerID }),
    },
    board: TestBoard,
    numPlayers: 2,
  });

  const game = Enzyme.mount(<Board playerID="1" />);
  const board = game.find('TestBoard').instance() as TestBoard;
  expect(board.props.G).toEqual({ stripped: '1' });
});

test('reset Game', () => {
  const Board = Client({
    game: {
      moves: {
        A: (_, arg) => ({ arg }),
      },
    },
    board: TestBoard,
  });

  const game = Enzyme.mount(<Board />);
  const board = game.find('TestBoard').instance() as TestBoard;

  const initial = { G: { ...board.props.G }, ctx: { ...board.props.ctx } };

  expect(board.props.G).toEqual({});
  board.props.moves.A(42);
  expect(board.props.G).toEqual({ arg: 42 });
  board.props.reset();
  expect(board.props.G).toEqual(initial.G);
  expect(board.props.ctx).toEqual(initial.ctx);
});
