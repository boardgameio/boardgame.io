/*
 * Copyright 2019 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { Client } from '../client/client';
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
});
