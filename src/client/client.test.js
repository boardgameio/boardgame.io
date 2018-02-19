/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import { createStore } from 'redux';
import { createGameReducer } from '../core/reducer';
import {
  Client,
  createEventDispatchers,
  createMoveDispatchers,
} from './client';
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

test('connect', () => {
  let Board = Client({
    game: Game({}),
    board: TestBoard,
    multiplayer: true,
    debug: false,
  });
  let game = Enzyme.mount(<Board playerID={'11'} gameID={'foogame'} />);
  let multiplayerClient = game.instance().multiplayerClient;
  expect(game.state().isConnected).toEqual(false);
  multiplayerClient.onChange(true);
  expect(game.state().isConnected).toEqual(true);
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
  game = Enzyme.mount(<Board gameID="a" playerID="1" />);
  const m = game.instance().multiplayerClient;

  const spy1 = jest.spyOn(m, 'updateGameID');
  const spy2 = jest.spyOn(m, 'updatePlayerID');

  expect(m.gameID).toBe('default:a');
  expect(m.playerID).toBe('1');
  game.setProps({ gameID: 'a' });
  game.setProps({ playerID: '1' });
  expect(m.gameID).toBe('default:a');
  expect(m.playerID).toBe('1');
  expect(spy1).not.toHaveBeenCalled();
  expect(spy2).not.toHaveBeenCalled();

  game.setProps({ gameID: 'next' });
  game.setProps({ playerID: 'next' });
  expect(m.gameID).toBe('default:next');
  expect(m.playerID).toBe('next');
  expect(spy1).toHaveBeenCalled();
  expect(spy2).toHaveBeenCalled();
});

test('multiplayer server set when provided', () => {
  let Board = null;
  let game = null;

  let host = 'host';
  let port = '4321';
  Board = Client({
    game: Game({
      moves: {
        A: (G, ctx, arg) => ({ arg }),
      },
    }),
    board: TestBoard,
    multiplayer: { server: host + ':' + port },
  });
  game = Enzyme.mount(<Board gameID="a" playerID="1" />);
  const m = game.instance().multiplayerClient;
  expect(m.socket.io.engine.hostname).toEqual(host);
  expect(m.socket.io.engine.port).toEqual(port);
});

test('event dispatchers', () => {
  {
    const game = Game({});
    const reducer = createGameReducer({ game, numPlayers: 2 });
    const store = createStore(reducer);
    const api = createEventDispatchers(game.flow.eventNames, store);
    expect(Object.getOwnPropertyNames(api)).toEqual(['endTurn']);
    expect(store.getState().ctx.turn).toBe(0);
    api.endTurn();
    expect(store.getState().ctx.turn).toBe(1);
  }

  {
    const game = Game({
      flow: {
        endPhase: true,
      },
    });
    const reducer = createGameReducer({ game, numPlayers: 2 });
    const store = createStore(reducer);
    const api = createEventDispatchers(game.flow.eventNames, store);
    expect(Object.getOwnPropertyNames(api)).toEqual(['endTurn', 'endPhase']);
    expect(store.getState().ctx.turn).toBe(0);
    api.endTurn();
    expect(store.getState().ctx.turn).toBe(1);
  }

  {
    const game = Game({
      flow: {
        endTurn: false,
      },
    });
    const reducer = createGameReducer({ game, numPlayers: 2 });
    const store = createStore(reducer);
    const api = createEventDispatchers(game.flow.eventNames, store);
    expect(Object.getOwnPropertyNames(api)).toEqual([]);
  }
});

test('move dispatchers', () => {
  const game = Game({
    moves: {
      A: G => G,
      B: () => ({ moved: true }),
      C: () => ({ victory: true }),
    },
    flow: {
      endGameIf: (G, ctx) => (G.victory ? ctx.currentPlayer : undefined),
    },
  });

  const reducer = createGameReducer({ game });
  const store = createStore(reducer);
  const api = createMoveDispatchers(game.moveNames, store);

  expect(Object.getOwnPropertyNames(api)).toEqual(['A', 'B', 'C']);
  expect(api.unknown).toBe(undefined);

  api.A();
  expect(store.getState().G).toEqual({});

  api.B();
  expect(store.getState().G).toEqual({ moved: true });

  api.C();
  expect(store.getState().G).toEqual({ victory: true });
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
