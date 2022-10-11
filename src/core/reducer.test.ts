/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { INVALID_MOVE } from './constants';
import { applyMiddleware, createStore } from 'redux';
import { CreateGameReducer, TransientHandlingMiddleware } from './reducer';
import { InitializeGame } from './initialize';
import {
  makeMove,
  gameEvent,
  sync,
  update,
  reset,
  undo,
  redo,
  patch,
} from './action-creators';
import { error } from '../core/logger';
import type { Game, State, SyncInfo } from '../types';

jest.mock('../core/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
}));

const game: Game = {
  moves: {
    A: ({ G }) => G,
    B: () => ({ moved: true }),
    C: () => ({ victory: true }),
    Invalid: () => INVALID_MOVE,
  },
  endIf: ({ G, ctx }) => (G.victory ? ctx.currentPlayer : undefined),
};
const reducer = CreateGameReducer({ game });
const initialState = InitializeGame({ game });

test('_stateID is incremented', () => {
  let state = initialState;
  state = reducer(state, makeMove('A'));
  expect(state._stateID).toBe(1);
  state = reducer(state, gameEvent('endTurn'));
  expect(state._stateID).toBe(2);
});

test('move returns INVALID_MOVE', () => {
  const game: Game = {
    moves: {
      A: () => INVALID_MOVE,
    },
  };
  const reducer = CreateGameReducer({ game });
  const state = reducer(initialState, makeMove('A'));
  expect(error).toBeCalledWith('invalid move: A args: undefined');
  expect(state._stateID).toBe(0);
});

test('makeMove', () => {
  let state = initialState;
  expect(state._stateID).toBe(0);

  state = reducer(state, makeMove('unknown'));
  expect(state._stateID).toBe(0);
  expect(state.G).not.toMatchObject({ moved: true });
  expect(error).toBeCalledWith('disallowed move: unknown');

  state = reducer(state, makeMove('A'));
  expect(state._stateID).toBe(1);
  expect(state.G).not.toMatchObject({ moved: true });

  state = reducer(state, makeMove('B'));
  expect(state._stateID).toBe(2);
  expect(state.G).toMatchObject({ moved: true });

  state.ctx.gameover = true;

  state = reducer(state, makeMove('B'));
  expect(state._stateID).toBe(2);
  expect(error).toBeCalledWith('cannot make move after game end');

  state = reducer(state, gameEvent('endTurn'));
  expect(state._stateID).toBe(2);
  expect(error).toBeCalledWith('cannot call event after game end');
});

test('disable move by invalid playerIDs', () => {
  let state = initialState;
  expect(state._stateID).toBe(0);

  // playerID="1" cannot move right now.
  state = reducer(state, makeMove('A', null, '1'));
  expect(state._stateID).toBe(0);

  // playerID="1" cannot call events right now.
  state = reducer(state, gameEvent('endTurn', null, '1'));
  expect(state._stateID).toBe(0);

  // playerID="0" can move.
  state = reducer(state, makeMove('A', null, '0'));
  expect(state._stateID).toBe(1);

  // playerID=undefined can always move.
  state = reducer(state, makeMove('A'));
  expect(state._stateID).toBe(2);
});

test('sync', () => {
  const state = reducer(
    undefined,
    sync({ state: { G: 'restored' } } as SyncInfo)
  );
  expect(state).toEqual({ G: 'restored' });
});

test('update', () => {
  const state = reducer(undefined, update({ G: 'restored' } as State, []));
  expect(state).toEqual({ G: 'restored' });
});

test('valid patch', () => {
  const originalState = { _stateID: 0, G: 'patch' } as State;
  const state = reducer(
    originalState,
    patch(0, 1, [{ op: 'replace', path: '/_stateID', value: 1 }], [])
  );
  expect(state).toEqual({ _stateID: 1, G: 'patch' });
});

