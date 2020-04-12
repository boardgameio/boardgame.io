/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { Flow } from './flow';
import { Client } from '../client/client';
import {
  UpdateTurnOrderState,
  Stage,
  TurnOrder,
  ActivePlayers,
} from './turn-order';
import { makeMove, gameEvent } from './action-creators';
import { CreateGameReducer } from './reducer';
import { InitializeGame } from './initialize';
import { error } from '../core/logger';

jest.mock('../core/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
}));

describe('turn orders', () => {
  // Defines a matcher for testing that ctx has no undefined properties.
  // Identifies which property is undefined.
  expect.extend({
    toHaveUndefinedProperties(ctx) {
      const undefinedEntry = Object.entries(ctx).find(entry => {
        const [, value] = entry;
        return value === undefined;
      });
      if (undefinedEntry === undefined) {
        return {
          message: () => `expected some properties of ctx to be undefined`,
          pass: false,
        };
      } else {
        const [k] = undefinedEntry;
        return {
          message: () => `expected ctx.${k} to be defined`,
          pass: true,
        };
      }
    },
  });

  test('DEFAULT', () => {
    const flow = Flow({
      phases: { A: { start: true, next: 'B' }, B: {} },
    });

    let state = { ctx: flow.ctx(2) };
    state = flow.init(state);
    expect(state.ctx.currentPlayer).toBe('0');
    expect(state.ctx).not.toHaveUndefinedProperties();

    state = flow.processEvent(state, gameEvent('endTurn'));
    expect(state.ctx.currentPlayer).toBe('1');
    state = flow.processEvent(state, gameEvent('endTurn'));
    expect(state.ctx.currentPlayer).toBe('0');
    state = flow.processEvent(state, gameEvent('endTurn'));
    expect(state.ctx.currentPlayer).toBe('1');
    expect(state.ctx.phase).toBe('A');
    state = flow.processEvent(state, gameEvent('endPhase'));
    expect(state.ctx.currentPlayer).toBe('0');
    expect(state.ctx.phase).toBe('B');
  });

  test('CONTINUE', () => {
    const flow = Flow({
      turn: { order: TurnOrder.CONTINUE },
      phases: { A: { start: true, next: 'B' }, B: {} },
    });

    let state = { ctx: flow.ctx(2) };
    state = flow.init(state);
    expect(state.ctx.currentPlayer).toBe('0');
    expect(state.ctx).not.toHaveUndefinedProperties();

    state = flow.processEvent(state, gameEvent('endTurn'));
    expect(state.ctx.currentPlayer).toBe('1');
    state = flow.processEvent(state, gameEvent('endTurn'));
    expect(state.ctx.currentPlayer).toBe('0');
    state = flow.processEvent(state, gameEvent('endTurn'));
    expect(state.ctx.currentPlayer).toBe('1');
    expect(state.ctx.phase).toBe('A');
    state = flow.processEvent(state, gameEvent('endPhase'));
    expect(state.ctx.currentPlayer).toBe('1');
    expect(state.ctx.phase).toBe('B');
  });

  test('RESET', () => {
    const flow = Flow({
      turn: { order: TurnOrder.RESET },
      phases: { A: { start: true, next: 'B' }, B: {} },
    });

    let state = { ctx: flow.ctx(2) };
    state = flow.init(state);
    expect(state.ctx.currentPlayer).toBe('0');
    expect(state.ctx).not.toHaveUndefinedProperties();

    state = flow.processEvent(state, gameEvent('endTurn'));
    expect(state.ctx.currentPlayer).toBe('1');
    state = flow.processEvent(state, gameEvent('endTurn'));
    expect(state.ctx.currentPlayer).toBe('0');
    state = flow.processEvent(state, gameEvent('endTurn'));
    expect(state.ctx.currentPlayer).toBe('1');
    expect(state.ctx.phase).toBe('A');
    state = flow.processEvent(state, gameEvent('endPhase'));
    expect(state.ctx.currentPlayer).toBe('0');
    expect(state.ctx.phase).toBe('B');
  });

  test('ONCE', () => {
    const flow = Flow({
      turn: { order: TurnOrder.ONCE },
      phases: { A: { start: true, next: 'B' }, B: {} },
    });

    let state = { ctx: flow.ctx(2) };
    state = flow.init(state);
    expect(state.ctx.currentPlayer).toBe('0');
    expect(state.ctx).not.toHaveUndefinedProperties();

    state = flow.processEvent(state, gameEvent('endTurn'));
    expect(state.ctx.currentPlayer).toBe('1');
    state = flow.processEvent(state, gameEvent('endTurn'));
    expect(state.ctx.currentPlayer).toBe('0');
    expect(state.ctx.phase).toBe('B');
  });

  test('ALL', () => {
    const flow = Flow({
      turn: { activePlayers: ActivePlayers.ALL },
    });

    let state = { ctx: flow.ctx(2) };
    state = flow.init(state);
    expect(state.ctx.currentPlayer).toBe('0');
    expect(state.ctx.activePlayers).toEqual({
      '0': Stage.NULL,
      '1': Stage.NULL,
    });
    expect(state.ctx).not.toHaveUndefinedProperties();

    state = flow.processEvent(state, gameEvent('endTurn'));
    expect(state.ctx.currentPlayer).toBe('1');
    expect(state.ctx.activePlayers).toEqual({
      '0': Stage.NULL,
      '1': Stage.NULL,
    });
  });

  test('ALL_ONCE', () => {
    const flow = Flow({
      phases: {
        A: { start: true, turn: { activePlayers: ActivePlayers.ALL_ONCE } },
      },
    });

    let state = { ctx: flow.ctx(2) };
    state = flow.init(state);

    expect(state.ctx.phase).toBe('A');
    expect(state.ctx.currentPlayer).toBe('0');
    expect(Object.keys(state.ctx.activePlayers)).toEqual(['0', '1']);
    expect(state.ctx).not.toHaveUndefinedProperties();

    state = flow.processEvent(state, gameEvent('endTurn'));

    expect(state.ctx.phase).toBe('A');
    expect(state.ctx.currentPlayer).toBe('1');
    expect(Object.keys(state.ctx.activePlayers)).toEqual(['0', '1']);

    state = flow.processMove(state, makeMove('', null, '0').payload);

    expect(state.ctx.phase).toBe('A');
    expect(state.ctx.currentPlayer).toBe('1');
    expect(Object.keys(state.ctx.activePlayers)).toEqual(['1']);

    state = flow.processMove(state, makeMove('', null, '1').payload);

    expect(state.ctx.currentPlayer).toBe('1');
    expect(state.ctx.activePlayers).toBeNull();

    state = flow.processMove(state, makeMove('', null, '1').payload);
  });

  test('OTHERS', () => {
    const flow = Flow({
      turn: { activePlayers: ActivePlayers.OTHERS },
    });

    let state = { ctx: flow.ctx(3) };
    state = flow.init(state);
    expect(state.ctx.currentPlayer).toBe('0');
    expect(Object.keys(state.ctx.activePlayers)).toEqual(['1', '2']);
    expect(state.ctx).not.toHaveUndefinedProperties();

    state = flow.processEvent(state, gameEvent('endTurn'));
    expect(state.ctx.currentPlayer).toBe('1');
    expect(Object.keys(state.ctx.activePlayers)).toEqual(['0', '2']);
  });

  test('OTHERS_ONCE', () => {
    const flow = Flow({
      turn: { activePlayers: ActivePlayers.OTHERS_ONCE },
      phases: { A: { start: true } },
    });

    let state = { ctx: flow.ctx(3) };
    state = flow.init(state);

    expect(state.ctx.phase).toBe('A');
    expect(state.ctx.currentPlayer).toBe('0');
    expect(Object.keys(state.ctx.activePlayers)).toEqual(['1', '2']);
    expect(state.ctx).not.toHaveUndefinedProperties();

    state = flow.processEvent(state, gameEvent('endTurn'));

    expect(state.ctx.phase).toBe('A');
    expect(state.ctx.currentPlayer).toBe('1');
    expect(Object.keys(state.ctx.activePlayers)).toEqual(['0', '2']);

    state = flow.processMove(state, makeMove('', null, '0').payload);

    expect(state.ctx.phase).toBe('A');
    expect(state.ctx.currentPlayer).toBe('1');
    expect(Object.keys(state.ctx.activePlayers)).toEqual(['2']);

    state = flow.processMove(state, makeMove('', null, '2').payload);

    expect(state.ctx.currentPlayer).toBe('1');
    expect(state.ctx.activePlayers).toBeNull();

    state = flow.processMove(state, makeMove('', null, '1').payload);
  });

  test('CUSTOM', () => {
    const flow = Flow({
      turn: { order: TurnOrder.CUSTOM(['1', '0']) },
    });

    let state = { ctx: flow.ctx(2) };
    state = flow.init(state);

    expect(state.ctx.currentPlayer).toBe('1');
    expect(state.ctx).not.toHaveUndefinedProperties();

    state = flow.processEvent(state, gameEvent('endTurn'));
    expect(state.ctx.currentPlayer).toBe('0');
  });

  test('CUSTOM_FROM', () => {
    const flow = Flow({
      turn: { order: TurnOrder.CUSTOM_FROM('order') },
    });

    let state = { G: { order: ['2', '1', '0'] }, ctx: flow.ctx(3) };
    state = flow.init(state);

    expect(state.ctx.currentPlayer).toBe('2');
    expect(state.ctx).not.toHaveUndefinedProperties();

    state = flow.processEvent(state, gameEvent('endTurn'));
    expect(state.ctx.currentPlayer).toBe('1');
    state = flow.processEvent(state, gameEvent('endTurn'));
    expect(state.ctx.currentPlayer).toBe('0');
  });

  test('manual', () => {
    const flow = Flow({
      phases: {
        A: {
          start: true,
          turn: {
            order: {
              first: () => 9,
              next: () => 3,
            },
          },
        },
      },
    });

    let state = { ctx: flow.ctx(10) };
    state = flow.init(state);
    expect(state.ctx.currentPlayer).toBe('9');
    expect(state.ctx).not.toHaveUndefinedProperties();

    state = flow.processEvent(state, gameEvent('endTurn'));
    expect(state.ctx.currentPlayer).toBe('3');
  });
});

