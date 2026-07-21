/*
 * Copyright 2019 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { Client } from '../client/client';
import { TurnOrder } from '../core/turn-order';
import type { Game } from '../types';

describe('log-metadata', () => {
  test.todo('preserves metadata from hooks triggered by moves');

  test('It sets metadata in a move and then clears the metadata', () => {
    const game: Game = {
      moves: {
        setMetadataMove: ({ log }) => {
          log.setMetadata({
            message: 'test',
          });
        },
        doNothing: ({ G }) => G,
      },
    };
    const client = Client({ game });
    client.moves.setMetadataMove();

    expect(client.getState().plugins.log.data).toEqual({});
    expect(client.getState().log[0].metadata).toEqual({
      message: 'test',
    });

    client.moves.doNothing();

    expect(client.getState().plugins.log.data).toEqual({});
    expect(client.getState().log[1].metadata).toEqual(undefined);
  });

  test('It sets metadata in a game event and then clears the metadata', () => {
    const game: Game = {
      setup: () => ({ shouldLog: true }),
      turn: {
        onEnd: ({ G, log }) => {
          if (G.shouldLog) {
            log.setMetadata({ message: 'turn ended' });
            G.shouldLog = false;
          }
        },
      },
    };
    const client = Client({ game });

    client.events.endTurn();

    expect(client.getState().plugins.log.data).toEqual({});
    expect(client.getState().log[0].metadata).toEqual({
      message: 'turn ended',
    });

    client.events.endTurn();

    expect(client.getState().log[1].metadata).toEqual(undefined);
  });

  test('It uses the last metadata set by hooks during a phase event', () => {
    const game: Game = {
      phases: {
        A: {
          start: true,
          next: 'B',
          onEnd: ({ log }) => {
            log.setMetadata({ message: 'phase A ended' });
          },
        },
        B: {
          onBegin: ({ log }) => {
            log.setMetadata({ message: 'phase B began' });
          },
        },
      },
    };
    const client = Client({ game });

    client.events.endPhase();

    const log = client.getState().log;
    expect(log.at(-1).metadata).toEqual({
      message: 'phase B began',
    });
  });

  test('It logs phase metadata when setPhase starts the first phase', () => {
    const game: Game = {
      phases: {
        B: {
          onBegin: ({ log }) => {
            log.setMetadata({ message: 'phase B began' });
          },
        },
      },
    };
    const client = Client({ game });

    client.events.setPhase('B');

    const log = client.getState().log;
    const setPhase = log.find(
      (entry) =>
        entry.action.type === 'GAME_EVENT' &&
        entry.action.payload.type === 'setPhase',
    );

    expect(client.getState().ctx.phase).toBe('B');
    expect(setPhase.metadata).toEqual({ message: 'phase B began' });
    expect(log.at(-2).metadata).toBeUndefined();
  });

  test('It logs metadata set by the game end hook', () => {
    const game: Game = {
      onEnd: ({ log }) => {
        log.setMetadata({ message: 'game ended' });
      },
    };
    const client = Client({ game });

    client.events.endGame('winner');

    const log = client.getState().log;
    const endGame = log.find(
      (entry) =>
        entry.action.type === 'GAME_EVENT' &&
        entry.action.payload.type === 'endGame',
    );

    expect(client.getState().ctx.gameover).toBe('winner');
    expect(endGame.metadata).toEqual({ message: 'game ended' });
    expect(log).toHaveLength(1);
  });

  test('It attaches turn metadata before an automatically ended phase', () => {
    const game: Game = {
      phases: {
        A: {
          start: true,
          turn: {
            order: TurnOrder.ONCE,
            onEnd: ({ log }) => {
              log.setMetadata({ message: 'turn ended' });
            },
          },
        },
      },
    };
    const client = Client({ game, numPlayers: 1 });

    client.events.endTurn();

    const log = client.getState().log;
    const endTurn = log.find(
      (entry) =>
        entry.action.type === 'GAME_EVENT' &&
        entry.action.payload.type === 'endTurn' &&
        !entry.automatic,
    );
    const endPhase = log.find(
      (entry) =>
        entry.action.type === 'GAME_EVENT' &&
        entry.action.payload.type === 'endPhase',
    );

    expect(endTurn.metadata).toEqual({ message: 'turn ended' });
    expect(endPhase.metadata).toBeUndefined();
  });

  test('It clears metadata set during a plugin-rejected event', () => {
    const game: Game<{ invalid: boolean }> = {
      setup: () => ({ invalid: false }),
      plugins: [
        {
          name: 'validator',
          isInvalid: ({ G }) => G.invalid && 'invalid',
        },
      ],
      phases: {
        A: { start: true },
        B: {
          onBegin: ({ G, log }) => {
            log.setMetadata({ message: 'rejected' });
            G.invalid = true;
          },
        },
      },
    };
    const client = Client({ game });
    const consoleError = jest.spyOn(console, 'error').mockImplementation();

    client.events.setPhase('B');
    consoleError.mockRestore();

    expect(client.getState().ctx.phase).toBe('A');
    expect(client.getState().plugins.log.data).toEqual({});

    client.events.endTurn();

    expect(client.getState().log.at(-1).metadata).toBeUndefined();
  });
});
