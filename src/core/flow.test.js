/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import Game from './game';
import { CreateGameReducer } from './reducer';
import { makeMove, gameEvent, reset, undo, redo } from './action-creators';
import { Flow, FlowWithPhases } from './flow';

test('Flow', () => {
  const flow = Flow({});
  const state = {};
  expect(flow.processGameEvent(state, gameEvent('unknown'))).toBe(state);

  // Check defaults of all arguments
  expect(flow.ctx()).toMatchObject({});
  expect(flow.eventNames.length).toBe(0);
  expect(flow.init({ a: 5 })).toMatchObject({ a: 5 });
  expect(flow.canMakeMove({}, {}, undefined)).toBe(true);
  expect(flow.canUndoMove()).toBe(true);
  expect(flow.processMove({ b: 6 })).toMatchObject({ b: 6 });
  expect(flow.optimisticUpdate()).toBe(true);
});

test('callbacks', () => {
  const onPhaseBegin = jest.fn(G => G);
  const onPhaseEnd = jest.fn(G => G);

  let flow = FlowWithPhases({
    phases: [
      {
        onPhaseBegin,
        onPhaseEnd,
      },
    ],
  });

  let state = { ctx: flow.ctx(2) };

  expect(onPhaseBegin).not.toHaveBeenCalled();
  expect(onPhaseEnd).not.toHaveBeenCalled();

  flow.init(state);
  expect(onPhaseBegin).toHaveBeenCalled();

  flow.processGameEvent(state, gameEvent('endPhase'));
  expect(onPhaseEnd).toHaveBeenCalled();
});

test('movesPerTurn', () => {
  {
    let flow = FlowWithPhases({ movesPerTurn: 2 });
    let state = { ctx: flow.ctx(2) };
    expect(state.ctx.turn).toBe(0);
    state = flow.processMove(state, { move: {}, payload: {} });
    expect(state.ctx.turn).toBe(0);
    state = flow.processGameEvent(state, gameEvent('endTurn'));
    expect(state.ctx.turn).toBe(0);
    state = flow.processMove(state, { move: {}, payload: {} });
    expect(state.ctx.turn).toBe(1);
  }

  {
    let flow = FlowWithPhases({
      movesPerTurn: 2,
      phases: [{ name: 'A' }, { name: 'B', movesPerTurn: 1 }],
    });
    let state = { ctx: flow.ctx(2) };
    expect(state.ctx.turn).toBe(0);
    state = flow.processMove(state, { move: {}, payload: {} });
    expect(state.ctx.turn).toBe(0);
    state = flow.processGameEvent(state, gameEvent('endTurn'));
    expect(state.ctx.turn).toBe(0);
    state = flow.processMove(state, { move: {}, payload: {} });
    expect(state.ctx.turn).toBe(1);

    state = flow.processGameEvent(state, gameEvent('endPhase'));

    expect(state.ctx.turn).toBe(1);
    state = flow.processMove(state, { move: {}, payload: {} });
    expect(state.ctx.turn).toBe(2);
  }
});

test('onTurnBegin', () => {
  {
    const onTurnBegin = jest.fn(G => G);
    const onTurnBeginOverride = jest.fn(G => G);

    let flow = FlowWithPhases({
      onTurnBegin,
      phases: [
        { name: 'A' },
        {
          name: 'B',
          onTurnBegin: onTurnBeginOverride,
        },
      ],
    });

    let state = { ctx: flow.ctx(2) };

    expect(onTurnBegin).not.toHaveBeenCalled();

    flow.init(state);

    expect(onTurnBegin).toHaveBeenCalled();
    expect(onTurnBeginOverride).not.toHaveBeenCalled();

    state = flow.processGameEvent(state, gameEvent('endPhase'));
    expect(state.ctx.phase).toBe('B');
    expect(onTurnBeginOverride).not.toHaveBeenCalled();

    onTurnBegin.mockReset();
    onTurnBeginOverride.mockReset();

    flow.processGameEvent(state, gameEvent('endTurn'));
    expect(onTurnBegin).not.toHaveBeenCalled();
    expect(onTurnBeginOverride).toHaveBeenCalled();
  }
});