test('override', () => {
  const even = {
    first: () => '0',
    next: (G, ctx) => ((+ctx.currentPlayer + 2) % ctx.numPlayers) + '',
  };

  const odd = {
    first: () => '1',
    next: (G, ctx) => ((+ctx.currentPlayer + 2) % ctx.numPlayers) + '',
  };

  let flow = Flow({
    turn: { order: even },
    phases: { A: { start: true, next: 'B' }, B: { turn: { order: odd } } },
  });

  let state = { ctx: flow.ctx(10) };
  state = flow.init(state);

  expect(state.ctx.currentPlayer).toBe('0');
  state = flow.processEvent(state, gameEvent('endTurn'));
  expect(state.ctx.currentPlayer).toBe('2');
  state = flow.processEvent(state, gameEvent('endTurn'));
  expect(state.ctx.currentPlayer).toBe('4');

  state = flow.processEvent(state, gameEvent('endPhase'));

  expect(state.ctx.currentPlayer).toBe('1');
  state = flow.processEvent(state, gameEvent('endTurn'));
  expect(state.ctx.currentPlayer).toBe('3');
  state = flow.processEvent(state, gameEvent('endTurn'));
  expect(state.ctx.currentPlayer).toBe('5');
});

test('playOrder', () => {
  const game = {};
  const reducer = CreateGameReducer({ game });

  let state = InitializeGame({ game, numPlayers: 3 });

  state.ctx = {
    ...state.ctx,
    currentPlayer: '2',
    playOrder: [2, 0, 1],
  };

  state = reducer(state, gameEvent('endTurn'));
  expect(state.ctx.currentPlayer).toBe('0');
  state = reducer(state, gameEvent('endTurn'));
  expect(state.ctx.currentPlayer).toBe('1');
  state = reducer(state, gameEvent('endTurn'));
  expect(state.ctx.currentPlayer).toBe('2');
});

