/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { makeMove, gameEvent } from './action-creators';
import { Client } from '../client/client';
import { Flow } from './flow';
import { TurnOrder } from './turn-order';
import { error } from '../core/logger';
import type { Ctx, State, Game, PlayerID, MoveFn } from '../types';

jest.mock('../core/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
}));
afterEach(jest.clearAllMocks);

describe('phases', () => {
  test('invalid phase name', () => {
    const flow = Flow({
      phases: { '': {} },
    });
    flow.init({ ctx: flow.ctx(2) } as State);
    expect(error).toHaveBeenCalledWith('cannot specify phase with empty name');
  });

  test('onBegin / onEnd', () => {
    const flow = Flow({
      phases: {
        A: {
          start: true,
          onBegin: ({ G }) => ({ ...G, setupA: true }),
          onEnd: ({ G }) => ({ ...G, cleanupA: true }),
          next: 'B',
        },
        B: {
          onBegin: ({ G }) => ({ ...G, setupB: true }),
          onEnd: ({ G }) => ({ ...G, cleanupB: true }),
          next: 'A',
        },
      },

      turn: {
        order: {
          first: ({ G }) => {
            if (G.setupB && !G.cleanupB) return 1;
            return 0;
          },
          next: ({ ctx }) => (ctx.playOrderPos + 1) % ctx.playOrder.length,
        },
      },
    });

    let state = { G: {}, ctx: flow.ctx(2) } as State;
    state = flow.init(state);
    expect(state.G).toMatchObject({ setupA: true });
    expect(state.ctx.currentPlayer).toBe('0');

    state = flow.processEvent(state, gameEvent('endPhase'));
    expect(state.G).toMatchObject({
      setupA: true,
      cleanupA: true,
      setupB: true,
    });
    expect(state.ctx.currentPlayer).toBe('1');

    state = flow.processEvent(state, gameEvent('endPhase'));
    expect(state.G).toMatchObject({
      setupA: true,
      cleanupA: true,
      setupB: true,
      cleanupB: true,
    });
    expect(state.ctx.currentPlayer).toBe('0');
  });

  test('endIf', () => {
    const flow = Flow({
      phases: { A: { start: true, endIf: () => true, next: 'B' }, B: {} },
    });

    const state = { ctx: flow.ctx(2) } as State;

    {
      const t = flow.processEvent(state, gameEvent('endPhase'));
      expect(t.ctx.phase).toBe('B');
    }

    {
      const t = flow.processEvent(state, gameEvent('endTurn'));
      expect(t.ctx.phase).toBe('B');
    }

    {
      const t = flow.processMove(state, makeMove('').payload);
      expect(t.ctx.phase).toBe('B');
    }
  });

  describe('onEnd', () => {
    let client: ReturnType<typeof Client>;

    beforeAll(() => {
      const game: Game = {
        endIf: () => true,
        onEnd: ({ G }) => {
          G.onEnd = true;
        },
      };
      client = Client({ game });
    });

    test('works', () => {
      expect(client.getState().G).toEqual({
        onEnd: true,
      });
    });
  });

  test('end phase on move', () => {
    let endPhaseACount = 0;
    let endPhaseBCount = 0;

    const flow = Flow({
      phases: {
        A: {
          start: true,
          endIf: () => true,
          onEnd: () => ++endPhaseACount,
          next: 'B',
        },
        B: {
          endIf: () => false,
          onEnd: () => ++endPhaseBCount,
        },
      },
    });
    let state = { G: {}, ctx: flow.ctx(2) } as State;

    expect(state.ctx.phase).toBe('A');
    state = flow.processMove(state, makeMove('').payload);
    expect(state.ctx.phase).toBe('B');

    expect(endPhaseACount).toEqual(1);
    expect(endPhaseBCount).toEqual(0);
  });

  test('endPhase returns to null phase', () => {
    const flow = Flow({
      phases: { A: { start: true }, B: {}, C: {} },
    });
    let state = { G: {}, ctx: flow.ctx(2) } as State;
    state = flow.init(state);

    expect(state.ctx.phase).toBe('A');
    state = flow.processEvent(state, gameEvent('endPhase'));
    expect(state.ctx.phase).toBe(null);
  });

  test('increment playOrderPos on phase end', () => {
    const flow = Flow({
      phases: { A: { start: true, next: 'B' }, B: { next: 'A' } },
    });
    let state = { G: {}, ctx: flow.ctx(3) } as State;
    state = flow.init(state);

    expect(state.ctx.playOrderPos).toBe(0);
    state = flow.processEvent(state, gameEvent('endTurn'));
    expect(state.ctx.playOrderPos).toBe(1);
    state = flow.processEvent(state, gameEvent('endPhase'));
    expect(state.ctx.playOrderPos).toBe(2);
  });

  describe('setPhase', () => {
    let flow: ReturnType<typeof Flow>;
    beforeEach(() => {
      flow = Flow({
        phases: { A: { start: true }, B: {} },
      });
    });

    test('basic', () => {
      let state = { G: {}, ctx: flow.ctx(2) } as State;
      state = flow.init(state);

      expect(state.ctx.phase).toBe('A');
      state = flow.processEvent(state, gameEvent('setPhase', 'B'));
      expect(state.ctx.phase).toBe('B');
    });

    test('invalid arg', () => {
      let state = { G: {}, ctx: flow.ctx(2) } as State;
      state = flow.init(state);

      expect(state.ctx.phase).toBe('A');
      state = flow.processEvent(state, gameEvent('setPhase', 'C'));
      expect(error).toBeCalledWith('invalid phase: C');
      expect(state.ctx.phase).toBe(null);
    });
  });
});

