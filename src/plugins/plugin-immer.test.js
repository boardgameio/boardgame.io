/*
 * Copyright 2019 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import Game from '../core/game';
import { InitializeGame, CreateGameReducer } from '../core/reducer';
import { makeMove, gameEvent } from '../core/action-creators';

describe('immer', () => {
  let game;
  let state;
  let reducer;

  beforeAll(() => {
    game = Game({
      moves: {
        A: G => {
          G.moveBody = true;
        },
      },

      flow: {
        startingPhase: 'A',
        phases: {
          A: {
            onBegin: G => {
              G.onPhaseBegin = true;
            },
            onEnd: G => {
              G.onPhaseEnd = true;
            },
          },
        },
        turn: {
          onBegin: G => {
            G.onTurnBegin = true;
          },
          onEnd: G => {
            G.onTurnEnd = true;
          },
        },
        onMove: G => {
          G.onMove = true;
        },
      },
    });

    state = InitializeGame({ game });
    reducer = CreateGameReducer({ game });
  });

  test('begin', () => {
    expect(state.G.onPhaseBegin).toBe(true);
    expect(state.G.onTurnBegin).toBe(true);
    expect(state.G.onPhaseEnd).not.toBe(true);
    expect(state.G.onTurnEnd).not.toBe(true);
  });

  test('end turn', () => {
    state = reducer(state, gameEvent('endTurn'));
    expect(state.G.onTurnEnd).toBe(true);
  });

  test('end phase', () => {
    state = reducer(state, gameEvent('endPhase'));
    expect(state.G.onPhaseEnd).toBe(true);
  });

  test('move', () => {
    state = reducer(state, makeMove('A'));
    expect(state.G.moveBody).toBe(true);
    expect(state.G.onMove).toBe(true);
  });
});
