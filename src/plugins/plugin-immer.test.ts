/*
 * Copyright 2019 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { Client } from '../client/client';
import type { _ClientImpl } from '../client/client';
import { Invalid, INVALID_MOVE } from '../core/constants';

// Surpress invalid move error logging
jest.mock('../core/logger');

interface TestGameState {
  deck: Array<{ id: string; details: { suit: string } }>;
  moveBody?: boolean;
  madeInvalidMove?: boolean;
  onPhaseBegin?: boolean;
  onPhaseEnd?: boolean;
  onTurnBegin?: boolean;
  onTurnEnd?: boolean;
  onMove?: boolean;
}

describe('immer', () => {
  let client: _ClientImpl<TestGameState>;

  beforeAll(() => {
    client = Client<TestGameState>({
      game: {
        setup: () => ({
          deck: [{ id: 'ace', details: { suit: 'spades' } }],
        }),
        moves: {
          A: ({ G }) => {
            G.moveBody = true;
          },
          invalid: ({ G }) => {
            G.madeInvalidMove = true;
            return INVALID_MOVE;
          },
          invalidWithDraftPayload: ({ G }) =>
            Invalid({
              card: G.deck[0],
              cards: [G.deck[0]],
              count: G.deck.length,
            }),
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

  test('invalid move snapshots drafts in its payload', () => {
    client.moves.invalidWithDraftPayload();
    expect(client.lastActionError.payload).toEqual({
      card: { id: 'ace', details: { suit: 'spades' } },
      cards: [{ id: 'ace', details: { suit: 'spades' } }],
      count: 1,
    });
    expect(() => JSON.stringify(client.lastActionError.payload)).not.toThrow();
  });
});