test('invalid patch', () => {
  const originalState = { _stateID: 0, G: 'patch' } as State;
  const { transients, ...state } = reducer(
    originalState,
    patch(0, 1, [{ op: 'replace', path: '/_stateIDD', value: 1 }], [])
  );
  expect(state).toEqual(originalState);
  expect(transients.error.type).toEqual('update/patch_failed');
  // It's an array.
  expect(transients.error.payload.length).toEqual(1);
  // It looks like the standard rfc6902 error language.
  expect(transients.error.payload[0].toString()).toContain('/_stateIDD');
});

test('reset', () => {
  let state = reducer(initialState, makeMove('A'));
  expect(state).not.toEqual(initialState);
  state = reducer(state, reset(initialState));
  expect(state).toEqual(initialState);
});

test('victory', () => {
  let state = reducer(initialState, makeMove('A'));
  state = reducer(state, gameEvent('endTurn'));
  expect(state.ctx.gameover).toEqual(undefined);
  state = reducer(state, makeMove('B'));
  state = reducer(state, gameEvent('endTurn'));
  expect(state.ctx.gameover).toEqual(undefined);
  state = reducer(state, makeMove('C'));
  expect(state.ctx.gameover).toEqual('0');
});

test('endTurn', () => {
  {
    const state = reducer(initialState, gameEvent('endTurn'));
    expect(state.ctx.turn).toBe(2);
  }

  {
    const reducer = CreateGameReducer({ game, isClient: true });
    const state = reducer(initialState, gameEvent('endTurn'));
    expect(state.ctx.turn).toBe(1);
  }
});

test('light client when multiplayer=true', () => {
  const game: Game = {
    moves: { A: () => ({ win: true }) },
    endIf: ({ G }) => G.win,
  };

  {
    const reducer = CreateGameReducer({ game });
    let state = InitializeGame({ game });
    expect(state.ctx.gameover).toBe(undefined);
    state = reducer(state, makeMove('A'));
    expect(state.ctx.gameover).toBe(true);
  }

  {
    const reducer = CreateGameReducer({ game, isClient: true });
    let state = InitializeGame({ game });
    expect(state.ctx.gameover).toBe(undefined);
    state = reducer(state, makeMove('A'));
    expect(state.ctx.gameover).toBe(undefined);
  }
});

test('disable optimistic updates', () => {
  const game: Game = {
    moves: {
      A: {
        move: () => ({ A: true }),
        client: false,
      },
    },
  };

  {
    const reducer = CreateGameReducer({ game });
    let state = InitializeGame({ game });
    expect(state.G).not.toMatchObject({ A: true });
    state = reducer(state, makeMove('A'));
    expect(state.G).toMatchObject({ A: true });
  }

  {
    const reducer = CreateGameReducer({ game, isClient: true });
    let state = InitializeGame({ game });
    expect(state.G).not.toMatchObject({ A: true });
    state = reducer(state, makeMove('A'));
    expect(state.G).not.toMatchObject({ A: true });
  }
});

test('numPlayers', () => {
  const numPlayers = 4;
  const state = InitializeGame({ game, numPlayers });
  expect(state.ctx.numPlayers).toBe(4);
});

test('deltalog', () => {
  let state = initialState;

  const actionA = makeMove('A');
  const actionB = makeMove('B');
  const actionC = gameEvent('endTurn');

  state = reducer(state, actionA);
  expect(state.deltalog).toEqual([
    {
      action: actionA,
      _stateID: 0,
      phase: null,
      turn: 1,
    },
  ]);
  state = reducer(state, actionB);
  expect(state.deltalog).toEqual([
    {
      action: actionB,
      _stateID: 1,
      phase: null,
      turn: 1,
    },
  ]);
  state = reducer(state, actionC);
  expect(state.deltalog).toEqual([
    {
      action: actionC,
      _stateID: 2,
      phase: null,
      turn: 1,
    },
  ]);
});