test('onTurnEnd', () => {
  {
    const onTurnEnd = jest.fn(G => G);
    const onTurnEndOverride = jest.fn(G => G);

    let flow = FlowWithPhases({
      onTurnEnd,
      phases: [
        { name: 'A' },
        {
          name: 'B',
          onTurnEnd: onTurnEndOverride,
        },
      ],
    });

    let state = { ctx: flow.ctx(2) };

    expect(onTurnEnd).not.toHaveBeenCalled();
    expect(onTurnEndOverride).not.toHaveBeenCalled();

    flow.init(state);
    expect(state.ctx.phase).toBe('A');

    flow.processGameEvent(state, gameEvent('endTurn'));
    expect(onTurnEnd).toHaveBeenCalled();
    expect(onTurnEndOverride).not.toHaveBeenCalled();

    onTurnEnd.mockReset();
    onTurnEndOverride.mockReset();

    state = flow.processGameEvent(state, gameEvent('endPhase'));

    flow.processGameEvent(state, gameEvent('endTurn'));
    expect(onTurnEnd).not.toHaveBeenCalled();
    expect(onTurnEndOverride).toHaveBeenCalled();
  }
});

test('onMove', () => {
  const onMove = () => ({ A: true });

  {
    let flow = FlowWithPhases({ onMove });
    let state = { G: {}, ctx: flow.ctx(2) };
    state = flow.processMove(state, { payload: {} });
    expect(state.G).toEqual({ A: true });
  }

  {
    let flow = FlowWithPhases({
      onMove,
      phases: [{ name: 'A' }, { name: 'B', onMove: () => ({ B: true }) }],
    });
    let state = { G: {}, ctx: flow.ctx(2) };
    state = flow.processMove(state, { payload: {} });
    expect(state.G).toEqual({ A: true });
    state = flow.processGameEvent(state, gameEvent('endPhase'));
    state = flow.processMove(state, { payload: {} });
    expect(state.G).toEqual({ B: true });
  }
});

test('init', () => {
  let flow = FlowWithPhases({
    phases: [{ name: 'A', onPhaseEnd: () => ({ done: true }) }],
  });

  const orig = flow.ctx(2);
  let state = { G: {}, ctx: orig };
  state = flow.processGameEvent(state, gameEvent('init'));
  expect(state).toEqual({ G: {}, ctx: orig });

  flow = FlowWithPhases({
    phases: [{ name: 'A', onPhaseBegin: () => ({ done: true }) }],
  });

  state = { ctx: orig };
  state = flow.init(state);
  expect(state.G).toMatchObject({ done: true });
});

test('onPhaseBegin / onPhaseEnd', () => {
  const flow = FlowWithPhases({
    phases: [
      {
        name: 'A',
        onPhaseBegin: s => ({ ...s, setupA: true }),
        onPhaseEnd: s => ({ ...s, cleanupA: true }),
      },
      {
        name: 'B',
        onPhaseBegin: s => ({ ...s, setupB: true }),
        onPhaseEnd: s => ({ ...s, cleanupB: true }),
      },
    ],
  });

  let state = { G: {}, ctx: flow.ctx(2) };
  state = flow.init(state);
  expect(state.G).toMatchObject({ setupA: true });
  state = flow.processGameEvent(state, gameEvent('endPhase'));
  expect(state.G).toMatchObject({ setupA: true, cleanupA: true, setupB: true });
  state = flow.processGameEvent(state, gameEvent('endPhase'));
  expect(state.G).toMatchObject({
    setupA: true,
    cleanupA: true,
    setupB: true,
    cleanupB: true,
  });
});

