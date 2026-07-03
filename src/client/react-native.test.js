/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */
/* eslint-disable unicorn/no-array-callback-reference */

import React from 'react';
import { act, render, screen } from '@testing-library/react';
import { Client } from './react-native';
import { Local } from './transport/local';
import { Transport } from './transport/transport';

class NoConnectionTransport extends Transport {
  connect() {}
  disconnect() {}
  sendAction() {}
  sendChatMessage() {}
  requestSync() {}
  updateMatchID() {}
  updatePlayerID() {}
  updateCredentials() {}
}

let capturedBoardProps = null;

class TestBoard extends React.Component {
  render() {
    capturedBoardProps = this.props;
    return <div id="board">Board</div>;
  }
}

beforeEach(() => {
  capturedBoardProps = null;
});

test('board is rendered', () => {
  const Board = Client({
    game: {},
    board: TestBoard,
  });

  const { container, unmount } = render(<Board />);

  expect(capturedBoardProps.isActive).toBe(true);
  expect(container.textContent).toBe('Board');

  unmount();
});

test('board is rendered with custom loading', () => {
  let capturedLoadingProps = null;
  const Loading = (props) => {
    capturedLoadingProps = props;
    return <>connecting...</>;
  };

  const Board = Client({
    game: {},
    board: TestBoard,
    loading: Loading,
    multiplayer: (opts) => new NoConnectionTransport(opts),
  });

  const { unmount } = render(<Board />);

  expect(capturedLoadingProps).toEqual({});
  expect(screen.getByText('connecting...')).toBeInTheDocument();

  unmount();
});

test('board props', () => {
  const Board = Client({
    game: {},
    board: TestBoard,
  });
  render(<Board />);
  expect(capturedBoardProps.isMultiplayer).toEqual(false);
  expect(capturedBoardProps.isActive).toBe(true);
});

test('can pass extra props to Client', () => {
  const Board = Client({
    game: {},
    board: TestBoard,
  });
  render(<Board doStuff={() => true} extraValue={55} />);
  expect(capturedBoardProps.doStuff()).toBe(true);
  expect(capturedBoardProps.extraValue).toBe(55);
});

test('can pass empty board', () => {
  const Board = Client({
    game: {},
  });

  const result = render(<Board />);
  expect(result).not.toBe(undefined);
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

  render(<Board />);

  expect(capturedBoardProps.G).toEqual({});
  act(() => capturedBoardProps.moves.A(42));
  expect(capturedBoardProps.G).toEqual({ arg: 42 });
});

test('update matchID / playerID', () => {
  // No multiplayer.

  let Board = Client({
    game: {
      moves: {
        A: (_, arg) => ({ arg }),
      },
    },
    board: TestBoard,
  });
  const ref1 = React.createRef();
  const { rerender: rerender1 } = render(<Board ref={ref1} />);
  rerender1(<Board ref={ref1} matchID="a" />);
  rerender1(<Board ref={ref1} matchID="a" playerID="3" />);
  expect(ref1.current.transport).toBe(undefined);

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
  const ref2 = React.createRef();
  const { rerender: rerender2 } = render(
    <Board ref={ref2} matchID="a" playerID="1" credentials="foo" />
  );
  const m = ref2.current.client.transport;
  const g = ref2.current.client;

  const spy1 = jest.spyOn(m, 'updateMatchID');
  const spy2 = jest.spyOn(m, 'updatePlayerID');
  const spy3 = jest.spyOn(g, 'updateCredentials');

  expect(m.matchID).toBe('a');
  expect(m.playerID).toBe('1');

  rerender2(<Board ref={ref2} matchID="a" playerID="1" credentials="foo" />);

  expect(m.matchID).toBe('a');
  expect(m.playerID).toBe('1');
  expect(spy1).not.toHaveBeenCalled();
  expect(spy2).not.toHaveBeenCalled();
  expect(spy3).not.toHaveBeenCalled();

  rerender2(
    <Board ref={ref2} matchID="next" playerID="next" credentials="bar" />
  );

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

  render(<Board playerID="1" />);
  expect(capturedBoardProps.G).toEqual({ stripped: '1' });
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

  render(<Board />);

  const initial = {
    G: { ...capturedBoardProps.G },
    ctx: { ...capturedBoardProps.ctx },
  };

  expect(capturedBoardProps.G).toEqual({});
  act(() => capturedBoardProps.moves.A(42));
  expect(capturedBoardProps.G).toEqual({ arg: 42 });
  act(() => capturedBoardProps.reset());
  expect(capturedBoardProps.G).toEqual(initial.G);
  expect(capturedBoardProps.ctx).toEqual(initial.ctx);
});

test('can receive enhancer', () => {
  const enhancer = jest.fn().mockImplementation((next) => next);
  const Board = Client({
    game: {},
    board: TestBoard,
    enhancer,
  });

  render(<Board />);
  expect(enhancer).toHaveBeenCalled();
});