describe('Events API', () => {
  const fn = ({ events }) => (events ? {} : { error: true });

  const game: Game = {
    setup: () => ({}),
    phases: { A: {} },
    turn: {
      onBegin: fn,
      onEnd: fn,
      onMove: fn,
    },
  };

  const reducer = CreateGameReducer({ game });
  let state = InitializeGame({ game });

  test('is attached at the beginning', () => {
    expect(state.G).not.toEqual({ error: true });
  });

  test('is attached at the end of turns', () => {
    state = reducer(state, gameEvent('endTurn'));
    expect(state.G).not.toEqual({ error: true });
  });

  test('is attached at the end of phases', () => {
    state = reducer(state, gameEvent('endPhase'));
    expect(state.G).not.toEqual({ error: true });
  });
});

describe('Plugin Invalid Action API', () => {
  const pluginName = 'validator';
  const message = 'G.value must divide by 5';
  const game: Game<{ value: number }> = {
    setup: () => ({ value: 5 }),
    plugins: [
      {
        name: pluginName,
        isInvalid: ({ G }) => {
          if (G.value % 5 !== 0) return message;
          return false;
        },
      },
    ],
    moves: {
      setValue: ({ G }, arg: number) => {
        G.value = arg;
      },
    },
    phases: {
      unenterable: {
        onBegin: () => ({ value: 13 }),
      },
      enterable: {
        onBegin: () => ({ value: 25 }),
      },
    },
  };

  let state: State;
  beforeEach(() => {
    state = InitializeGame({ game });
  });

  describe('multiplayer client', () => {
    const reducer = CreateGameReducer({ game });

    test('move is cancelled if plugin declares it invalid', () => {
      state = reducer(state, makeMove('setValue', [6], '0'));
      expect(state.G).toMatchObject({ value: 5 });
      expect(state['transients'].error).toEqual({
        type: 'action/plugin_invalid',
        payload: { plugin: pluginName, message },
      });
    });

    test('move is processed if no plugin declares it invalid', () => {
      state = reducer(state, makeMove('setValue', [15], '0'));
      expect(state.G).toMatchObject({ value: 15 });
      expect(state['transients']).toBeUndefined();
    });

    test('event is cancelled if plugin declares it invalid', () => {
      state = reducer(state, gameEvent('setPhase', 'unenterable', '0'));
      expect(state.G).toMatchObject({ value: 5 });
      expect(state.ctx.phase).toBe(null);
      expect(state['transients'].error).toEqual({
        type: 'action/plugin_invalid',
        payload: { plugin: pluginName, message },
      });
    });

    test('event is processed if no plugin declares it invalid', () => {
      state = reducer(state, gameEvent('setPhase', 'enterable', '0'));
      expect(state.G).toMatchObject({ value: 25 });
      expect(state.ctx.phase).toBe('enterable');
      expect(state['transients']).toBeUndefined();
    });
  });

  describe('local client', () => {
    const reducer = CreateGameReducer({ game, isClient: true });

    test('move is cancelled if plugin declares it invalid', () => {
      state = reducer(state, makeMove('setValue', [6], '0'));
      expect(state.G).toMatchObject({ value: 5 });
      expect(state['transients'].error).toEqual({
        type: 'action/plugin_invalid',
        payload: { plugin: pluginName, message },
      });
    });

    test('move is processed if no plugin declares it invalid', () => {
      state = reducer(state, makeMove('setValue', [15], '0'));
      expect(state.G).toMatchObject({ value: 15 });
      expect(state['transients']).toBeUndefined();
    });
  });
});