test('endPhaseIf', () => {
  const flow = FlowWithPhases({
    phases: [{ name: 'A', endPhaseIf: () => true }, { name: 'B' }],
  });

  const state = { ctx: flow.ctx(2) };

  {
    const t = flow.processGameEvent(state, gameEvent('endPhase'));
    expect(t.ctx.phase).toBe('B');
  }

  {
    const t = flow.processGameEvent(state, gameEvent('endTurn'));
    expect(t.ctx.phase).toBe('B');
  }

  {
    const t = flow.processMove(state, { type: 'move', payload: {} });
    expect(t.ctx.phase).toBe('B');
  }

  {
    const endPhaseIf = () => true;
    const flow = FlowWithPhases({
      phases: [
        { name: 'A', endPhaseIf },
        { name: 'B', endPhaseIf },
        { name: 'C', endPhaseIf },
      ],
    });

    const state = { ctx: flow.ctx(2) };
    const t = flow.processGameEvent(state, gameEvent('endPhase'));
    expect(t.ctx.phase).toBe('A');
  }
});

test('endGameIf', () => {
  {
    const flow = FlowWithPhases({ endGameIf: G => G.win });

    let state = { G: {}, ctx: flow.ctx(2) };
    state = flow.processGameEvent(state, gameEvent('endTurn'));
    expect(state.ctx.gameover).toBe(undefined);

    state.G.win = 'A';

    {
      const t = flow.processGameEvent(state, gameEvent('endTurn'));
      expect(t.ctx.gameover).toBe('A');
    }

    {
      const t = flow.processMove(state, { type: 'move' });
      expect(t.ctx.gameover).toBe('A');
    }
  }

  {
    const flow = FlowWithPhases({
      phases: [{ name: 'default', endGameIf: G => G.win }],
    });

    let state = { G: {}, ctx: flow.ctx(2) };
    state = flow.processGameEvent(state, gameEvent('endTurn'));
    expect(state.ctx.gameover).toBe(undefined);

    state.G.win = 'A';

    {
      const t = flow.processGameEvent(state, gameEvent('endTurn'));
      expect(t.ctx.gameover).toBe('A');
    }

    {
      const t = flow.processGameEvent(state, gameEvent('endPhase'));
      expect(t.ctx.gameover).toBe('A');
    }

    {
      const t = flow.processMove(state, { type: 'move' });
      expect(t.ctx.gameover).toBe('A');
    }
  }

  // Test that the turn automatically ends.
  {
    const flow = FlowWithPhases({ endGameIf: G => G.win });
    const game = Game({
      moves: {
        A: () => ({ win: 'A' }),
        B: G => G,
      },
      flow,
    });
    const reducer = CreateGameReducer({ game, numPlayers: 2 });

    let state = reducer(undefined, { type: 'init' });
    expect(state.ctx.currentPlayer).toBe('0');
    state = reducer(state, makeMove('B'));
    expect(state.ctx.gameover).toBe(undefined);
    expect(state.ctx.currentPlayer).toBe('0');
    state = reducer(state, makeMove('A'));
    expect(state.ctx.gameover).toBe('A');
    expect(state.log[state.log.length - 1].payload.type).toBe('endTurn');
  }
});

test('endTurnIf', () => {
  {
    const flow = FlowWithPhases({ endTurnIf: G => G.endTurn });
    const game = Game({
      moves: {
        A: () => ({ endTurn: true }),
        B: G => G,
      },
      flow,
    });
    const reducer = CreateGameReducer({ game, numPlayers: 2 });

    let state = reducer(undefined, { type: 'init' });
    expect(state.ctx.currentPlayer).toBe('0');
    state = reducer(state, makeMove('B'));
    expect(state.ctx.currentPlayer).toBe('0');
    state = reducer(state, makeMove('A'));
    expect(state.ctx.currentPlayer).toBe('1');
  }

  {
    const flow = FlowWithPhases({
      phases: [
        {
          name: 'default',
          endTurnIf: G => G.endTurn,
        },
      ],
    });
    const game = Game({
      moves: {
        A: () => ({ endTurn: true }),
        B: G => G,
      },
      flow,
    });
    const reducer = CreateGameReducer({ game, numPlayers: 2 });

    let state = reducer(undefined, { type: 'init' });
    expect(state.ctx.currentPlayer).toBe('0');
    state = reducer(state, makeMove('B'));
    expect(state.ctx.currentPlayer).toBe('0');
    state = reducer(state, makeMove('A'));
    expect(state.ctx.currentPlayer).toBe('1');
  }
});

