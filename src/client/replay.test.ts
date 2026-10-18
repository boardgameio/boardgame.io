/*
 * Copyright 2026 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { Client } from './client';
import { ReplayLog } from '../../packages/client';
import type { Game } from '../types';

type G = { moves: string[] };

const game: Game<G> = {
  setup: () => ({ moves: [] }),
  moves: {
    play: ({ G, events }, move: string) => {
      events.endTurn();
      return { moves: [...G.moves, move] };
    },
  },
};

test('replays each state transition once when it contains queued events', () => {
  const client = Client({ game, debug: false });
  const initialState = client.getInitialState();

  client.moves.play('first');
  client.moves.play('second');

  const states = ReplayLog({
    game,
    initialState,
    log: client.log,
  });

  expect(client.log.map((entry) => entry._stateID)).toEqual([0, 0, 1, 1]);
  expect(states).toHaveLength(4);
  expect(states[0]).toMatchObject({
    G: { moves: ['first'] },
    ctx: { currentPlayer: '1', turn: 2 },
    _stateID: 1,
  });
  expect(states[1]).toEqual(states[0]);
  expect(states[2]).toMatchObject({
    G: { moves: ['first', 'second'] },
    ctx: { currentPlayer: '0', turn: 3 },
    _stateID: 2,
  });
  expect(states[3]).toEqual(states[2]);
  expect(initialState.G).toEqual({ moves: [] });
});

test('replays a directly-dispatched game event', () => {
  const client = Client({ game, debug: false });
  const initialState = client.getInitialState();

  client.events.endTurn();

  const states = ReplayLog({
    game,
    initialState,
    log: client.log,
  });

  expect(states).toHaveLength(1);
  expect(states[0]).toMatchObject({
    G: { moves: [] },
    ctx: { currentPlayer: '1', turn: 2 },
    _stateID: 1,
  });
});

test('omits automatic log entries from the replay states', () => {
  const maxMoveGame: Game<G> = {
    setup: () => ({ moves: [] }),
    turn: { maxMoves: 1 },
    moves: {
      play: ({ G }, move: string) => ({ moves: [...G.moves, move] }),
    },
  };
  const client = Client({ game: maxMoveGame, debug: false });

  client.moves.play('first');
  client.moves.play('second');

  const states = ReplayLog({
    game: maxMoveGame,
    initialState: client.getInitialState(),
    log: client.log,
  });

  expect(client.log.filter((entry) => entry.automatic)).toHaveLength(2);
  expect(states).toHaveLength(2);
  expect(states.at(-1)).toMatchObject({
    G: { moves: ['first', 'second'] },
    ctx: { currentPlayer: '0', turn: 3 },
    _stateID: 2,
  });
});