describe('Random inside setup()', () => {
  const game1: Game = {
    seed: 'seed1',
    setup: (ctx) => ({ n: ctx.random.D6() }),
  };

  const game2: Game = {
    seed: 'seed2',
    setup: (ctx) => ({ n: ctx.random.D6() }),
  };

  const game3: Game = {
    seed: 'seed2',
    setup: (ctx) => ({ n: ctx.random.D6() }),
  };

  test('setting seed', () => {
    const state1 = InitializeGame({ game: game1 });
    const state2 = InitializeGame({ game: game2 });
    const state3 = InitializeGame({ game: game3 });

    expect(state1.G.n).not.toBe(state2.G.n);
    expect(state2.G.n).toBe(state3.G.n);
  });
});

describe('undo / redo', () => {
  const game: Game = {
    seed: 0,
    moves: {
      move: ({ G }, arg: string) => ({ ...G, [arg]: true }),
      roll: ({ G, random }) => {
        G.roll = random.D6();
      },
    },
    turn: {
      stages: {
        special: {},
      },
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const reducer = CreateGameReducer({ game });

  const initialState = InitializeGame({ game });

  // TODO: Check if this test is still actually required after removal of APIs from ctx
  test('plugin APIs are not included in undo state', () => {
    let state = reducer(initialState, makeMove('move', 'A', '0'));
    state = reducer(state, makeMove('move', 'B', '0'));
    expect(state.G).toMatchObject({ A: true, B: true });
    expect(state._undo[1].ctx).not.toHaveProperty('events');
    expect(state._undo[1].ctx).not.toHaveProperty('random');
  });

  test('undo restores previous state after move', () => {
    const initial = reducer(initialState, makeMove('move', 'A', '0'));
    let newState = reducer(initial, makeMove('roll', null, '0'));
    newState = reducer(newState, undo());
    expect(newState.G).toEqual(initial.G);
    expect(newState.ctx).toEqual(initial.ctx);
    expect(newState.plugins).toEqual(initial.plugins);
  });

  test('undo restores previous state after event', () => {
    const initial = reducer(
      initialState,
      gameEvent('setStage', 'special', '0')
    );
    let newState = reducer(initial, gameEvent('endStage', undefined, '0'));
    expect(error).not.toBeCalled();
    // Make sure we actually modified the stage.
    expect(newState.ctx.activePlayers).not.toEqual(initial.ctx.activePlayers);
    newState = reducer(newState, undo());
    expect(error).not.toBeCalled();
    expect(newState.G).toEqual(initial.G);
    expect(newState.ctx).toEqual(initial.ctx);
    expect(newState.plugins).toEqual(initial.plugins);
  });

  test('redo restores undone state', () => {
    let state = initialState;
    // Make two moves.
    const state1 = (state = reducer(state, makeMove('move', 'A', '0')));
    const state2 = (state = reducer(state, makeMove('roll', null, '0')));
    // Undo both of them.
    state = reducer(state, undo());
    state = reducer(state, undo());
    // Redo one of them.
    state = reducer(state, redo());
    expect(state.G).toEqual(state1.G);
    expect(state.ctx).toEqual(state1.ctx);
    expect(state.plugins).toEqual(state1.plugins);
    // Redo a second time.
    state = reducer(state, redo());
    expect(state.G).toEqual(state2.G);
    expect(state.ctx).toEqual(state2.ctx);
    expect(state.plugins).toEqual(state2.plugins);
  });

  test('can undo redone state', () => {
    let state = reducer(initialState, makeMove('move', 'A', '0'));
    state = reducer(state, undo());
    state = reducer(state, redo());
    state = reducer(state, undo());
    expect(state.G).toMatchObject(initialState.G);
    expect(state.ctx).toMatchObject(initialState.ctx);
    expect(state.plugins).toMatchObject(initialState.plugins);
  });

  test('undo has no effect if nothing to undo', () => {
    let state = reducer(initialState, undo());
    state = reducer(state, undo());
    state = reducer(state, undo());
    expect(state.G).toMatchObject(initialState.G);
    expect(state.ctx).toMatchObject(initialState.ctx);
    expect(state.plugins).toMatchObject(initialState.plugins);
  });

  test('redo works after multiple undos', () => {
    let state = reducer(initialState, makeMove('move', 'A', '0'));
    state = reducer(state, undo());
    state = reducer(state, undo());
    state = reducer(state, undo());
    state = reducer(state, redo());
    state = reducer(state, makeMove('move', 'C', '0'));
    expect(state.G).toMatchObject({ A: true, C: true });

    state = reducer(state, undo());
    expect(state.G).toMatchObject({ A: true });

    state = reducer(state, redo());
    expect(state.G).toMatchObject({ A: true, C: true });
  });

  test('redo only resets deltalog if nothing to redo', () => {
    const state = reducer(initialState, makeMove('move', 'A', '0'));
    expect(reducer(state, redo())).toMatchObject({
      ...state,
      deltalog: [],
      transients: {
        error: {
          type: 'action/action_invalid',
        },
      },
    });
  });
});

test('disable undo / redo', () => {
  const game: Game = {
    seed: 0,
    disableUndo: true,
    moves: {
      move: ({ G }, arg: string) => ({ ...G, [arg]: true }),
    },
  };

  const reducer = CreateGameReducer({ game });

  let state = InitializeGame({ game });

  state = reducer(state, makeMove('move', 'A', '0'));
  expect(state.G).toMatchObject({ A: true });
  expect(state._undo).toEqual([]);
  expect(state._redo).toEqual([]);

  state = reducer(state, makeMove('move', 'B', '0'));
  expect(state.G).toMatchObject({ A: true, B: true });
  expect(state._undo).toEqual([]);
  expect(state._redo).toEqual([]);

  state = reducer(state, undo());
  expect(state.G).toMatchObject({ A: true, B: true });
  expect(state._undo).toEqual([]);
  expect(state._redo).toEqual([]);

  state = reducer(state, undo());
  expect(state.G).toMatchObject({ A: true, B: true });
  expect(state._undo).toEqual([]);
  expect(state._redo).toEqual([]);

  state = reducer(state, redo());
  expect(state.G).toMatchObject({ A: true, B: true });
  expect(state._undo).toEqual([]);
  expect(state._redo).toEqual([]);
});

describe('undo stack', () => {
  const game: Game = {
    moves: {
      basic: () => {},
      endTurn: ({ events }) => {
        events.endTurn();
      },
    },
  };

  const reducer = CreateGameReducer({ game });
  let state = InitializeGame({ game });

  test('contains initial state at start of game', () => {
    expect(state._undo).toHaveLength(1);
    expect(state._undo[0].ctx).toEqual(state.ctx);
    expect(state._undo[0].plugins).toEqual(state.plugins);
  });

  test('grows when a move is made', () => {
    state = reducer(state, makeMove('basic', null, '0'));
    expect(state._undo).toHaveLength(2);
    expect(state._undo[1].moveType).toBe('basic');
    expect(state._undo[1].ctx).toEqual(state.ctx);
    expect(state._undo[1].plugins).toEqual(state.plugins);
  });

  test('shrinks when a move is undone', () => {
    state = reducer(state, undo());
    expect(state._undo).toHaveLength(1);
    expect(state._undo[0].ctx).toEqual(state.ctx);
    expect(state._undo[0].plugins).toEqual(state.plugins);
  });

  test('grows when a move is redone', () => {
    state = reducer(state, redo());
    expect(state._undo).toHaveLength(2);
    expect(state._undo[1].moveType).toBe('basic');
    expect(state._undo[1].ctx).toEqual(state.ctx);
    expect(state._undo[1].plugins).toEqual(state.plugins);
  });

  test('is reset when a turn ends', () => {
    state = reducer(state, makeMove('endTurn'));
    expect(state._undo).toHaveLength(1);
    expect(state._undo[0].ctx).toEqual(state.ctx);
    expect(state._undo[0].plugins).toEqual(state.plugins);
    expect(state._undo[0].moveType).toBe('endTurn');
  });

  test('can’t undo at the start of a turn', () => {
    const newState = reducer(state, undo());
    expect(newState).toMatchObject({
      ...state,
      deltalog: [],
      transients: {
        error: {
          type: 'action/action_invalid',
        },
      },
    });
  });

  test('can’t undo another player’s move', () => {
    state = reducer(state, makeMove('basic', null, '1'));
    const newState = reducer(state, undo('0'));
    expect(newState).toMatchObject({
      ...state,
      deltalog: [],
      transients: {
        error: {
          type: 'action/action_invalid',
        },
      },
    });
  });
});

describe('redo stack', () => {
  const game: Game = {
    moves: {
      basic: () => {},
      endTurn: ({ events }) => {
        events.endTurn();
      },
    },
  };

  const reducer = CreateGameReducer({ game });
  let state = InitializeGame({ game });

  test('is empty at start of game', () => {
    expect(state._redo).toHaveLength(0);
  });

  test('grows when a move is undone', () => {
    state = reducer(state, makeMove('basic', null, '0'));
    state = reducer(state, undo());
    expect(state._redo).toHaveLength(1);
    expect(state._redo[0].moveType).toBe('basic');
  });

  test('shrinks when a move is redone', () => {
    state = reducer(state, redo());
    expect(state._redo).toHaveLength(0);
  });

  test('is reset when a move is made', () => {
    state = reducer(state, makeMove('basic', null, '0'));
    state = reducer(state, undo());
    state = reducer(state, undo());
    expect(state._redo).toHaveLength(2);
    state = reducer(state, makeMove('basic', null, '0'));
    expect(state._redo).toHaveLength(0);
  });

  test('is reset when a turn ends', () => {
    state = reducer(state, makeMove('basic', null, '0'));
    state = reducer(state, undo());
    expect(state._redo).toHaveLength(1);
    state = reducer(state, makeMove('endTurn'));
    expect(state._redo).toHaveLength(0);
  });

  test('can’t redo another player’s undo', () => {
    state = reducer(state, makeMove('basic', null, '1'));
    state = reducer(state, undo('1'));
    expect(state._redo).toHaveLength(1);
    const newState = reducer(state, redo('0'));
    expect(state._redo).toHaveLength(1);
    expect(newState).toMatchObject({
      ...state,
      deltalog: [],
      transients: {
        error: {
          type: 'action/action_invalid',
        },
      },
    });
  });
});

describe('undo / redo with stages', () => {
  const game: Game = {
    setup: () => ({ A: false, B: false, C: false }),
    turn: {
      activePlayers: { currentPlayer: 'start' },
      stages: {
        start: {
          moves: {
            moveA: {
              move: ({ G, events }, moveAisReversible) => {
                events.setStage('A');
                return { ...G, moveAisReversible, A: true };
              },
              undoable: ({ G }) => G.moveAisReversible > 0,
            },
          },
        },
        A: {
          moves: {
            moveB: {
              move: ({ G, events }) => {
                events.setStage('B');
                return { ...G, B: true };
              },
              undoable: false,
            },
          },
        },
        B: {
          moves: {
            moveC: {
              move: ({ G, events }) => {
                events.setStage('C');
                return { ...G, C: true };
              },
              undoable: true,
            },
          },
        },
        C: {
          moves: {},
        },
      },
    },
  };

  const reducer = CreateGameReducer({ game });

  let state = InitializeGame({ game });

  test('moveA sets state & moves player to stage A (undoable)', () => {
    state = reducer(state, makeMove('moveA', true, '0'));
    expect(state.G).toMatchObject({
      moveAisReversible: true,
      A: true,
      B: false,
      C: false,
    });
    expect(state.ctx.activePlayers['0']).toBe('A');
  });

  test('undo undoes last move (moveA)', () => {
    state = reducer(state, undo('0'));
    expect(state.G).toMatchObject({
      A: false,
      B: false,
      C: false,
    });
    expect(state.ctx.activePlayers['0']).toBe('start');
  });

  test('redo redoes moveA', () => {
    state = reducer(state, redo('0'));
    expect(state.G).toMatchObject({
      moveAisReversible: true,
      A: true,
      B: false,
      C: false,
    });
    expect(state.ctx.activePlayers['0']).toBe('A');
  });

  test('undo undoes last move after redo (moveA)', () => {
    state = reducer(state, undo('0'));
    expect(state.G).toMatchObject({
      A: false,
      B: false,
      C: false,
    });
    expect(state.ctx.activePlayers['0']).toBe('start');
  });

  test('moveA sets state & moves player to stage A (not undoable)', () => {
    state = reducer(state, makeMove('moveA', false, '0'));
    expect(state.G).toMatchObject({
      moveAisReversible: false,
      A: true,
      B: false,
      C: false,
    });
    expect(state.ctx.activePlayers['0']).toBe('A');
  });

  test('moveB sets state & moves player to stage B', () => {
    state = reducer(state, makeMove('moveB', [], '0'));
    expect(state.G).toMatchObject({
      moveAisReversible: false,
      A: true,
      B: true,
      C: false,
    });
    expect(state.ctx.activePlayers['0']).toBe('B');
  });

  test('undo doesn’t undo last move if not undoable (moveB)', () => {
    state = reducer(state, undo('0'));
    expect(state.G).toMatchObject({
      moveAisReversible: false,
      A: true,
      B: true,
      C: false,
    });
    expect(state.ctx.activePlayers['0']).toBe('B');
  });

  test('moveC sets state & moves player to stage C', () => {
    state = reducer(state, makeMove('moveC', [], '0'));
    expect(state.G).toMatchObject({
      moveAisReversible: false,
      A: true,
      B: true,
      C: true,
    });
    expect(state.ctx.activePlayers['0']).toBe('C');
  });

  test('undo undoes last move (moveC)', () => {
    state = reducer(state, undo('0'));
    expect(state.G).toMatchObject({
      moveAisReversible: false,
      A: true,
      B: true,
      C: false,
    });
    expect(state.ctx.activePlayers['0']).toBe('B');
  });

  test('redo redoes moveC', () => {
    state = reducer(state, redo('0'));
    expect(state.G).toMatchObject({
      moveAisReversible: false,
      A: true,
      B: true,
      C: true,
    });
    expect(state.ctx.activePlayers['0']).toBe('C');
  });

  test('undo undoes last move after redo (moveC)', () => {
    state = reducer(state, undo('0'));
    expect(state.G).toMatchObject({
      moveAisReversible: false,
      A: true,
      B: true,
      C: false,
    });
    expect(state.ctx.activePlayers['0']).toBe('B');
  });

  test('undo doesn’t undo last move if not undoable after undo/redo', () => {
    state = reducer(state, undo('0'));
    expect(state.G).toMatchObject({
      moveAisReversible: false,
      A: true,
      B: true,
      C: false,
    });
    expect(state.ctx.activePlayers['0']).toBe('B');
  });
});

describe('TransientHandlingMiddleware', () => {
  const middleware = applyMiddleware(TransientHandlingMiddleware);
  let store = null;

  beforeEach(() => {
    store = createStore(reducer, initialState, middleware);
  });

  test('regular dispatch result has no transients', () => {
    const result = store.dispatch(makeMove('A'));
    expect(result).toEqual(
      expect.not.objectContaining({ transients: expect.anything() })
    );
    expect(result).toEqual(
      expect.not.objectContaining({ stripTransientsResult: expect.anything() })
    );
  });

  test('failing dispatch result contains transients', () => {
    const result = store.dispatch(makeMove('Invalid'));
    expect(result).toMatchObject({
      transients: {
        error: {
          type: 'action/invalid_move',
        },
      },
    });
  });
});
