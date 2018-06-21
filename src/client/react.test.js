/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import { Client } from './react';
import Game from '../core/game';
import { TurnOrder } from '../core/turn-order';
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

Enzyme.configure({ adapter: new Adapter() });

class TestBoard extends React.Component {
  render() {
    return <div id="board">Board</div>;
  }
}

test('board is rendered', () => {
  const Board = Client({
    game: Game({}),
    board: TestBoard,
  });

  const game = Enzyme.mount(<Board />);
  const board = game.find(TestBoard);

  expect(board.props().isActive).toBe(true);

  expect(board.text()).toBe('Board');
  expect(game.find('.debug-ui').length).toBe(1);
});

test('board props', () => {
  let Board = Client({
    game: Game({}),
    board: TestBoard,
  });
  let board = Enzyme.mount(<Board />).find(TestBoard);
  expect(board.props().isMultiplayer).toEqual(false);
  expect(board.props().isActive).toBe(true);

  Board = Client({
    game: Game({}),
    board: TestBoard,
    multiplayer: true,
  });

  board = Enzyme.mount(<Board />).find(TestBoard);
  expect(board.props().isMultiplayer).toEqual(true);
  expect(board.props().isConnected).toEqual(false);
  expect(board.props().isActive).toBe(false);
  board = Enzyme.mount(<Board playerID={'0'} />).find(TestBoard);
  expect(board.props().isActive).toBe(true);
  board = Enzyme.mount(<Board playerID={'1'} />).find(TestBoard);
  expect(board.props().isActive).toBe(false);

  Board = Client({
    game: Game({
      flow: {
        phases: [{ name: 'A', turnOrder: TurnOrder.ANY }],
      },
    }),
    board: TestBoard,
    multiplayer: true,
  });
  board = Enzyme.mount(<Board />).find(TestBoard);
  expect(board.props().isActive).toBe(false);
  board = Enzyme.mount(<Board playerID={'0'} />).find(TestBoard);
  expect(board.props().isActive).toBe(true);
  board = Enzyme.mount(<Board playerID={'1'} />).find(TestBoard);
  expect(board.props().isActive).toBe(true);
});

test('can pass extra props to Client', () => {
  const Board = Client({
    game: Game({}),
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
    game: Game({}),
    board: TestBoard,
    debug: false,
  });

  const game = Enzyme.mount(<Board />);
  expect(game.find('.debug-ui').length).toBe(0);
});

test('can pass empty board', () => {
  const Board = Client({
    game: Game({}),
  });

  const game = Enzyme.mount(<Board />);
  expect(game).not.toBe(undefined);
});

test('move api', () => {
  const Board = Client({
    game: Game({
      moves: {
        A: (G, ctx, arg) => ({ arg }),
      },
    }),
    board: TestBoard,
  });

  const game = Enzyme.mount(<Board />);
  const board = game.find('TestBoard').instance();

  expect(board.props.G).toEqual({});
  board.props.moves.A(42);
  expect(board.props.G).toEqual({ arg: 42 });
});

test('update gameID / playerID', () => {
  let Board = null;
  let game = null;

  // No multiplayer.

  Board = Client({
    game: Game({
      moves: {
        A: (G, ctx, arg) => ({ arg }),
      },
    }),
    board: TestBoard,
  });
  game = Enzyme.mount(<Board />);
  game.setProps({ gameID: 'a' });
  game.setProps({ playerID: '3' });
  expect(game.instance().multiplayerClient).toBe(undefined);

  // Multiplayer.

  Board = Client({
    game: Game({
      moves: {
        A: (G, ctx, arg) => ({ arg }),
      },
    }),
    board: TestBoard,
    multiplayer: true,
  });
  game = Enzyme.mount(<Board gameID="a" playerID="1" credentials="foo" />);
  const m = game.instance().client.multiplayerClient;
  const g = game.instance().client;

  const spy1 = jest.spyOn(m, 'updateGameID');
  const spy2 = jest.spyOn(m, 'updatePlayerID');
  const spy3 = jest.spyOn(g, 'updateCredentials');

  expect(m.gameID).toBe('default:a');
  expect(m.playerID).toBe('1');

  game.setProps({ gameID: 'a' });
  game.setProps({ playerID: '1' });
  game.setProps({ credentials: 'foo' });

  expect(m.gameID).toBe('default:a');
  expect(m.playerID).toBe('1');
  expect(spy1).not.toHaveBeenCalled();
  expect(spy2).not.toHaveBeenCalled();
  expect(spy3).not.toHaveBeenCalled();

  game.setProps({ gameID: 'next' });
  game.setProps({ playerID: 'next' });
  game.setProps({ credentials: 'bar' });

  expect(m.gameID).toBe('default:next');
  expect(m.playerID).toBe('next');
  expect(spy1).toHaveBeenCalled();
  expect(spy2).toHaveBeenCalled();
  expect(spy3).toHaveBeenCalled();
});

test('local playerView', () => {
  const Board = Client({
    game: Game({
      setup: () => ({ secret: true }),
      playerView: (G, ctx, playerID) => ({ stripped: playerID }),
    }),
    board: TestBoard,
    numPlayers: 2,
  });

  {
    const game = Enzyme.mount(<Board />);
    const board = game.find('TestBoard').instance();
    expect(board.props.G).toEqual({ stripped: '0' });
    board.props.events.endTurn();
    expect(board.props.G).toEqual({ stripped: '1' });
  }

  {
    const game = Enzyme.mount(<Board playerID="1" />);
    const board = game.find('TestBoard').instance();
    expect(board.props.G).toEqual({ stripped: '1' });
  }
});

test('reset Game', () => {
  const Board = Client({
    game: Game({
      moves: {
        A: (G, ctx, arg) => ({ arg }),
      },
    }),
    board: TestBoard,
  });

  const game = Enzyme.mount(<Board />);
  const board = game.find('TestBoard').instance();

  const initial = { G: { ...board.props.G }, ctx: { ...board.props.ctx } };

  expect(board.props.G).toEqual({});
  board.props.moves.A(42);
  expect(board.props.G).toEqual({ arg: 42 });
  board.props.reset();
  expect(board.props.G).toEqual(initial.G);
  expect(board.props.ctx).toEqual(initial.ctx);
});

test('undo/redo', () => {
  const Board = Client({
    game: Game({
      moves: {
        A: (G, ctx, arg) => ({ arg }),
      },
    }),
    board: TestBoard,
  });

  const game = Enzyme.mount(<Board />);
  const board = game.find('TestBoard').instance();

  const initial = { G: { ...board.props.G }, ctx: { ...board.props.ctx } };

  expect(board.props.G).toEqual({});
  board.props.moves.A(42);
  expect(board.props.G).toEqual({ arg: 42 });

  board.props.undo();
  expect(board.props.G).toEqual(initial.G);

  board.props.redo();
  expect(board.props.G).toEqual({ arg: 42 });
});

test('overrideGameState', () => {
  const Board = Client({
    game: Game({}),
    board: TestBoard,
  });

  const game = Enzyme.mount(<Board />);
  const board = game.find('TestBoard').instance();

  expect(board.props.G).toEqual({});
  game
    .find('Debug')
    .props()
    .overrideGameState({ G: 1 });
  expect(board.props.G).toBe(1);
});