describe('turn', () => {
  test('onEnd', () => {
    const onEnd = jest.fn(({ G }) => G);
    const flow = Flow({
      turn: { onEnd },
    });
    const state = { ctx: flow.ctx(2) } as State;
    flow.init(state);

    expect(onEnd).not.toHaveBeenCalled();
    flow.processEvent(state, gameEvent('endTurn'));
    expect(onEnd).toHaveBeenCalled();
  });

  describe('onMove', () => {
    const onMove = () => ({ A: true });

    test('top level callback', () => {
      const flow = Flow({ turn: { onMove } });
      let state = { G: {}, ctx: flow.ctx(2) } as State;
      state = flow.processMove(state, makeMove('').payload);
      expect(state.G).toEqual({ A: true });
    });

    test('phase specific callback', () => {
      const flow = Flow({
        turn: { onMove },
        phases: { B: { turn: { onMove: () => ({ B: true }) } } },
      });
      let state = { G: {}, ctx: flow.ctx(2) } as State;
      state = flow.processMove(state, makeMove('').payload);
      expect(state.G).toEqual({ A: true });
      state = flow.processEvent(state, gameEvent('setPhase', 'B'));
      state = flow.processMove(state, makeMove('').payload);
      expect(state.G).toEqual({ B: true });
    });

    test('ctx with playerID', () => {
      const playerID = 'playerID';
      const flow = Flow({
        turn: { onMove: ({ playerID }) => ({ playerID }) },
      });
      let state = { G: {}, ctx: flow.ctx(2) } as State;
      state = flow.processMove(
        state,
        makeMove('', undefined, 'playerID').payload
      );
      expect(state.G.playerID).toEqual(playerID);
    });
  });

  describe('minMoves', () => {
    describe('without phases', () => {
      const flow = Flow({
        turn: {
          minMoves: 2,
        },
      });

      test('player cannot endTurn if not enough moves were made', () => {
        let state = flow.init({ ctx: flow.ctx(2) } as State);

        expect(state.ctx.turn).toBe(1);
        expect(state.ctx.currentPlayer).toBe('0');

        state = flow.processMove(state, makeMove('move', null, '0').payload);
        state = flow.processEvent(state, gameEvent('endTurn'));

        expect(state.ctx.turn).toBe(1);
        expect(state.ctx.currentPlayer).toBe('0');
      });

      test('player can endTurn after enough moves were made', () => {
        let state = flow.init({ ctx: flow.ctx(2) } as State);

        expect(state.ctx.turn).toBe(1);
        expect(state.ctx.currentPlayer).toBe('0');

        state = flow.processMove(state, makeMove('move', null, '0').payload);
        state = flow.processMove(state, makeMove('move', null, '0').payload);
        state = flow.processEvent(state, gameEvent('endTurn'));

        expect(state.ctx.turn).toBe(2);
        expect(state.ctx.currentPlayer).toBe('1');
      });
    });

    describe('with phases', () => {
      const flow = Flow({
        turn: { minMoves: 2 },
        phases: {
          B: {
            turn: {
              minMoves: 1,
            },
          },
        },
      });

      test('player cannot endTurn if not enough moves were made in default phase', () => {
        let state = flow.init({ ctx: flow.ctx(2) } as State);

        expect(state.ctx.turn).toBe(1);
        expect(state.ctx.currentPlayer).toBe('0');

        state = flow.processMove(state, makeMove('move', null, '0').payload);
        state = flow.processEvent(state, gameEvent('endTurn'));

        expect(state.ctx.turn).toBe(1);
        expect(state.ctx.currentPlayer).toBe('0');
      });

      test('player can endTurn after enough moves were made in default phase', () => {
        let state = flow.init({ ctx: flow.ctx(2) } as State);

        expect(state.ctx.turn).toBe(1);
        expect(state.ctx.currentPlayer).toBe('0');

        state = flow.processMove(state, makeMove('move', null, '0').payload);
        state = flow.processMove(state, makeMove('move', null, '0').payload);
        state = flow.processEvent(state, gameEvent('endTurn'));

        expect(state.ctx.turn).toBe(2);
        expect(state.ctx.currentPlayer).toBe('1');
      });

      test('player cannot endTurn if no move was made in explicit phase', () => {
        let state = flow.init({ ctx: flow.ctx(2) } as State);

        expect(state.ctx.turn).toBe(1);
        expect(state.ctx.currentPlayer).toBe('0');

        state = flow.processMove(state, makeMove('move', null, '0').payload);
        state = flow.processMove(state, makeMove('move', null, '0').payload);
        state = flow.processEvent(state, gameEvent('endTurn'));
        state = flow.processMove(state, makeMove('move', null, '1').payload);

        expect(state.ctx.turn).toBe(2);
        expect(state.ctx.currentPlayer).toBe('1');

        state = flow.processEvent(state, gameEvent('setPhase', 'B'));
        state = flow.processEvent(state, gameEvent('endTurn'));

        expect(state.ctx.turn).toBe(3);
        expect(state.ctx.currentPlayer).toBe('0');
      });

      test('player can endTurn after having made a move, fewer moves needed in explicit phase', () => {
        let state = flow.init({ ctx: flow.ctx(2) } as State);

        expect(state.ctx.turn).toBe(1);
        expect(state.ctx.currentPlayer).toBe('0');

        state = flow.processMove(state, makeMove('move', null, '0').payload);
        state = flow.processMove(state, makeMove('move', null, '0').payload);
        state = flow.processEvent(state, gameEvent('endTurn'));
        state = flow.processMove(state, makeMove('move', null, '1').payload);

        expect(state.ctx.turn).toBe(2);
        expect(state.ctx.currentPlayer).toBe('1');

        state = flow.processEvent(state, gameEvent('setPhase', 'B'));
        state = flow.processMove(state, makeMove('move', null, '0').payload);
        state = flow.processEvent(state, gameEvent('endTurn'));

        expect(state.ctx.turn).toBe(4);
        expect(state.ctx.currentPlayer).toBe('1');
      });
    });
  });

  describe('maxMoves', () => {
    describe('without phases', () => {
      const flow = Flow({
        turn: {
          maxMoves: 2,
        },
      });

      test('manual endTurn works, even if not enough moves were made', () => {
        let state = flow.init({ ctx: flow.ctx(2) } as State);

        expect(state.ctx.turn).toBe(1);
        expect(state.ctx.currentPlayer).toBe('0');

        state = flow.processMove(state, makeMove('move', null, '0').payload);
        state = flow.processEvent(state, gameEvent('endTurn'));

        expect(state.ctx.turn).toBe(2);
        expect(state.ctx.currentPlayer).toBe('1');
      });

      test('turn automatically ends after making enough moves', () => {
        let state = flow.init({ ctx: flow.ctx(2) } as State);

        expect(state.ctx.turn).toBe(1);
        expect(state.ctx.currentPlayer).toBe('0');

        state = flow.processMove(state, makeMove('move', null, '0').payload);
        state = flow.processMove(state, makeMove('move', null, '0').payload);

        expect(state.ctx.turn).toBe(2);
        expect(state.ctx.currentPlayer).toBe('1');
      });
    });

    describe('with phases', () => {
      const flow = Flow({
        turn: { maxMoves: 2 },
        phases: {
          B: {
            turn: { maxMoves: 1 },
          },
        },
      });

      test('manual endTurn works in all phases, even if fewer than maxMoves have been made', () => {
        let state = flow.init({ ctx: flow.ctx(2) } as State);

        expect(state.ctx.turn).toBe(1);
        expect(state.ctx.currentPlayer).toBe('0');

        state = flow.processMove(state, makeMove('move', null, '0').payload);
        state = flow.processEvent(state, gameEvent('endTurn'));

        expect(state.ctx.turn).toBe(2);
        expect(state.ctx.currentPlayer).toBe('1');

        state = flow.processEvent(state, gameEvent('setPhase', 'B'));

        expect(state.ctx.turn).toBe(3);
        expect(state.ctx.currentPlayer).toBe('0');

        state = flow.processEvent(state, gameEvent('endTurn'));

        expect(state.ctx.turn).toBe(4);
        expect(state.ctx.currentPlayer).toBe('1');
      });

      test('automatic endTurn triggers after fewer moves in different phase', () => {
        let state = flow.init({ ctx: flow.ctx(2) } as State);

        expect(state.ctx.turn).toBe(1);
        expect(state.ctx.currentPlayer).toBe('0');

        state = flow.processMove(state, makeMove('move', null, '0').payload);
        state = flow.processMove(state, makeMove('move', null, '0').payload);

        expect(state.ctx.turn).toBe(2);
        expect(state.ctx.currentPlayer).toBe('1');

        state = flow.processEvent(state, gameEvent('setPhase', 'B'));

        expect(state.ctx.turn).toBe(3);
        expect(state.ctx.currentPlayer).toBe('0');

        state = flow.processMove(state, makeMove('move', null, '0').payload);

        expect(state.ctx.turn).toBe(4);
        expect(state.ctx.currentPlayer).toBe('1');
      });
    });

    test('with noLimit moves', () => {
      const flow = Flow({
        turn: {
          maxMoves: 2,
        },
        moves: {
          A: () => {},
          B: {
            move: () => {},
            noLimit: true,
          },
        },
      });
      let state = flow.init({ ctx: flow.ctx(2) } as State);
      expect(state.ctx.turn).toBe(1);
      expect(state.ctx.numMoves).toBe(0);
      state = flow.processMove(state, makeMove('A', null, '0').payload);
      expect(state.ctx.turn).toBe(1);
      expect(state.ctx.numMoves).toBe(1);
      state = flow.processMove(state, makeMove('B', null, '0').payload);
      expect(state.ctx.turn).toBe(1);
      expect(state.ctx.numMoves).toBe(1);
      state = flow.processMove(state, makeMove('A', null, '0').payload);
      expect(state.ctx.turn).toBe(2);
      expect(state.ctx.numMoves).toBe(0);
    });
  });

  describe('endIf', () => {
    test('global', () => {
      const game: Game = {
        moves: {
          A: () => ({ endTurn: true }),
          B: ({ G }) => G,
        },
        turn: { endIf: ({ G }) => G.endTurn },
      };
      const client = Client({ game });

      expect(client.getState().ctx.currentPlayer).toBe('0');
      client.moves.B();
      expect(client.getState().ctx.currentPlayer).toBe('0');
      client.moves.A();
      expect(client.getState().ctx.currentPlayer).toBe('1');
    });

    test('phase specific', () => {
      const game: Game = {
        moves: {
          A: () => ({ endTurn: true }),
          B: ({ G }) => G,
        },
        phases: {
          A: { start: true, turn: { endIf: ({ G }) => G.endTurn } },
        },
      };
      const client = Client({ game });

      expect(client.getState().ctx.currentPlayer).toBe('0');
      client.moves.B();
      expect(client.getState().ctx.currentPlayer).toBe('0');
      client.moves.A();
      expect(client.getState().ctx.currentPlayer).toBe('1');
    });

    test('return value', () => {
      const game: Game = {
        moves: {
          A: ({ G }) => G,
        },
        turn: { endIf: () => ({ next: '2' }) },
      };
      const client = Client({ game, numPlayers: 3 });

      expect(client.getState().ctx.currentPlayer).toBe('0');
      client.moves.A();
      expect(client.getState().ctx.currentPlayer).toBe('2');
    });
  });

  test('endTurn is not called twice in one move', () => {
    const flow = Flow({
      turn: { endIf: () => true },
      phases: {
        A: { start: true, endIf: ({ G }) => G.endPhase, next: 'B' },
        B: {},
      },
    });

    let state = flow.init({ G: {}, ctx: flow.ctx(2) } as State);

    expect(state.ctx.phase).toBe('A');
    expect(state.ctx.currentPlayer).toBe('0');
    expect(state.ctx.turn).toBe(1);

    state = flow.processMove(state, makeMove('').payload);

    expect(state.ctx.phase).toBe('A');
    expect(state.ctx.currentPlayer).toBe('1');
    expect(state.ctx.turn).toBe(2);

    state.G = { endPhase: true };

    state = flow.processMove(state, makeMove('').payload);

    expect(state.ctx.phase).toBe('B');
    expect(state.ctx.currentPlayer).toBe('0');
    expect(state.ctx.turn).toBe(3);
  });
});