describe('setActivePlayers', () => {
  const flow = Flow({});
  const state = { ctx: flow.ctx(2) };

  test('basic', () => {
    const newState = flow.processEvent(
      state,
      gameEvent('setActivePlayers', [{ value: { '1': Stage.NULL } }])
    );
    expect(newState.ctx.activePlayers).toMatchObject({ '1': Stage.NULL });
  });

  test('short form', () => {
    const newState = flow.processEvent(
      state,
      gameEvent('setActivePlayers', [['1', '2']])
    );
    expect(newState.ctx.activePlayers).toMatchObject({
      '1': Stage.NULL,
      '2': Stage.NULL,
    });
  });

  test('undefined stage leaves player inactive', () => {
    const newState = flow.processEvent(
      state,
      gameEvent('setActivePlayers', [{ value: { '1': { moveLimit: 2 } } }])
    );
    expect(newState.ctx.activePlayers).toBeNull();
  });

  test('all', () => {
    const newState = flow.processEvent(
      state,
      gameEvent('setActivePlayers', [{ all: Stage.NULL }])
    );
    expect(newState.ctx.activePlayers).toMatchObject({
      '0': Stage.NULL,
      '1': Stage.NULL,
    });
  });

  test('once', () => {
    const game = {
      moves: {
        B: (G, ctx) => {
          ctx.events.setActivePlayers({
            value: { '0': Stage.NULL, '1': Stage.NULL },
            moveLimit: 1,
          });
          return G;
        },
        A: G => G,
      },
    };

    const reducer = CreateGameReducer({ game });

    let state = InitializeGame({ game });
    state = reducer(state, makeMove('B', null, '0'));
    expect(Object.keys(state.ctx.activePlayers)).toEqual(['0', '1']);
    state = reducer(state, makeMove('A', null, '0'));
    expect(Object.keys(state.ctx.activePlayers)).toEqual(['1']);
    state = reducer(state, makeMove('A', null, '1'));
    expect(state.ctx.activePlayers).toBeNull();
  });

  test('others', () => {
    const game = {
      moves: {
        B: (G, ctx) => {
          ctx.events.setActivePlayers({
            moveLimit: 1,
            others: Stage.NULL,
          });
          return G;
        },
        A: G => G,
      },
    };

    const reducer = CreateGameReducer({ game });

    let state = InitializeGame({ game, numPlayers: 3 });

    // on move B, control switches from player 0 to players 1 and 2
    state = reducer(state, makeMove('B', null, '0'));
    expect(Object.keys(state.ctx.activePlayers)).toEqual(['1', '2']);

    // player 1 makes move
    state = reducer(state, makeMove('A', null, '1'));
    expect(Object.keys(state.ctx.activePlayers)).toEqual(['2']);

    // player 2 makes move
    state = reducer(state, makeMove('A', null, '2'));
    expect(state.ctx.activePlayers).toBeNull();
  });

  describe('reset behavior', () => {
    test('start of turn', () => {
      const game = {
        moves: {
          A: () => {},
        },

        turn: {
          activePlayers: { currentPlayer: 'stage', moveLimit: 1 },
        },
      };

      const reducer = CreateGameReducer({ game });
      let state = InitializeGame({ game });

      expect(state.ctx).toMatchObject({
        activePlayers: { '0': 'stage' },
        _prevActivePlayers: [],
      });

      state = reducer(state, makeMove('A', null, '0'));

      expect(state.ctx).toMatchObject({
        activePlayers: null,
        _prevActivePlayers: [],
      });
    });

    describe('revert', () => {
      test('resets to previous', () => {
        const game = {
          moves: {
            A: (G, ctx) => {
              ctx.events.setActivePlayers({
                currentPlayer: 'stage2',
                moveLimit: 1,
                revert: true,
              });
            },
            B: () => {},
          },

          turn: {
            activePlayers: { currentPlayer: 'stage1' },
          },
        };

        const reducer = CreateGameReducer({ game });
        let state = InitializeGame({ game });

        expect(state.ctx).toMatchObject({
          activePlayers: { '0': 'stage1' },
          _prevActivePlayers: [],
        });

        state = reducer(state, makeMove('A', null, '0'));

        expect(state.ctx).toMatchObject({
          activePlayers: { '0': 'stage2' },
          _prevActivePlayers: [
            {
              activePlayers: { '0': 'stage1' },
              _activePlayersMoveLimit: null,
              _activePlayersNumMoves: { '0': 1 },
            },
          ],
        });

        state = reducer(state, makeMove('B', null, '0'));

        expect(state.ctx).toMatchObject({
          activePlayers: { '0': 'stage1' },
          _prevActivePlayers: [],
        });
      });

      test('restores move limits and counts', () => {
        const game = {
          moves: {
            A: (G, ctx) => {
              ctx.events.setActivePlayers({
                currentPlayer: 'stage2',
                moveLimit: 1,
                revert: true,
              });
            },
            B: () => {},
          },

          turn: {
            activePlayers: {
              currentPlayer: 'stage1',
              moveLimit: 3,
            },
          },
        };

        const reducer = CreateGameReducer({ game });
        let state = InitializeGame({ game });

        expect(state.ctx).toMatchObject({
          activePlayers: { '0': 'stage1' },
          _prevActivePlayers: [],
          _activePlayersMoveLimit: { '0': 3 },
          _activePlayersNumMoves: {
            '0': 0,
          },
        });

        state = reducer(state, makeMove('B', null, '0'));

        expect(state.ctx).toMatchObject({
          activePlayers: { '0': 'stage1' },
          _prevActivePlayers: [],
          _activePlayersMoveLimit: { '0': 3 },
          _activePlayersNumMoves: {
            '0': 1,
          },
        });

        state = reducer(state, makeMove('A', null, '0'));

        expect(state.ctx).toMatchObject({
          activePlayers: { '0': 'stage2' },
          _prevActivePlayers: [
            {
              activePlayers: { '0': 'stage1' },
              _activePlayersNumMoves: { '0': 2 },
              _activePlayersMoveLimit: { '0': 3 },
            },
          ],
          _activePlayersMoveLimit: { '0': 1 },
          _activePlayersNumMoves: {
            '0': 0,
          },
        });

        state = reducer(state, makeMove('B', null, '0'));

        expect(state.ctx).toMatchObject({
          activePlayers: { '0': 'stage1' },
          _prevActivePlayers: [],
          _activePlayersMoveLimit: { '0': 3 },
          _activePlayersNumMoves: {
            '0': 2,
          },
        });
      });
    });

    test('set to next', () => {
      const game = {
        moves: {
          A: () => {},
        },

        turn: {
          activePlayers: {
            currentPlayer: 'stage1',
            moveLimit: 1,
            next: {
              currentPlayer: 'stage2',
              moveLimit: 1,
              next: {
                currentPlayer: 'stage3',
              },
            },
          },
        },
      };

      const reducer = CreateGameReducer({ game });
      let state = InitializeGame({ game });

      expect(state.ctx).toMatchObject({
        activePlayers: { '0': 'stage1' },
        _prevActivePlayers: [],
        _nextActivePlayers: {
          currentPlayer: 'stage2',
          moveLimit: 1,
          next: {
            currentPlayer: 'stage3',
          },
        },
      });

      state = reducer(state, makeMove('A', null, '0'));

      expect(state.ctx).toMatchObject({
        activePlayers: { '0': 'stage2' },
        _prevActivePlayers: [],
        _nextActivePlayers: {
          currentPlayer: 'stage3',
        },
      });

      state = reducer(state, makeMove('A', null, '0'));

      expect(state.ctx).toMatchObject({
        activePlayers: { '0': 'stage3' },
        _prevActivePlayers: [],
        _nextActivePlayers: null,
      });
    });
  });

  describe('move limits', () => {
    test('shorthand syntax', () => {
      const game = {
        turn: {
          activePlayers: {
            all: 'play',
            moveLimit: 3,
          },
          stages: {
            play: { moves: { A: () => {} } },
          },
        },
      };

      const reducer = CreateGameReducer({ game });
      let state = InitializeGame({ game, numPlayers: 3 });

      expect(state.ctx._activePlayersMoveLimit).toEqual({
        '0': 3,
        '1': 3,
        '2': 3,
      });

      expect(state.ctx._activePlayersNumMoves).toEqual({
        '0': 0,
        '1': 0,
        '2': 0,
      });

      state = reducer(state, makeMove('A', null, '0'));
      state = reducer(state, makeMove('A', null, '1'));
      state = reducer(state, makeMove('A', null, '1'));
      state = reducer(state, makeMove('A', null, '2'));

      expect(state.ctx._activePlayersNumMoves).toEqual({
        '0': 1,
        '1': 2,
        '2': 1,
      });

      state = reducer(state, makeMove('A', null, '1'));

      expect(state.ctx.activePlayers).toEqual({
        '0': 'play',
        '2': 'play',
      });
    });

    test('long-form syntax', () => {
      const game = {
        turn: {
          activePlayers: {
            currentPlayer: { stage: 'play', moveLimit: 2 },
            others: { stage: 'play', moveLimit: 1 },
          },
          stages: {
            play: { moves: { A: () => {} } },
          },
        },
      };

      const reducer = CreateGameReducer({ game });
      let state = InitializeGame({ game, numPlayers: 3 });

      expect(state.ctx._activePlayersMoveLimit).toEqual({
        '0': 2,
        '1': 1,
        '2': 1,
      });

      expect(state.ctx._activePlayersNumMoves).toEqual({
        '0': 0,
        '1': 0,
        '2': 0,
      });

      state = reducer(state, makeMove('A', null, '0'));
      state = reducer(state, makeMove('A', null, '1'));
      state = reducer(state, makeMove('A', null, '2'));

      expect(state.ctx._activePlayersNumMoves).toEqual({
        '0': 1,
        '1': 1,
        '2': 1,
      });

      expect(state.ctx.activePlayers).toEqual({ '0': 'play' });

      state = reducer(state, makeMove('A', null, '0'));

      expect(state.ctx.activePlayers).toBeNull();
    });

    test('player-specific limit overrides moveLimit arg', () => {
      const game = {
        turn: {
          activePlayers: {
            all: { stage: 'play', moveLimit: 2 },
            moveLimit: 1,
          },
        },
      };

      let state = InitializeGame({ game, numPlayers: 2 });

      expect(state.ctx._activePlayersMoveLimit).toEqual({
        '0': 2,
        '1': 2,
      });
    });

    test('value syntax', () => {
      const game = {
        turn: {
          activePlayers: {
            value: {
              '0': { stage: 'play', moveLimit: 1 },
              '1': { stage: 'play', moveLimit: 2 },
              '2': { stage: 'play', moveLimit: 3 },
            },
          },
          stages: {
            play: { moves: { A: () => {} } },
          },
        },
      };

      const reducer = CreateGameReducer({ game });
      let state = InitializeGame({ game, numPlayers: 3 });

      expect(state.ctx._activePlayersMoveLimit).toEqual({
        '0': 1,
        '1': 2,
        '2': 3,
      });

      state = reducer(state, makeMove('A', null, '0'));
      state = reducer(state, makeMove('A', null, '1'));
      state = reducer(state, makeMove('A', null, '2'));

      expect(state.ctx.activePlayers).toEqual({ '1': 'play', '2': 'play' });

      state = reducer(state, makeMove('A', null, '1'));
      state = reducer(state, makeMove('A', null, '2'));

      expect(state.ctx.activePlayers).toEqual({ '2': 'play' });

      state = reducer(state, makeMove('A', null, '2'));
      expect(state.ctx.activePlayers).toBeNull();
    });

    test('move counts reset on turn end', () => {
      const game = {
        turn: {
          activePlayers: {
            all: 'play',
          },
          stages: {
            play: { moves: { A: () => {} } },
          },
        },
      };

      const reducer = CreateGameReducer({ game });
      let state = InitializeGame({ game, numPlayers: 3 });

      state = reducer(state, makeMove('A', null, '0'));
      state = reducer(state, makeMove('A', null, '1'));

      expect(state.ctx._activePlayersNumMoves).toEqual({
        '0': 1,
        '1': 1,
        '2': 0,
      });

      state = reducer(state, gameEvent('endTurn'));

      expect(state.ctx._activePlayersNumMoves).toEqual({
        '0': 0,
        '1': 0,
        '2': 0,
      });
    });
  });

  describe('militia', () => {
    let state;
    let reducer;
    beforeAll(() => {
      const game = {
        moves: {
          militia: (G, ctx) => {
            ctx.events.setActivePlayers({
              others: 'discard',
              moveLimit: 1,
              revert: true,
            });
          },
        },

        turn: {
          stages: {
            discard: {
              moves: {
                discard: G => G,
              },
            },
          },
        },
      };

      reducer = CreateGameReducer({ game });
      state = InitializeGame({ game, numPlayers: 3 });
    });

    beforeEach(() => {
      error.mockClear();
    });

    test('sanity', () => {
      expect(state.ctx.activePlayers).toEqual(null);
    });

    test('player 1 cannot play the militia card', () => {
      state = reducer(state, makeMove('militia', undefined, '1'));
      expect(error).toHaveBeenCalledWith('disallowed move: militia');
    });

    test('player 2 cannot play the militia card', () => {
      state = reducer(state, makeMove('militia', undefined, '2'));
      expect(error).toHaveBeenCalledWith('disallowed move: militia');
    });

    test('player 0 cannot discard', () => {
      state = reducer(state, makeMove('discard', undefined, '0'));
      expect(error).toHaveBeenCalledWith('disallowed move: discard');
    });

    test('player 1 cannot discard', () => {
      state = reducer(state, makeMove('discard', undefined, '1'));
      expect(error).toHaveBeenCalledWith('disallowed move: discard');
    });

    test('player 2 cannot discard', () => {
      state = reducer(state, makeMove('discard', undefined, '2'));
      expect(error).toHaveBeenCalledWith('disallowed move: discard');
    });

    test('player 0 plays militia', () => {
      state = reducer(state, makeMove('militia', undefined, '0'));
      expect(state.ctx.activePlayers).toEqual({
        '1': 'discard',
        '2': 'discard',
      });
    });

    test('player 0 cannot play militia again', () => {
      state = reducer(state, makeMove('militia', undefined, '0'));
      expect(error).toHaveBeenCalledWith('disallowed move: militia');
    });

    test('player 0 still cannot discard', () => {
      state = reducer(state, makeMove('discard', undefined, '0'));
      expect(error).toHaveBeenCalledWith('disallowed move: discard');
    });

    test('everyone else discards', () => {
      state = reducer(state, makeMove('discard', undefined, '1'));
      expect(state.ctx.activePlayers).toEqual({ '2': 'discard' });
      state = reducer(state, makeMove('discard', undefined, '2'));
    });

    test('activePlayers is restored to previous state', () => {
      expect(state.ctx.activePlayers).toEqual(null);
    });
  });
});

