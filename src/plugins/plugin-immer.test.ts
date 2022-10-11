/*
 * Copyright 2019 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { Client } from '../client/client';
import type { _ClientImpl } from '../client/client';
import { INVALID_MOVE } from '../core/constants';

// Surpress invalid move error logging
jest.mock('../core/logger');

describe('immer', () => {
  let client: _ClientImpl;

  beforeAll(() => {
    client = Client({
      game: {
        moves: {
          A: ({ G }) => {
            G.moveBody = true;
          },
          invalid: ({ G }) => {
            G.madeInvalidMove = true;
            return INVALID_MOVE;
          },
        },

        phases: {
          A: {
            start: true,
            onBegin: ({ G }) => {
              G.onPhaseBegin = true;
            },
            onEnd: ({ G }) => {
              G.onPhaseEnd = true;
            },
          },
        },

        turn: {
          onBegin: ({ G }) => {
            G.onTurnBegin = true;
          },
          onEnd: ({ G }) => {
            G.onTurnEnd = true;
          },
          onMove: ({ G }) => {
            G.onMove = true;
          },
        },
      },
    });
  });

  test('begin', () => {
    expect(client.getState().G.onPhaseBegin).toBe(true);
    expect(client.getState().G.onTurnBegin).toBe(true);
    expect(client.getState().G.onPhaseEnd).not.toBe(true);
    expect(client.getState().G.onTurnEnd).not.toBe(true);
  });

  test('end turn', () => {
    client.events.endTurn();
    expect(client.getState().G.onTurnEnd).toBe(true);
  });

  test('end phase', () => {
    client.events.endPhase();
    expect(client.getState().G.onPhaseEnd).toBe(true);
  });

  test('move', () => {
    client.moves.A();
    expect(client.getState().G.moveBody).toBe(true);
    expect(client.getState().G.onMove).toBe(true);
  });

  test('invalid move', () => {
    client.moves.invalid();
    expect(client.getState().G.madeInvalidMove).toBeUndefined();
  });
});