test('canMakeMove', () => {
  let game = Game({
    moves: {
      A: () => ({ A: true }),
      B: () => ({ B: true }),
      C: () => ({ C: true }),
    },

    flow: {
      allowedMoves: ['A', 'B'],
      phases: [
        { name: 'A', allowedMoves: () => ['A'] },
        { name: 'B', allowedMoves: ['B'] },
        { name: 'C' },
        { name: 'D', allowedMoves: null },
      ],
    },
  });

  const reducer = CreateGameReducer({ game, numPlayers: 2 });
  let state = reducer(undefined, { type: 'init' });

  // Basic.
  let flow;
  flow = Flow({});
  expect(flow.canMakeMove(state.G, state.ctx)).toBe(true);
  flow = Flow({ canMakeMove: () => false });
  expect(flow.canMakeMove(state.G, state.ctx)).toBe(false);

  // Phase A (A is allowed).
  expect(state.ctx.phase).toBe('A');

  state = reducer(state, makeMove('A'));
  expect(state.G).toMatchObject({ A: true });
  state = reducer(state, makeMove('B'));
  expect(state.G).not.toMatchObject({ B: true });
  state = reducer(state, makeMove('C'));
  expect(state.G).not.toMatchObject({ C: true });

  // Phase B (B is allowed).
  state = reducer(state, gameEvent('endPhase'));
  state.G = {};
  expect(state.ctx.phase).toBe('B');

  state = reducer(state, makeMove('A'));
  expect(state.G).not.toMatchObject({ A: true });
  state = reducer(state, makeMove('B'));
  expect(state.G).toMatchObject({ B: true });
  state = reducer(state, makeMove('C'));
  expect(state.G).not.toMatchObject({ C: true });

  // Phase C (A and B allowed).
  state = reducer(state, gameEvent('endPhase'));
  state.G = {};
  expect(state.ctx.phase).toBe('C');

  state = reducer(state, makeMove('A'));
  expect(state.G).toMatchObject({ A: true });
  state = reducer(state, makeMove('B'));
  expect(state.G).toMatchObject({ B: true });
  state = reducer(state, makeMove('C'));
  expect(state.G).not.toMatchObject({ C: true });

  // Phase D (A, B and C allowed).
  state = reducer(state, gameEvent('endPhase'));
  state.G = {};
  expect(state.ctx.phase).toBe('D');

  state = reducer(state, makeMove('A'));
  expect(state.G).toMatchObject({ A: true });
  state = reducer(state, makeMove('B'));
  expect(state.G).toMatchObject({ B: true });
  state = reducer(state, makeMove('C'));
  expect(state.G).toMatchObject({ C: true });

  // But not once the game is over.
  state.ctx.gameover = true;
  state.G = {};
  state = reducer(state, makeMove('A'));
  expect(state.G).not.toMatchObject({ A: true });
  state = reducer(state, makeMove('B'));
  expect(state.G).not.toMatchObject({ B: true });
});