describe('UpdateTurnOrderState', () => {
  const G = {};
  const ctx = {
    currentPlayer: '0',
    playOrder: ['0', '1', '2'],
    playOrderPos: 0,
  };
  const turn = { order: TurnOrder.DEFAULT };

  test('without next player', () => {
    const { ctx: t } = UpdateTurnOrderState(
      { G, ctx },
      ctx.currentPlayer,
      turn
    );
    expect(t).toMatchObject({ currentPlayer: '1' });
  });

  test('with next player', () => {
    const { ctx: t } = UpdateTurnOrderState(
      { G, ctx },
      ctx.currentPlayer,
      turn,
      {
        next: '2',
      }
    );
    expect(t).toMatchObject({ currentPlayer: '2' });
  });
});

describe('Random API is available', () => {
  let first;
  let next;

  const turn = {
    order: {
      first: (_, ctx) => {
        if (ctx.random !== undefined) {
          first = true;
        }
        return '0';
      },

      next: (_, ctx) => {
        if (ctx.random !== undefined) {
          next = true;
        }
        return '0';
      },
    },
  };

  const game = { turn };

  beforeEach(() => {
    first = next = false;
  });

  test('init', () => {
    Client({ game });
    expect(first).toBe(true);
  });

  test('end turn', () => {
    const client = Client({ game });
    expect(next).toBe(false);
    client.events.endTurn();
    expect(next).toBe(true);
  });
});