describe('stages', () => {
  let client: ReturnType<typeof Client>;

  beforeAll(() => {
    const A = () => {};
    const B = () => {};

    const game: Game = {
      moves: { A },
      turn: {
        stages: {
          B: { moves: { B } },
          C: {},
        },
      },
    };

    client = Client({ game });
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('no stage', () => {
    test('A is allowed', () => {
      client.moves.A();
      expect(error).not.toBeCalled();
    });

    test('B is not allowed', () => {
      client.moves.B();
      expect(error).toBeCalledWith('disallowed move: B');
    });
  });

  describe('stage B', () => {
    beforeAll(() => {
      client.events.setStage('B');
    });

    test('A is not allowed', () => {
      client.moves.A();
      expect(error).toBeCalledWith('disallowed move: A');
    });

    test('B is allowed', () => {
      client.moves.B();
      expect(error).not.toBeCalled();
    });
  });

  describe('stage C', () => {
    beforeAll(() => {
      client.events.setStage('C');
    });

    test('A is allowed', () => {
      client.moves.A();
      expect(error).not.toBeCalled();
    });

    test('B is not allowed', () => {
      client.moves.B();
      expect(error).toBeCalledWith('disallowed move: B');
    });
  });

  test('stage updates can be reacted to in turn.endIf', () => {
    const client = Client({
      game: {
        turn: {
          activePlayers: {
            all: 'A',
          },
          stages: {
            A: {
              moves: {
                leaveStage: ({ events }) => void events.endStage(),
              },
            },
          },
          endIf: ({ ctx }) => ctx.activePlayers === null,
        },
      },
    });

    let state = client.getState();
    expect(state.ctx.turn).toBe(1);
    expect(state.ctx.activePlayers).toEqual({ '0': 'A', '1': 'A' });

    client.updatePlayerID('0');

    client.moves.leaveStage();
    state = client.getState();
    expect(state.ctx.turn).toBe(1);
    expect(state.ctx.activePlayers).toEqual({ '1': 'A' });

    client.updatePlayerID('1');
    client.moves.leaveStage();
    state = client.getState();
    expect(state.ctx.turn).toBe(2);
    expect(state.ctx.activePlayers).toEqual({ '0': 'A', '1': 'A' });
  });

  test('stage changes due to move limits are seen by turn.endIf', () => {
    const client = Client({
      game: {
        turn: {
          activePlayers: {
            currentPlayer: 'A',
            maxMoves: 1,
          },
          endIf: ({ ctx }) => ctx.activePlayers === null,
          stages: {
            A: {
              moves: {
                A: () => ({ moved: true }),
              },
            },
          },
        },
      },
    });

    let state = client.getState();
    expect(state.ctx.activePlayers).toEqual({ '0': 'A' });
    client.moves.A();
    state = client.getState();
    expect(state.ctx.activePlayers).toEqual({ '1': 'A' });
  });
});

describe('stage events', () => {
  describe('setStage', () => {
    test('basic', () => {
      const flow = Flow({});
      let state = { G: {}, ctx: flow.ctx(2) } as State;
      state = flow.init(state);

      expect(state.ctx.activePlayers).toBeNull();
      state = flow.processEvent(state, gameEvent('setStage', 'A'));
      expect(state.ctx.activePlayers).toEqual({ '0': 'A' });
    });

    test('object syntax', () => {
      const flow = Flow({});
      let state = { G: {}, ctx: flow.ctx(2) } as State;
      state = flow.init(state);

      expect(state.ctx.activePlayers).toBeNull();
      state = flow.processEvent(state, gameEvent('setStage', { stage: 'A' }));
      expect(state.ctx.activePlayers).toEqual({ '0': 'A' });
    });

    test('with multiple active players', () => {
      const flow = Flow({
        turn: {
          activePlayers: { all: 'A', minMoves: 2, maxMoves: 5 },
        },
      });
      let state = { G: {}, ctx: flow.ctx(3) } as State;
      state = flow.init(state);

      expect(state.ctx.activePlayers).toEqual({ '0': 'A', '1': 'A', '2': 'A' });
      state = flow.processEvent(
        state,
        gameEvent('setStage', { stage: 'B', minMoves: 1 })
      );
      expect(state.ctx.activePlayers).toEqual({ '0': 'B', '1': 'A', '2': 'A' });

      state = flow.processEvent(
        state,
        gameEvent('setStage', { stage: 'B', maxMoves: 1 }, '1')
      );
      expect(state.ctx.activePlayers).toEqual({ '0': 'B', '1': 'B', '2': 'A' });
    });

    test('resets move count', () => {
      const flow = Flow({
        moves: { A: () => {} },
        turn: {
          activePlayers: { currentPlayer: 'A' },
        },
      });
      let state = { G: {}, ctx: flow.ctx(2) } as State;
      state = flow.init(state);

      expect(state.ctx._activePlayersNumMoves).toMatchObject({ '0': 0 });
      state = flow.processMove(state, makeMove('A', null, '0').payload);
      expect(state.ctx._activePlayersNumMoves).toMatchObject({ '0': 1 });
      state = flow.processEvent(state, gameEvent('setStage', 'B'));
      expect(state.ctx._activePlayersNumMoves).toMatchObject({ '0': 0 });
    });

    test('with min moves', () => {
      const flow = Flow({});
      let state = { G: {}, ctx: flow.ctx(2) } as State;
      state = flow.init(state);

      expect(state.ctx._activePlayersMinMoves).toBeNull();
      expect(state.ctx._activePlayersMaxMoves).toBeNull();
      state = flow.processEvent(
        state,
        gameEvent('setStage', { stage: 'A', minMoves: 1 })
      );
      expect(state.ctx._activePlayersMinMoves).toEqual({ '0': 1 });
      expect(state.ctx._activePlayersMaxMoves).toBeNull();
    });

    test('with max moves', () => {
      const flow = Flow({});
      let state = { G: {}, ctx: flow.ctx(2) } as State;
      state = flow.init(state);

      expect(state.ctx._activePlayersMinMoves).toBeNull();
      expect(state.ctx._activePlayersMaxMoves).toBeNull();
      state = flow.processEvent(
        state,
        gameEvent('setStage', { stage: 'A', maxMoves: 1 })
      );
      expect(state.ctx._activePlayersMinMoves).toBeNull();
      expect(state.ctx._activePlayersMaxMoves).toEqual({ '0': 1 });
    });

    test('empty argument ends stage', () => {
      const flow = Flow({ turn: { activePlayers: { currentPlayer: 'A' } } });
      let state = { G: {}, ctx: flow.ctx(2) } as State;
      state = flow.init(state);

      expect(state.ctx.activePlayers).toEqual({ '0': 'A' });
      state = flow.processEvent(state, gameEvent('setStage', {}));
      expect(state.ctx.activePlayers).toBeNull();
    });

    describe('disallowed in hooks', () => {
      const setStage: MoveFn = ({ events }) => {
        events.setStage('A');
      };

      test('phase.onBegin', () => {
        const game: Game = {
          phases: {
            A: {
              start: true,
              onBegin: setStage,
            },
          },
        };
        Client({ game });
        expect(error).toHaveBeenCalled();
        const errorMessage = (error as jest.Mock).mock.calls[0][0];
        expect(errorMessage).toMatch(/events plugin declared action invalid/);
        expect(errorMessage).toMatch(/disallowed in a phase’s `onBegin` hook/);
      });

      test('phase.onEnd', () => {
        const game: Game = {
          phases: {
            A: {
              start: true,
              onEnd: setStage,
            },
          },
        };
        const client = Client({ game });
        expect(error).not.toHaveBeenCalled();
        client.events.endPhase();
        expect(error).toHaveBeenCalled();
        const errorMessage = (error as jest.Mock).mock.calls[0][0];
        expect(errorMessage).toMatch(/events plugin declared action invalid/);
        expect(errorMessage).toMatch(/disallowed in `onEnd` hooks/);
      });

      test('turn.onBegin', () => {
        const game: Game = {
          turn: {
            onBegin: setStage,
          },
        };
        Client({ game });
        expect(error).toHaveBeenCalled();
        const errorMessage = (error as jest.Mock).mock.calls[0][0];
        expect(errorMessage).toMatch(/events plugin declared action invalid/);
        expect(errorMessage).toMatch(/disallowed in `turn.onBegin`/);
      });

      test('turn.onEnd', () => {
        const game: Game = {
          turn: {
            onEnd: setStage,
          },
        };
        const client = Client({ game });
        expect(error).not.toHaveBeenCalled();
        client.events.endTurn();
        expect(error).toHaveBeenCalled();
        const errorMessage = (error as jest.Mock).mock.calls[0][0];
        expect(errorMessage).toMatch(/events plugin declared action invalid/);
        expect(errorMessage).toMatch(/disallowed in `onEnd` hooks/);
      });
    });
  });

  describe('endStage', () => {
    test('basic', () => {
      const flow = Flow({
        turn: {
          activePlayers: { currentPlayer: 'A' },
        },
      });
      let state = { G: {}, ctx: flow.ctx(2) } as State;
      state = flow.init(state);

      expect(state.ctx.activePlayers).toEqual({ '0': 'A' });
      state = flow.processEvent(state, gameEvent('endStage'));
      expect(state.ctx.activePlayers).toBeNull();
    });

    test('with multiple active players', () => {
      const flow = Flow({
        turn: {
          activePlayers: { all: 'A', maxMoves: 5 },
        },
      });
      let state = { G: {}, ctx: flow.ctx(3) } as State;
      state = flow.init(state);

      expect(state.ctx.activePlayers).toEqual({ '0': 'A', '1': 'A', '2': 'A' });
      state = flow.processEvent(state, gameEvent('endStage'));
      expect(state.ctx.activePlayers).toEqual({ '1': 'A', '2': 'A' });
    });

    test('with min moves', () => {
      const flow = Flow({
        turn: {
          activePlayers: { all: 'A', minMoves: 2 },
        },
      });
      let state = { G: {}, ctx: flow.ctx(2) } as State;
      state = flow.init(state);

      expect(state.ctx.activePlayers).toEqual({ '0': 'A', '1': 'A' });

      state = flow.processEvent(state, gameEvent('endStage'));

      // player 0 is not allowed to end the stage, they haven't made any move yet
      expect(state.ctx.activePlayers).toEqual({ '0': 'A', '1': 'A' });

      state = flow.processMove(state, makeMove('move', null, '0').payload);
      state = flow.processEvent(state, gameEvent('endStage'));

      // player 0 is still not allowed to end the stage, they haven't made the minimum number of moves
      expect(state.ctx.activePlayers).toEqual({ '0': 'A', '1': 'A' });

      state = flow.processMove(state, makeMove('move', null, '0').payload);
      state = flow.processEvent(state, gameEvent('endStage'));

      // having made 2 moves, player 0 was allowed to end the stage
      expect(state.ctx.activePlayers).toEqual({ '1': 'A' });
    });

    test('maintains move count', () => {
      const flow = Flow({
        moves: { A: () => {} },
        turn: {
          activePlayers: { currentPlayer: 'A' },
        },
      });
      let state = { G: {}, ctx: flow.ctx(2) } as State;
      state = flow.init(state);

      expect(state.ctx._activePlayersNumMoves).toMatchObject({ '0': 0 });
      state = flow.processMove(state, makeMove('A', null, '0').payload);
      expect(state.ctx._activePlayersNumMoves).toMatchObject({ '0': 1 });
      state = flow.processEvent(state, gameEvent('endStage'));
      expect(state.ctx._activePlayersNumMoves).toMatchObject({ '0': 1 });
    });

    test('sets to next', () => {
      const flow = Flow({
        turn: {
          activePlayers: { currentPlayer: 'A1', others: 'B1' },
          stages: {
            A1: { next: 'A2' },
            B1: { next: 'B2' },
          },
        },
      });
      let state = { G: {}, ctx: flow.ctx(2) } as State;
      state = flow.init(state);

      expect(state.ctx.activePlayers).toMatchObject({
        '0': 'A1',
        '1': 'B1',
      });

      state = flow.processEvent(state, gameEvent('endStage', null, '0'));

      expect(state.ctx.activePlayers).toMatchObject({
        '0': 'A2',
        '1': 'B1',
      });

      state = flow.processEvent(state, gameEvent('endStage', null, '1'));

      expect(state.ctx.activePlayers).toMatchObject({
        '0': 'A2',
        '1': 'B2',
      });
    });

    describe('disallowed in hooks', () => {
      const endStage: MoveFn = ({ events }) => {
        events.endStage();
      };

      test('phase.onBegin', () => {
        const game: Game = {
          phases: {
            A: {
              start: true,
              onBegin: endStage,
            },
          },
        };
        Client({ game });
        expect(error).toHaveBeenCalled();
        const errorMessage = (error as jest.Mock).mock.calls[0][0];
        expect(errorMessage).toMatch(/events plugin declared action invalid/);
        expect(errorMessage).toMatch(/disallowed in a phase’s `onBegin` hook/);
      });

      test('phase.onEnd', () => {
        const game: Game = {
          phases: {
            A: {
              start: true,
              onEnd: endStage,
            },
          },
        };
        const client = Client({ game });
        expect(error).not.toHaveBeenCalled();
        client.events.endPhase();
        expect(error).toHaveBeenCalled();
        const errorMessage = (error as jest.Mock).mock.calls[0][0];
        expect(errorMessage).toMatch(/events plugin declared action invalid/);
        expect(errorMessage).toMatch(/disallowed in `onEnd` hooks/);
      });

      test('turn.onBegin', () => {
        const game: Game = {
          turn: {
            onBegin: endStage,
          },
        };
        Client({ game });
        expect(error).toHaveBeenCalled();
        const errorMessage = (error as jest.Mock).mock.calls[0][0];
        expect(errorMessage).toMatch(/events plugin declared action invalid/);
        expect(errorMessage).toMatch(/disallowed in `turn.onBegin`/);
      });

      test('turn.onEnd', () => {
        const game: Game = {
          turn: {
            onEnd: endStage,
          },
        };
        const client = Client({ game });
        expect(error).not.toHaveBeenCalled();
        client.events.endTurn();
        expect(error).toHaveBeenCalled();
        const errorMessage = (error as jest.Mock).mock.calls[0][0];
        expect(errorMessage).toMatch(/events plugin declared action invalid/);
        expect(errorMessage).toMatch(/disallowed in `onEnd` hooks/);
      });
    });
  });

  describe('setActivePlayers', () => {
    test('basic', () => {
      const client = Client({
        numPlayers: 3,
        game: {
          turn: {
            onBegin: ({ events }) => {
              events.setActivePlayers({ currentPlayer: 'A' });
            },
          },
          moves: {
            updateActivePlayers: ({ events }) => {
              events.setActivePlayers({ others: 'B' });
            },
          },
        },
      });
      expect(client.getState().ctx.activePlayers).toEqual({ '0': 'A' });
      client.moves.updateActivePlayers();
      expect(client.getState().ctx.activePlayers).toEqual({
        '1': 'B',
        '2': 'B',
      });
    });

    describe('in hooks', () => {
      const setActivePlayers: MoveFn = ({ events }) => {
        events.setActivePlayers({ currentPlayer: 'A' });
      };

      test('disallowed in phase.onBegin', () => {
        const game: Game = {
          phases: {
            A: {
              start: true,
              onBegin: setActivePlayers,
            },
          },
        };
        Client({ game });
        expect(error).toHaveBeenCalled();
        const errorMessage = (error as jest.Mock).mock.calls[0][0];
        expect(errorMessage).toMatch(/events plugin declared action invalid/);
        expect(errorMessage).toMatch(/disallowed in a phase’s `onBegin` hook/);
      });

      test('disallowed in phase.onEnd', () => {
        const game: Game = {
          phases: {
            A: {
              start: true,
              onEnd: setActivePlayers,
            },
          },
        };
        const client = Client({ game });
        expect(error).not.toHaveBeenCalled();
        client.events.endPhase();
        expect(error).toHaveBeenCalled();
        const errorMessage = (error as jest.Mock).mock.calls[0][0];
        expect(errorMessage).toMatch(/events plugin declared action invalid/);
        expect(errorMessage).toMatch(/disallowed in `onEnd` hooks/);
      });

      test('allowed in turn.onBegin', () => {
        const client = Client({
          game: {
            turn: { onBegin: setActivePlayers },
          },
        });
        expect(client.getState().ctx.activePlayers).toEqual({ '0': 'A' });
        expect(error).not.toHaveBeenCalled();
      });

      test('disallowed in turn.onEnd', () => {
        const game: Game = {
          turn: {
            onEnd: setActivePlayers,
          },
        };
        const client = Client({ game });
        expect(error).not.toHaveBeenCalled();
        client.events.endTurn();
        expect(error).toHaveBeenCalled();
        const errorMessage = (error as jest.Mock).mock.calls[0][0];
        expect(errorMessage).toMatch(/events plugin declared action invalid/);
        expect(errorMessage).toMatch(/disallowed in `onEnd` hooks/);
      });
    });
  });
});

test('init', () => {
  let flow = Flow({
    phases: { A: { start: true, onEnd: () => ({ done: true }) } },
  });

  const orig = flow.ctx(2);
  let state = { G: {}, ctx: orig } as State;
  state = flow.processEvent(state, gameEvent('init'));
  expect(state).toEqual({ G: {}, ctx: orig });

  flow = Flow({
    phases: { A: { start: true, onBegin: () => ({ done: true }) } },
  });

  state = { ctx: orig } as State;
  state = flow.init(state);
  expect(state.G).toMatchObject({ done: true });
});

test('next', () => {
  const flow = Flow({
    phases: {
      A: { start: true, next: () => 'C' },
      B: {},
      C: {},
    },
  });

  let state = { ctx: flow.ctx(3) } as State;
  state = flow.processEvent(state, gameEvent('endPhase'));

  expect(state.ctx.phase).toEqual('C');
});

describe('endIf', () => {
  test('basic', () => {
    const flow = Flow({ endIf: ({ G }) => G.win });

    let state = flow.init({ G: {}, ctx: flow.ctx(2) } as State);
    state = flow.processEvent(state, gameEvent('endTurn'));
    expect(state.ctx.gameover).toBe(undefined);

    state.G = { win: 'A' };

    {
      const t = flow.processEvent(state, gameEvent('endTurn'));
      expect(t.ctx.gameover).toBe('A');
    }

    {
      const t = flow.processMove(state, makeMove('move').payload);
      expect(t.ctx.gameover).toBe('A');
    }
  });

  test('phase automatically ends', () => {
    const game: Game = {
      phases: {
        A: {
          start: true,
          moves: {
            A: () => ({ win: 'A' }),
            B: ({ G }) => G,
          },
        },
      },
      endIf: ({ G }) => G.win,
    };
    const client = Client({ game });

    expect(client.getState().ctx.currentPlayer).toBe('0');
    client.moves.B();
    expect(client.getState().ctx.gameover).toBe(undefined);

    expect(client.getState().ctx.currentPlayer).toBe('0');
    client.moves.A();
    expect(client.getState().ctx.gameover).toBe('A');
    expect(
      client.getState().deltalog[client.getState().deltalog.length - 1].action
        .payload.type
    ).toBe('endPhase');
  });

  test('during game initialization with phases', () => {
    const flow = Flow({
      phases: {
        A: {
          start: true,
        },
      },
      endIf: () => 'gameover',
    });

    const state = flow.init({ G: {}, ctx: flow.ctx(2) } as State);
    expect(state.ctx.gameover).toBe('gameover');
  });
});

test('isPlayerActive', () => {
  const playerID = '0';

  const flow = Flow({});
  expect(flow.isPlayerActive({}, {} as Ctx, playerID)).toBe(false);
  expect(
    flow.isPlayerActive(
      {},
      { currentPlayer: '0', activePlayers: { '1': '' } } as unknown as Ctx,
      playerID
    )
  ).toBe(false);
  expect(flow.isPlayerActive({}, { currentPlayer: '0' } as Ctx, playerID)).toBe(
    true
  );
});

describe('endGame', () => {
  let client: ReturnType<typeof Client>;
  beforeEach(() => {
    const game: Game = {
      events: { endGame: true },
    };
    client = Client({ game });
  });

  test('without arguments', () => {
    client.events.endGame();
    expect(client.getState().ctx.gameover).toBe(true);
  });

  test('with arguments', () => {
    client.events.endGame(42);
    expect(client.getState().ctx.gameover).toBe(42);
  });
});

describe('endTurn args', () => {
  const flow = Flow({
    phases: { A: { start: true, next: 'B' }, B: {}, C: {} },
  });

  const state = { ctx: flow.ctx(3) } as State;

  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('no args', () => {
    let t = state;
    t = flow.processEvent(t, gameEvent('endPhase'));
    t = flow.processEvent(t, gameEvent('endTurn'));
    expect(t.ctx.playOrderPos).toBe(1);
    expect(t.ctx.currentPlayer).toBe('1');
    expect(t.ctx.phase).toBe('B');
  });

  test('invalid arg to endTurn', () => {
    let t = state;
    t = flow.processEvent(t, gameEvent('endTurn', '2'));
    expect(error).toBeCalledWith(`invalid argument to endTurn: 2`);
    expect(t.ctx.currentPlayer).toBe('0');
  });

  test('valid args', () => {
    let t = state;
    t = flow.processEvent(t, gameEvent('endTurn', { next: '2' }));
    expect(t.ctx.playOrderPos).toBe(2);
    expect(t.ctx.currentPlayer).toBe('2');
  });
});

describe('pass args', () => {
  const flow = Flow({
    phases: { A: { start: true, next: 'B' }, B: {}, C: {} },
  });

  const state = { ctx: flow.ctx(3) } as State;

  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('no args', () => {
    let t = state;
    t = flow.processEvent(t, gameEvent('pass'));
    expect(t.ctx.turn).toBe(1);
    expect(t.ctx.playOrderPos).toBe(1);
    expect(t.ctx.currentPlayer).toBe('1');
  });

  test('invalid arg to pass', () => {
    let t = state;
    t = flow.processEvent(t, gameEvent('pass', '2'));
    expect(error).toBeCalledWith(`invalid argument to endTurn: 2`);
    expect(t.ctx.currentPlayer).toBe('0');
  });

  test('valid args', () => {
    let t = state;
    t = flow.processEvent(t, gameEvent('pass', { remove: true }));
    expect(t.ctx.turn).toBe(1);
    expect(t.ctx.playOrderPos).toBe(0);
    expect(t.ctx.currentPlayer).toBe('1');
  });

  test('removing all players ends phase', () => {
    let t = state;
    t = flow.processEvent(t, gameEvent('pass', { remove: true }));
    t = flow.processEvent(t, gameEvent('pass', { remove: true }));
    t = flow.processEvent(t, gameEvent('pass', { remove: true }));
    expect(t.ctx.playOrderPos).toBe(0);
    expect(t.ctx.currentPlayer).toBe('0');
    expect(t.ctx.phase).toBe('B');
  });

  test('playOrderPos does not go out of bounds when passing at the end of the list', () => {
    let t = state;
    t = flow.processEvent(t, gameEvent('pass'));
    t = flow.processEvent(t, gameEvent('pass'));
    t = flow.processEvent(t, gameEvent('pass', { remove: true }));
    expect(t.ctx.currentPlayer).toBe('0');
  });

  test('removing a player deeper into play order returns correct updated playOrder', () => {
    let t = state;
    t = flow.processEvent(t, gameEvent('pass'));
    t = flow.processEvent(t, gameEvent('pass', { remove: true }));
    expect(t.ctx.playOrderPos).toBe(1);
    expect(t.ctx.currentPlayer).toBe('2');
  });
});

test('undoable moves', () => {
  const game: Game = {
    moves: {
      A: {
        move: () => ({ A: true }),
        undoable: ({ ctx }) => {
          return ctx.phase == 'A';
        },
      },
      B: {
        move: () => ({ B: true }),
        undoable: false,
      },
      C: () => ({ C: true }),
    },

    phases: {
      A: { start: true },
      B: {},
    },
  };

  const client = Client({ game });

  client.moves.A();
  expect(client.getState().G).toEqual({ A: true });
  client.undo();
  expect(client.getState().G).toEqual({});
  client.moves.B();
  expect(client.getState().G).toEqual({ B: true });
  client.undo();
  expect(client.getState().G).toEqual({ B: true });
  client.moves.C();
  expect(client.getState().G).toEqual({ C: true });
  client.undo();
  expect(client.getState().G).toEqual({ B: true });

  client.reset();
  client.events.setPhase('B');
  expect(client.getState().ctx.phase).toBe('B');

  client.moves.A();
  expect(client.getState().G).toEqual({ A: true });
  client.undo();
  expect(client.getState().G).toEqual({ A: true });
  client.moves.B();
  expect(client.getState().G).toEqual({ B: true });
  client.undo();
  expect(client.getState().G).toEqual({ B: true });
  client.moves.C();
  expect(client.getState().G).toEqual({ C: true });
  client.undo();
  expect(client.getState().G).toEqual({ B: true });
});

describe('moveMap', () => {
  const game: Game = {
    moves: { A: () => {} },

    turn: {
      stages: {
        SA: {
          moves: {
            A: () => {},
          },
        },
      },
    },

    phases: {
      PA: {
        moves: {
          A: () => {},
        },

        turn: {
          stages: {
            SB: {
              moves: {
                A: () => {},
              },
            },
          },
        },
      },
    },
  };

  test('basic', () => {
    const { moveMap } = Flow(game);
    expect(Object.keys(moveMap)).toEqual(['PA.A', 'PA.SB.A', '.SA.A']);
  });
});

describe('infinite loops', () => {
  test('infinite loop of self-ending phases via endIf', () => {
    const endIf = () => true;
    const game: Game = {
      phases: {
        A: { endIf, next: 'B', start: true },
        B: { endIf, next: 'A' },
      },
    };
    const client = Client({ game });
    expect(client.getState().ctx.phase).toBe(null);
  });

  test('infinite endPhase loop from phase.onBegin', () => {
    const onBegin = ({ events }) => void events.endPhase();
    const game: Game = {
      phases: {
        A: {
          onBegin,
          next: 'B',
          start: true,
          moves: {
            a: ({ events }) => void events.endPhase(),
          },
        },
        B: { onBegin, next: 'C' },
        C: { onBegin, next: 'A' },
      },
    };

    // The onBegin fails to end the phase during initialisation.
    const client = Client({ game, numPlayers: 3 });
    let state = client.getState();
    expect(state.ctx.phase).toBe('A');
    expect(state.ctx.turn).toBe(1);
    expect(error).toHaveBeenCalled();
    {
      const errorMessage = (error as jest.Mock).mock.calls[0][0];
      expect(errorMessage).toMatch(/events plugin declared action invalid/);
      expect(errorMessage).toMatch(/Maximum number of turn endings exceeded/);
    }
    jest.clearAllMocks();

    // Moves also fail because of the infinite loop (the game is stuck).
    client.moves.a();
    state = client.getState();
    expect(error).toHaveBeenCalled();
    {
      const errorMessage = (error as jest.Mock).mock.calls[0][0];
      expect(errorMessage).toMatch(/events plugin declared action invalid/);
      expect(errorMessage).toMatch(/Maximum number of turn endings exceeded/);
    }
    expect(state.ctx.phase).toBe('A');
    expect(state.ctx.turn).toBe(1);
  });

  test('double phase ending from client event and turn.onEnd', () => {
    const game: Game = {
      turn: {
        onEnd: ({ events }) => void events.endPhase(),
      },
      phases: {
        A: { next: 'B', start: true },
        B: { next: 'C' },
        C: { next: 'A' },
      },
    };
    const client = Client({ game });

    let state = client.getState();
    expect(state.ctx.phase).toBe('A');
    expect(state.ctx.turn).toBe(1);
    client.events.endPhase();

    state = client.getState();
    expect(state.ctx.phase).toBe('B');
    expect(state.ctx.turn).toBe(2);
  });

  test('infinite turn endings from turn.onBegin', () => {
    const game: Game = {
      moves: {
        endTurn: ({ events }) => {
          events.endTurn();
        },
      },
      turn: {
        onBegin: ({ events }) => void events.endTurn(),
      },
    };
    const client = Client({ game });
    const initialState = client.getState();
    expect(client.getState().ctx.currentPlayer).toBe('0');

    // Trigger infinite loop
    client.moves.endTurn();

    // Expect state to be unchanged and error to be logged.
    expect(error).toHaveBeenCalled();
    const errorMessage = (error as jest.Mock).mock.calls[0][0];
    expect(errorMessage).toMatch(/events plugin declared action invalid/);
    expect(errorMessage).toMatch(/Maximum number of turn endings exceeded/);
    expect(client.getState().ctx.currentPlayer).toBe('0');
    expect(client.getState()).toEqual({ ...initialState, deltalog: [] });
  });

  test('double turn ending from event and endIf', () => {
    const game: Game = {
      moves: {
        endTurn: ({ events }) => {
          events.endTurn();
        },
      },
      turn: {
        endIf: () => true,
      },
    };
    const client = Client({ game });

    // turn.endIf is ignored during game setup.
    let state = client.getState();
    expect(state.ctx.currentPlayer).toBe('0');
    expect(state.ctx.turn).toBe(1);

    // turn.endIf is ignored when the turn was just ended.
    client.moves.endTurn();
    state = client.getState();
    expect(state.ctx.currentPlayer).toBe('1');
    expect(state.ctx.turn).toBe(2);
  });

  test('endIf that triggers endIf', () => {
    const game: Game = {
      phases: {
        A: {
          endIf: ({ events }) => {
            events.setActivePlayers({ currentPlayer: 'A' });
          },
        },
      },
    };
    const client = Client({ game });
    client.events.setPhase('A');
    expect(error).toHaveBeenCalled();
    const errorMessage = (error as jest.Mock).mock.calls[0][0];
    expect(errorMessage).toMatch(/events plugin declared action invalid/);
    expect(errorMessage).toMatch(
      /Events must be called from moves or the `.+` hooks./
    );
  });
});

describe('events in hooks', () => {
  const moves = {
    setAutoEnd: () => ({ shouldEnd: true }),
  };

  describe('endTurn', () => {
    const conditionalEndTurn = ({ G, events }) => {
      if (!G.shouldEnd) return;
      G.shouldEnd = false;
      events.endTurn();
    };

    test('can end turn from turn.onBegin', () => {
      const client = Client({
        game: { moves, turn: { onBegin: conditionalEndTurn } },
      });

      client.moves.setAutoEnd();

      let state = client.getState();
      expect(state.ctx.turn).toBe(1);
      expect(state.ctx.currentPlayer).toBe('0');

      client.events.endTurn();
      state = client.getState();
      expect(state.ctx.turn).toBe(3);
      expect(state.ctx.currentPlayer).toBe('0');
    });

    test('cannot end turn from phase.onBegin', () => {
      const client = Client({
        game: {
          moves,
          phases: {
            A: { onBegin: conditionalEndTurn },
          },
        },
      });

      client.moves.setAutoEnd();

      let state = client.getState();
      expect(state.ctx.turn).toBe(1);
      expect(state.ctx.currentPlayer).toBe('0');
      expect(state.ctx.phase).toBeNull();

      client.events.setPhase('A');
      state = client.getState();
      expect(state.ctx.turn).toBe(2);
      expect(state.ctx.currentPlayer).toBe('1');
      expect(state.ctx.phase).toBe('A');
    });

    test('can end turn from turn.onBegin at start of phase', () => {
      const client = Client({
        game: {
          moves,
          phases: {
            A: {
              turn: { onBegin: conditionalEndTurn },
            },
          },
        },
      });

      client.moves.setAutoEnd();

      let state = client.getState();
      expect(state.ctx.phase).toBeNull();
      expect(state.ctx.turn).toBe(1);
      expect(state.ctx.currentPlayer).toBe('0');

      client.events.setPhase('A');
      state = client.getState();
      expect(state.ctx.phase).toBe('A');
      expect(state.ctx.turn).toBe(3);
      expect(state.ctx.currentPlayer).toBe('0');
    });

    test('cannot end turn from turn.onEnd', () => {
      const client = Client({
        game: {
          moves,
          turn: { onEnd: conditionalEndTurn },
        },
      });

      let state = client.getState();
      expect(state.ctx.turn).toBe(1);
      expect(state.ctx.currentPlayer).toBe('0');

      client.moves.setAutoEnd();
      client.events.endTurn();
      state = client.getState();
      expect(state.ctx.turn).toBe(1);
      expect(state.ctx.currentPlayer).toBe('0');
      expect(error).toHaveBeenCalled();
      const errorMessage = (error as jest.Mock).mock.calls[0][0];
      expect(errorMessage).toMatch(/events plugin declared action invalid/);
      expect(errorMessage).toMatch(/`endTurn` is disallowed in `onEnd` hooks/);
    });

    test('cannot end turn from phase.onEnd', () => {
      const client = Client({
        game: {
          moves,
          phases: {
            A: {
              start: true,
              onEnd: conditionalEndTurn,
            },
          },
        },
      });

      let state = client.getState();
      expect(state.ctx.turn).toBe(1);
      expect(state.ctx.currentPlayer).toBe('0');
      expect(state.ctx.phase).toBe('A');

      client.moves.setAutoEnd();
      client.events.endPhase();
      state = client.getState();
      expect(state.ctx.turn).toBe(1);
      expect(state.ctx.currentPlayer).toBe('0');
      expect(state.ctx.phase).toBe('A');
      expect(error).toHaveBeenCalled();
      const errorMessage = (error as jest.Mock).mock.calls[0][0];
      expect(errorMessage).toMatch(/events plugin declared action invalid/);
      expect(errorMessage).toMatch(/`endTurn` is disallowed in `onEnd` hooks/);
    });
  });

  describe('endPhase', () => {
    const conditionalEndPhase = ({ G, events }) => {
      if (!G.shouldEnd) return;
      G.shouldEnd = false;
      events.endPhase();
    };

    test('can end phase from turn.onBegin', () => {
      const client = Client({
        game: {
          moves,
          phases: {
            A: {
              start: true,
              turn: { onBegin: conditionalEndPhase },
            },
          },
        },
      });

      let state = client.getState();
      expect(state.ctx.turn).toBe(1);
      expect(state.ctx.currentPlayer).toBe('0');
      expect(state.ctx.phase).toBe('A');

      client.moves.setAutoEnd();
      client.events.endTurn();
      state = client.getState();
      expect(state.ctx.turn).toBe(3);
      expect(state.ctx.currentPlayer).toBe('0');
      expect(state.ctx.phase).toBeNull();
    });

    test('can end phase from phase.onBegin', () => {
      const client = Client({
        game: {
          moves,
          phases: {
            A: { onBegin: conditionalEndPhase },
          },
        },
      });

      let state = client.getState();
      expect(state.ctx.turn).toBe(1);
      expect(state.ctx.currentPlayer).toBe('0');
      expect(state.ctx.phase).toBeNull();

      client.moves.setAutoEnd();
      client.events.setPhase('A');
      state = client.getState();
      expect(state.ctx.turn).toBe(3);
      expect(state.ctx.currentPlayer).toBe('0');
      expect(state.ctx.phase).toBeNull();
    });

    test('can end phase from turn.onEnd', () => {
      const client = Client({
        game: {
          moves,
          phases: {
            A: {
              start: true,
              turn: { onEnd: conditionalEndPhase },
            },
          },
        },
      });

      let state = client.getState();
      expect(state.ctx.turn).toBe(1);
      expect(state.ctx.currentPlayer).toBe('0');
      expect(state.ctx.phase).toBe('A');

      client.moves.setAutoEnd();
      client.events.endTurn();
      state = client.getState();
      // TODO: This is likely not the desired behaviour. Turn 1 is ended,
      // then the phase is ended, automatically ending turn 2, ending up in turn 3.
      // Turn 2 is effectively skipped. Works better with TurnOrder.CONTINUE.
      expect(state.ctx.turn).toBe(3);
      expect(state.ctx.currentPlayer).toBe('0');
      expect(state.ctx.phase).toBeNull();
    });

    test('cannot end phase from phase.onEnd', () => {
      const client = Client({
        game: {
          moves,
          phases: {
            A: {
              start: true,
              next: 'B',
              onEnd: conditionalEndPhase,
            },
            B: {},
          },
        },
      });

      let state = client.getState();
      expect(state.ctx.turn).toBe(1);
      expect(state.ctx.currentPlayer).toBe('0');
      expect(state.ctx.phase).toBe('A');

      client.moves.setAutoEnd();
      client.events.endPhase();
      state = client.getState();
      expect(state.ctx.turn).toBe(1);
      expect(state.ctx.currentPlayer).toBe('0');
      expect(state.ctx.phase).toBe('A');
      expect(error).toHaveBeenCalled();
      const errorMessage = (error as jest.Mock).mock.calls[0][0];
      expect(errorMessage).toMatch(/events plugin declared action invalid/);
      expect(errorMessage).toMatch(
        /`setPhase` & `endPhase` are disallowed in a phase’s `onEnd` hook/
      );
    });
  });
});

describe('activePlayers', () => {
  test('sets activePlayers at each turn', () => {
    const game: Game = {
      turn: {
        stages: { A: {}, B: {} },
        activePlayers: {
          currentPlayer: 'A',
          others: 'B',
        },
      },
    };

    const client = Client({ game, numPlayers: 3 });

    expect(client.getState().ctx.currentPlayer).toBe('0');
    expect(client.getState().ctx.activePlayers).toEqual({
      '0': 'A',
      '1': 'B',
      '2': 'B',
    });

    client.events.endTurn();

    expect(client.getState().ctx.currentPlayer).toBe('1');
    expect(client.getState().ctx.activePlayers).toEqual({
      '0': 'B',
      '1': 'A',
      '2': 'B',
    });
  });
});

test('events in hooks triggered by moves should be processed', () => {
  const game: Game = {
    turn: {
      onBegin: ({ events }) => {
        events.setActivePlayers({ currentPlayer: 'A' });
      },
    },
    moves: {
      endTurn: ({ events }) => {
        events.endTurn();
      },
    },
  };

  const client = Client({ game, numPlayers: 3 });

  expect(client.getState().ctx.currentPlayer).toBe('0');
  expect(client.getState().ctx.activePlayers).toEqual({
    '0': 'A',
  });

  client.moves.endTurn();

  expect(client.getState().ctx.currentPlayer).toBe('1');
  expect(client.getState().ctx.activePlayers).toEqual({
    '1': 'A',
  });
});

test('stage events should not be processed out of turn', () => {
  const game: Game = {
    phases: {
      A: {
        start: true,
        turn: {
          activePlayers: {
            all: 'A1',
          },
          stages: {
            A1: {
              moves: {
                endStage: ({ G, events }) => {
                  G.endStage = true;
                  events.endStage();
                },
              },
            },
          },
        },
        endIf: ({ G }) => G.endStage,
        next: 'B',
      },
      B: {
        turn: {
          activePlayers: {
            all: 'B1',
          },
          stages: {
            B1: {},
          },
        },
      },
    },
  };

  const client = Client({ game, numPlayers: 3 });

  expect(client.getState().ctx.activePlayers).toEqual({
    '0': 'A1',
    '1': 'A1',
    '2': 'A1',
  });

  client.moves.endStage();

  expect(client.getState().ctx.activePlayers).toEqual({
    '0': 'B1',
    '1': 'B1',
    '2': 'B1',
  });
});

describe('backwards compatibility for moveLimit', () => {
  test('turn config maps moveLimit to minMoves/maxMoves', () => {
    const flow = Flow({
      moves: {
        pass: () => {},
      },
      turn: {
        moveLimit: 2,
      },
    });
    let state = flow.init({ ctx: flow.ctx(2) } as State);

    expect(state.ctx.turn).toBe(1);
    expect(state.ctx.currentPlayer).toBe('0');

    state = flow.processMove(state, makeMove('pass', null, '0').payload);
    state = flow.processMove(state, makeMove('pass', null, '0').payload);

    expect(state.ctx.turn).toBe(2);
    expect(state.ctx.currentPlayer).toBe('1');

    state = flow.processMove(state, makeMove('pass', null, '1').payload);

    state = flow.processEvent(state, gameEvent('endTurn', null, '1'));

    // player should not be able to endTurn because they haven't made minMoves yet

    expect(state.ctx.turn).toBe(2);
    expect(state.ctx.currentPlayer).toBe('1');
  });

  test('setActivePlayers maps moveLimit to maxMoves only', () => {
    const flow = Flow({});
    let state = flow.init({ ctx: flow.ctx(2) } as State);

    expect(state.ctx._activePlayersMinMoves).toBeNull();
    expect(state.ctx._activePlayersMaxMoves).toBeNull();

    state = flow.processEvent(
      state,
      gameEvent('setActivePlayers', { all: 'A', moveLimit: 1 })
    );

    expect(state.ctx._activePlayersMinMoves).toBeNull();
    expect(state.ctx._activePlayersMaxMoves).toEqual({ '0': 1, '1': 1 });
  });

  test('setStage maps moveLimit to maxMoves only', () => {
    const flow = Flow({});
    let state = flow.init({ ctx: flow.ctx(2) } as State);

    expect(state.ctx._activePlayersMinMoves).toBeNull();
    expect(state.ctx._activePlayersMaxMoves).toBeNull();
    state = flow.processEvent(
      state,
      gameEvent('setStage', { stage: 'A', moveLimit: 2 })
    );
    expect(state.ctx._activePlayersMinMoves).toBeNull();
    expect(state.ctx._activePlayersMaxMoves).toEqual({ '0': 2 });
  });
});

// These tests serve to document the order in which the various game hooks
// are executed and also to catch any potential breaking changes.
describe('hook execution order', () => {
  const calls: string[] = [];
  afterEach(() => {
    calls.length = 0;
  });

  const client = Client({
    playerID: '0',
    game: {
      moves: {
        move: () => void calls.push('move'),
        setStage: ({ events }) => {
          events.setStage('A');
          calls.push('moves.setStage');
        },
        endStage: ({ events }) => {
          events.endStage();
          calls.push('moves.endStage');
        },
        setActivePlayers: ({ events }) => {
          events.setActivePlayers({ all: 'A', minMoves: 1, maxMoves: 1 });
          calls.push('moves.setActivePlayers');
        },
      },
      endIf: () => void calls.push('game.endIf'),
      onEnd: () => void calls.push('game.onEnd'),
      turn: {
        activePlayers: { all: 'A' },
        endIf: () => void calls.push('turn.endIf'),
        onBegin: () => void calls.push('turn.onBegin'),
        onMove: () => void calls.push('turn.onMove'),
        onEnd: () => void calls.push('turn.onEnd'),
        order: {
          first: () => calls.push('turn.order.first') && 0,
          next: () => calls.push('turn.order.next') && 0,
          playOrder: () => calls.push('turn.order.playOrder') && ['0', '1'],
        },
      },
      phases: {
        A: {
          start: true,
          next: 'B',
          endIf: () => void calls.push('phaseA.endIf'),
          onBegin: () => void calls.push('phaseA.onBegin'),
          onEnd: () => void calls.push('phaseA.onEnd'),
        },
        B: {
          next: 'A',
          endIf: () => void calls.push('phaseB.endIf'),
          onBegin: () => void calls.push('phaseB.onBegin'),
          onEnd: () => void calls.push('phaseB.onEnd'),
        },
      },
    },
  });

  test('hooks called during setup', () => {
    expect(calls).toEqual([
      'game.endIf',
      'phaseA.endIf',
      'phaseA.onBegin',
      'game.endIf',
      'phaseA.endIf',
      'turn.order.playOrder',
      'turn.order.first',
      'turn.onBegin',
      'game.endIf',
      'phaseA.endIf',
    ]);
  });

  test('hooks called on move', () => {
    client.moves.move();
    expect(calls).toEqual([
      'move',
      'turn.onMove',
      'game.endIf',
      'phaseA.endIf',
      'turn.endIf',
    ]);
  });

  test('hooks called on setStage', () => {
    client.events.setStage('B');
    expect(calls).toEqual([
      'game.endIf',
      'phaseA.endIf',
      'game.endIf',
      'phaseA.endIf',
      'turn.endIf',
    ]);
  });

  test('hooks called on endStage', () => {
    client.updatePlayerID('1');
    client.events.endStage();
    client.updatePlayerID('0');
    expect(calls).toEqual([
      'game.endIf',
      'phaseA.endIf',
      'game.endIf',
      'phaseA.endIf',
      'turn.endIf',
    ]);
  });

  test('hooks called on setActivePlayers', () => {
    client.events.setActivePlayers({});
    expect(calls).toEqual(['game.endIf', 'phaseA.endIf', 'turn.endIf']);
  });

  test('hooks called on setStage triggered by move', () => {
    client.moves.setStage();
    expect(calls).toEqual([
      'moves.setStage',
      'turn.onMove',
      'game.endIf',
      'phaseA.endIf',
      'turn.endIf',
      'game.endIf',
      'phaseA.endIf',
      'game.endIf',
      'phaseA.endIf',
      'turn.endIf',
    ]);
  });

  test('hooks called on endStage triggered by move', () => {
    client.moves.endStage();
    expect(calls).toEqual([
      'moves.endStage',
      'turn.onMove',
      'game.endIf',
      'phaseA.endIf',
      'turn.endIf',
      'game.endIf',
      'phaseA.endIf',
      'game.endIf',
      'phaseA.endIf',
      'turn.endIf',
    ]);
  });

  test('hooks called on setActivePlayers triggered by move', () => {
    client.moves.setActivePlayers();
    expect(calls).toEqual([
      'moves.setActivePlayers',
      'turn.onMove',
      'game.endIf',
      'phaseA.endIf',
      'turn.endIf',
      'game.endIf',
      'phaseA.endIf',
      'turn.endIf',
    ]);
  });

  test('hooks called on stage end triggered by maxMoves', () => {
    client.updatePlayerID('1');
    client.moves.move();
    client.updatePlayerID('0');
    expect(calls).toEqual([
      'move',
      'turn.onMove',
      'game.endIf',
      'phaseA.endIf',
      'turn.endIf',
    ]);
  });

  test('hooks called on endTurn', () => {
    client.events.endTurn();
    expect(calls).toEqual([
      'turn.onEnd',
      'game.endIf',
      'phaseA.endIf',
      'turn.order.next',
      'game.endIf',
      'phaseA.endIf',
      'turn.onBegin',
      'game.endIf',
      'phaseA.endIf',
    ]);
  });

  test('hooks called on endPhase', () => {
    client.events.endPhase();
    expect(calls).toEqual([
      'turn.onEnd',
      'phaseA.onEnd',
      'game.endIf',
      'game.endIf',
      'phaseB.endIf',
      'phaseB.onBegin',
      'game.endIf',
      'phaseB.endIf',
      'turn.order.playOrder',
      'turn.order.first',
      'turn.onBegin',
      'game.endIf',
      'phaseB.endIf',
    ]);
  });

  test('hooks called on endGame', () => {
    client.events.endGame(5);
    expect(calls).toEqual(['phaseB.onEnd', 'game.onEnd']);
  });
});

describe('game function signatures', () => {
  const moveA = jest.fn();
  let game: Game;

  let client: ReturnType<typeof Client>;

  // Helpers to check the objects game functions are called with.
  const expectCtx = expect.objectContaining({ numPlayers: 2 });
  const expectEvents = expect.objectContaining({
    endTurn: expect.any(Function),
  });
  const expectRandom = expect.objectContaining({
    D6: expect.any(Function),
  });
  const FnContext = ({
    playerID,
    G = 'G',
  }: { playerID?: PlayerID; G?: any } = {}) => {
    const context: any = {
      G,
      ctx: expectCtx,
      events: expectEvents,
      random: expectRandom,
      testPluginAPI: { foo: 'bar' },
    };
    if (playerID !== undefined) context.playerID = playerID;
    return expect.objectContaining(context);
  };

  beforeEach(() => {
    game = {
      setup: jest.fn(() => 'G'),

      plugins: [
        {
          name: 'testPluginAPI',
          api: () => ({ foo: 'bar' }),
        },
      ],

      onEnd: jest.fn(),
      endIf: jest.fn(({ G }) => G == 'gameover'),

      moves: {
        A: (...args) => moveA(...args),
        endGame: () => 'gameover',
      },

      turn: {
        order: {
          playOrder: jest.fn(({ ctx }) =>
            [...Array.from({ length: ctx.numPlayers })].map((_, i) => i + '')
          ),
          first: jest.fn(TurnOrder.DEFAULT.first),
          next: jest.fn(TurnOrder.DEFAULT.next),
        },
        onBegin: jest.fn(),
        onMove: jest.fn(),
        onEnd: jest.fn(),
        endIf: jest.fn(),
      },

      phases: {
        A: {
          onBegin: jest.fn(),
          onEnd: jest.fn(),
          endIf: jest.fn(),
        },
      },

      events: {
        endPhase: true,
      },
    };

    client = Client({ game, playerID: '0' });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('game.setup', () => {
    expect(game.setup).lastCalledWith(
      // setup context object
      expect.objectContaining({
        ctx: expectCtx,
        events: expectEvents,
        random: expectRandom,
      }),
      // setupData
      undefined
    );
  });

  test('game.onEnd', () => {
    client.events.endGame();
    expect(game.onEnd).lastCalledWith(FnContext());
  });

  test('game.endIf', () => {
    client.moves.endGame();
    expect(game.endIf).lastCalledWith(FnContext({ G: 'gameover' }));
  });

  test('game.turn.order.playOrder', () => {
    expect(game.turn.order.playOrder).lastCalledWith(FnContext());
  });

  test('game.turn.order.first', () => {
    expect(game.turn.order.first).lastCalledWith(FnContext());
  });

  test('game.turn.order.next', () => {
    client.events.endTurn();
    expect(game.turn.order.next).lastCalledWith(FnContext());
  });

  test('game.turn.onBegin', () => {
    expect(game.turn.onBegin).lastCalledWith(FnContext());
  });

  test('game.turn.onMove', () => {
    client.moves.A();
    expect(game.turn.onMove).lastCalledWith(FnContext());
  });

  test('game.turn.onEnd', () => {
    client.events.endTurn();
    expect(game.turn.onEnd).lastCalledWith(FnContext());
  });

  test('game.turn.endIf', () => {
    client.moves.A();
    expect(game.turn.endIf).lastCalledWith(FnContext());
  });

  test('move', () => {
    client.moves.A('arg');
    expect(moveA).lastCalledWith(FnContext({ playerID: '0' }), 'arg');
    client.moves.A(2, 'args');
    expect(moveA).lastCalledWith(FnContext({ playerID: '0' }), 2, 'args');
  });

  test('game.phases.phase.onBegin', () => {
    client.events.setPhase('A');
    expect(game.phases.A.onBegin).lastCalledWith(FnContext());
  });

  test('game.phases.phase.onEnd', () => {
    client.events.setPhase('A');
    client.updatePlayerID('1');
    client.events.endPhase();
    expect(game.phases.A.onEnd).lastCalledWith(FnContext());
  });

  test('game.phases.phase.endIf', () => {
    client.events.setPhase('A');
    expect(game.phases.A.endIf).lastCalledWith(FnContext());
  });
});