test('canPlayerMakeMove', () => {
  // default behaviour
  const pid = 0;

  let flow = Flow({});
  expect(flow.canPlayerMakeMove({}, {}, pid)).toBe(false);
  // NOTE: currentPlayer is not allowed to make a move by default.
  // his playerID must be included in the actionPlayers array.
  expect(flow.canPlayerMakeMove({}, { currentPlayer: 0 }, pid)).toBe(false);
  expect(flow.canPlayerMakeMove({}, { actionPlayers: ['any'] }, pid)).toBe(
    true
  );
  expect(flow.canPlayerMakeMove({}, { actionPlayers: [0] }, pid)).toBe(true);
  expect(flow.canPlayerMakeMove({}, { actionPlayers: [1, 2, 3] }, pid)).toBe(
    false
  );

  // no one can make a move
  flow = Flow({ canPlayerMakeMove: () => false });
  expect(flow.canPlayerMakeMove({}, {}, pid)).toBe(false);
  expect(flow.canPlayerMakeMove({}, { currentPlayer: 0 }, pid)).toBe(false);
  expect(flow.canPlayerMakeMove({}, {}, 'any')).toBe(false);
});

test('endGame', () => {
  const flow = FlowWithPhases({ endGame: true });
  const state = { ctx: {} };

  {
    const t = flow.processGameEvent(state, gameEvent('endGame'));
    expect(t.ctx.gameover).toBe(true);
  }

  {
    const t = flow.processGameEvent(state, gameEvent('endGame', 42));
    expect(t.ctx.gameover).toBe(42);
  }
});

test('endTurn / endPhase args', () => {
  const flow = FlowWithPhases({
    phases: [{ name: 'A' }, { name: 'B' }, { name: 'C' }],
  });

  const state = { ctx: flow.ctx(3) };

  {
    let t = state;
    t = flow.processGameEvent(t, gameEvent('endPhase'));
    t = flow.processGameEvent(t, gameEvent('endTurn'));
    expect(t.ctx.playOrderPos).toBe(1);
    expect(t.ctx.currentPlayer).toBe('1');
    expect(t.ctx.phase).toBe('B');
  }

  {
    let t = state;
    t = flow.processGameEvent(t, gameEvent('endPhase', 'C'));
    t = flow.processGameEvent(t, gameEvent('endTurn', '2'));
    expect(t.ctx.playOrderPos).toBe(2);
    expect(t.ctx.currentPlayer).toBe('2');
    expect(t.ctx.phase).toBe('C');
  }

  {
    let t = state;
    t = flow.processGameEvent(t, gameEvent('endTurn', 'any'));
    expect(t.ctx.playOrderPos).toBe(undefined);
    expect(t.ctx.currentPlayer).toBe('any');
  }

  {
    let t = state;
    t = flow.processGameEvent(t, gameEvent('endTurn', '0'));
    expect(t.ctx.playOrderPos).toBe(0);
    expect(t.ctx.currentPlayer).toBe('0');
  }
});

test('resetGame', () => {
  let game = Game({
    moves: {
      move: (G, ctx, arg) => ({ ...G, [arg]: true }),
    },
  });

  const reducer = CreateGameReducer({ game, numPlayers: 2 });

  let state = reducer(undefined, { type: 'init' });

  const originalState = state;

  state = reducer(state, makeMove('move', 'A'));
  expect(state.G).toEqual({ A: true });

  state = reducer(state, makeMove('move', 'B'));
  expect(state.G).toEqual({ A: true, B: true });

  state = reducer(state, gameEvent('endTurn'));
  expect(state.ctx.turn).toEqual(1);

  state = reducer(state, reset());
  expect(state).toEqual(originalState);

  state = reducer(state, makeMove('move', 'C'));
  expect(state.G).toEqual({ C: true });

  state = reducer(state, undo());
  expect(state.G).toEqual({});

  state = reducer(state, redo());
  expect(state.G).toEqual({ C: true });

  state = reducer(state, reset());
  expect(state).toEqual(originalState);
});

test('change action players', () => {
  const flow = FlowWithPhases({ changeActionPlayers: true });
  const state = { ctx: {} };
  const newState = flow.processGameEvent(
    state,
    gameEvent('changeActionPlayers', [[1, 2]])
  );
  expect(newState.ctx.actionPlayers).toMatchObject([1, 2]);
});

