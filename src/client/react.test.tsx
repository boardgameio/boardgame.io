/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import '@testing-library/jest-dom';
import { act, render, screen } from '@testing-library/react';
import type { BoardProps } from './react';
import { Client } from './react';
import { Local } from './transport/local';
import { SocketIO } from './transport/socketio';
import { Invalid } from '../core/constants';

let lastBoardProps: (BoardProps & { doStuff?; extraValue? }) | null = null;

class TestBoard extends React.Component<
  BoardProps & { doStuff?; extraValue? }
> {
  render() {
    lastBoardProps = this.props;
    return <div id="board">Board</div>;
  }
}

beforeEach(() => {
  lastBoardProps = null;
});

test('board is rendered', () => {
  const Board = Client({
    game: {},
    board: TestBoard,
  });

  const { container, unmount } = render(<Board />);

  expect(lastBoardProps.isActive).toBe(true);
  expect(container.textContent).toBe('Board');

  unmount();
});

test('board props', () => {
  const Board = Client({
    game: {},
    board: TestBoard,
  });
  render(<Board />);
  expect(lastBoardProps.isMultiplayer).toEqual(false);
  expect(lastBoardProps.isActive).toBe(true);
});

test('board receives and clears lastActionError', () => {
  const Board = Client({
    game: {
      moves: {
        reject: () => Invalid({ reason: 'not allowed' }),
      },
    },
    board: TestBoard,
  });
  render(<Board />);
  expect(lastBoardProps.lastActionError).toBeUndefined();

  act(() => lastBoardProps.moves.reject());
  expect(lastBoardProps.lastActionError).toEqual({
    type: 'action/invalid_move',
    payload: { reason: 'not allowed' },
  });

  act(() => lastBoardProps.reset());
  expect(lastBoardProps.lastActionError).toBeUndefined();
});

test('can pass extra props to Client', () => {
  const Board = Client({
    game: {},
    board: TestBoard,
  });
  render(<Board doStuff={() => true} extraValue={55} />);
  expect(lastBoardProps.doStuff()).toBe(true);
  expect(lastBoardProps.extraValue).toBe(55);
});

test('debug ui can be turned off', () => {
  const Board = Client({
    game: {},
    board: TestBoard,
    debug: false,
  });

  const { container } = render(<Board />);
  expect(container.querySelector('.debug-ui')).toBeNull();
});

test('custom loading component', () => {
  const Loading = () => <div>custom</div>;
  const Board = Client({
    game: {},
    loading: Loading,
    board: TestBoard,
    multiplayer: SocketIO(),
  });
  render(<Board />);
  expect(screen.getByText('custom')).toBeInTheDocument();
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

  expect(lastBoardProps.G).toEqual({});
  act(() => lastBoardProps.moves.A(42));
  expect(lastBoardProps.G).toEqual({ arg: 42 });
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

  let ref = React.createRef<InstanceType<typeof Board>>();
  let { rerender } = render(<Board ref={ref} />);
  rerender(<Board ref={ref} matchID="a" />);
  rerender(<Board ref={ref} matchID="a" playerID="3" />);
  expect((ref.current as any).transport).toBe(undefined);

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

  ref = React.createRef<InstanceType<typeof Board>>();
  ({ rerender } = render(
    <Board ref={ref} matchID="a" playerID="1" credentials="foo" />,
  ));

  const m = (ref.current as any).client.transport;
  const g = (ref.current as any).client;

  const spy1 = jest.spyOn(m, 'updateMatchID');
  const spy2 = jest.spyOn(m, 'updatePlayerID');
  const spy3 = jest.spyOn(g, 'updateCredentials');

  expect(m.matchID).toBe('a');
  expect(m.playerID).toBe('1');

  rerender(<Board ref={ref} matchID="a" playerID="1" credentials="foo" />);
  rerender(<Board ref={ref} matchID="a" playerID="1" credentials="foo" />);
  rerender(<Board ref={ref} matchID="a" playerID="1" credentials="foo" />);

  expect(m.matchID).toBe('a');
  expect(m.playerID).toBe('1');
  expect(spy1).not.toHaveBeenCalled();
  expect(spy2).not.toHaveBeenCalled();
  expect(spy3).not.toHaveBeenCalled();

  rerender(<Board ref={ref} matchID="next" playerID="1" credentials="foo" />);
  rerender(
    <Board ref={ref} matchID="next" playerID="next" credentials="foo" />,
  );
  rerender(
    <Board ref={ref} matchID="next" playerID="next" credentials="bar" />,
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
  expect(lastBoardProps.G).toEqual({ stripped: '1' });
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
    G: { ...lastBoardProps.G },
    ctx: { ...lastBoardProps.ctx },
  };

  expect(lastBoardProps.G).toEqual({});
  act(() => lastBoardProps.moves.A(42));
  expect(lastBoardProps.G).toEqual({ arg: 42 });
  act(() => lastBoardProps.reset());
  expect(lastBoardProps.G).toEqual(initial.G);
  expect(lastBoardProps.ctx).toEqual(initial.ctx);
});