test('change action players - reducer', () => {
  let game = Game({
    flow: { changeActionPlayers: true },

    moves: {
      playMilitia: (G, ctx) => {
        // change which players need to act
        ctx.events.changeActionPlayers([1, 2, 3]);
        return { ...G, playedCard: 'Militia' };
      },
      dropCards: (G, ctx) => {
        if (G.playedCard === 'Militia') {
          let actedOnMilitia = G.actedOnMilitia || [];
          actedOnMilitia.push(ctx.playerID);

          // this player did drop and must not take another action.
          var newActionPlayers = [...ctx.actionPlayers].filter(
            pn => pn !== ctx.playerID
          );
          ctx.events.changeActionPlayers(newActionPlayers);

          let playedCard = G.playedCard;
          if (actedOnMilitia.length === 3) {
            ctx.events.changeActionPlayers([0]);
            actedOnMilitia = undefined;
            playedCard = undefined;
          }
          return { ...G, actedOnMilitia, playedCard };
        } else {
          return G;
        }
      },
    },
  });

  const reducer = CreateGameReducer({ game, numPlayers: 4 });

  let state = reducer(undefined, { type: 'init' });
  state = reducer(state, makeMove('playMilitia'));
  expect(state.ctx.actionPlayers).toMatchObject([1, 2, 3]);

  state = reducer(state, makeMove('dropCards', undefined, 1));
  expect(state.ctx.actionPlayers).toMatchObject([2, 3]);
  state = reducer(state, makeMove('dropCards', undefined, 3));
  expect(state.ctx.actionPlayers).toMatchObject([2]);
  state = reducer(state, makeMove('dropCards', undefined, 2));
  expect(state.ctx.actionPlayers).toMatchObject([0]);
  expect(state.G).toMatchObject({});
});

test('undo / redo restricted by undoableMoves', () => {
  let game = Game({
    moves: {
      A: () => ({ A: true }),
      B: () => ({ B: true }),
      C: () => ({ C: true }),
    },

    flow: {
      undoableMoves: ['A', 'B'],

      phases: [
        { name: 'A', undoableMoves: ['A'] },
        { name: 'B', undoableMoves: ['B'] },
        { name: 'C' },
        { name: 'D', undoableMoves: null },
      ],
    },
  });

  const reducer = CreateGameReducer({ game, numPlayers: 2 });

  let state = reducer(undefined, { type: 'init' });

  state = reducer(state, makeMove('A'));
  expect(state.G).toEqual({ A: true });
  state = reducer(state, undo());
  expect(state.G).toEqual({});
  state = reducer(state, makeMove('B'));
  expect(state.G).toEqual({ B: true });
  state = reducer(state, undo());
  expect(state.G).toEqual({ B: true });
  state = reducer(state, makeMove('C'));
  expect(state.G).toEqual({ C: true });
  state = reducer(state, undo());
  expect(state.G).toEqual({ C: true });

  state.G = {};
  state = reducer(state, gameEvent('endPhase'));
  state = reducer(state, gameEvent('endTurn'));
  expect(state.ctx.phase).toBe('B');

  state = reducer(state, makeMove('A'));
  expect(state.G).toEqual({ A: true });
  state = reducer(state, undo());
  expect(state.G).toEqual({ A: true });
  state = reducer(state, makeMove('B'));
  expect(state.G).toEqual({ B: true });
  state = reducer(state, undo());
  expect(state.G).toEqual({ A: true });
  state = reducer(state, makeMove('C'));
  expect(state.G).toEqual({ C: true });
  state = reducer(state, undo());
  expect(state.G).toEqual({ C: true });

  state.G = {};
  state = reducer(state, gameEvent('endPhase'));
  state = reducer(state, gameEvent('endTurn'));
  expect(state.ctx.phase).toBe('C');

  state = reducer(state, makeMove('A'));
  expect(state.G).toEqual({ A: true });
  state = reducer(state, undo());
  expect(state.G).toEqual({});
  state = reducer(state, makeMove('B'));
  expect(state.G).toEqual({ B: true });
  state = reducer(state, undo());
  expect(state.G).toEqual({});
  state = reducer(state, makeMove('C'));
  expect(state.G).toEqual({ C: true });
  state = reducer(state, undo());
  expect(state.G).toEqual({ C: true });

  state.G = {};
  state = reducer(state, gameEvent('endPhase'));
  state = reducer(state, gameEvent('endTurn'));
  expect(state.ctx.phase).toBe('D');

  state = reducer(state, makeMove('A'));
  expect(state.G).toEqual({ A: true });
  state = reducer(state, undo());
  expect(state.G).toEqual({});
  state = reducer(state, makeMove('B'));
  expect(state.G).toEqual({ B: true });
  state = reducer(state, undo());
  expect(state.G).toEqual({});
  state = reducer(state, makeMove('C'));
  expect(state.G).toEqual({ C: true });
  state = reducer(state, undo());
  expect(state.G).toEqual({});
});

test('endPhaseOnMove', () => {
  let endPhaseACount = 0;
  let endPhaseBCount = 0;
  const onMove = () => ({ A: true });

  let flow = FlowWithPhases({
    onMove,
    phases: [
      {
        name: 'A',
        endTurnIf: () => true,
        endPhaseIf: () => true,
        onPhaseEnd: () => ++endPhaseACount,
      },
      {
        name: 'B',
        endTurnIf: () => false,
        endPhaseIf: () => false,
        onPhaseEnd: () => ++endPhaseBCount,
      },
    ],
  });
  let state = { G: {}, ctx: flow.ctx(2) };

  expect(state.ctx.phase).toBe('A');
  state = flow.processMove(state, { payload: {} });
  expect(state.ctx.phase).toBe('B');

  expect(endPhaseACount).toEqual(1);
  expect(endPhaseBCount).toEqual(0);
});

test('end turn when final phase is reached', () => {
  let flow = FlowWithPhases({
    endTurnIf: (G, ctx) => ctx.phase === 'C',
    phases: [{ name: 'A' }, { name: 'B' }, { name: 'C' }],
  });

  let state = { G: {}, ctx: flow.ctx(2) };

  expect(state.ctx.phase).toBe('A');
  expect(state.ctx.currentPlayer).toBe('0');

  state = flow.processGameEvent(state, gameEvent('endPhase'));

  expect(state.ctx.phase).toBe('B');
  expect(state.ctx.currentPlayer).toBe('0');

  state = flow.processGameEvent(state, gameEvent('endPhase'));

  expect(state.ctx.phase).toBe('C');
  expect(state.ctx.currentPlayer).toBe('1');
});

test('endTurn is not called twice in one move', () => {
  let flow = FlowWithPhases({
    endTurnIf: () => true,
    phases: [{ name: 'A', endPhaseIf: G => G.endPhase }, { name: 'B' }],
  });

  let state = { G: {}, ctx: flow.ctx(2) };

  expect(state.ctx.phase).toBe('A');
  expect(state.ctx.currentPlayer).toBe('0');
  expect(state.ctx.turn).toBe(0);

  state = flow.processMove(state, makeMove().payload);

  expect(state.ctx.phase).toBe('A');
  expect(state.ctx.currentPlayer).toBe('1');
  expect(state.ctx.turn).toBe(1);

  state.G.endPhase = true;

  // endPhaseIf and endTurnIf both return true here,
  // but the turn should only advance once, despite
  // endTurnIf being checked in endPhaseIf as well as processMove.
  state = flow.processMove(state, makeMove().payload);

  expect(state.ctx.phase).toBe('B');
  expect(state.ctx.currentPlayer).toBe('0');
  expect(state.ctx.turn).toBe(2);
});
