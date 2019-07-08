/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import {
  SetActionPlayersEvent,
  InitTurnOrderState,
  UpdateTurnOrderState,
} from './turn-order';
import { gameEvent } from './action-creators';
import * as plugin from '../plugins/main';
import { ContextEnhancer } from './context-enhancer';
import * as logging from './logger';

/**
 * Helper to create a reducer that manages ctx (with the
 * ability to also update G).
 *
 * This is mostly around for legacy reasons. The original plan
 * was to have two flows, one with phases etc. and another
 * simpler one like this. The current state is such that this
 * is merely an internal function of FlowWithPhases below.
 *
 * @param {...object} ctx - Function with the signature
 *                          numPlayers => ctx
 *                          that determines the initial value of ctx.
 * @param {...object} eventHandlers - Object containing functions
 *                                    named after events that this
 *                                    reducer will handle. Each function
 *                                    has the following signature:
 *                                    ({G, ctx}) => {G, ctx}
 * @param {...object} enabledEvents - Map of eventName -> bool indicating
 *                                    which events are callable from the client
 *                                    or from within moves.
 * @param {...object} processMove - A function that's called whenever a move is made.
 *                                  (state, action, dispatch) => state.
 */
export function Flow({
  ctx,
  eventHandlers,
  enabledEvents,
  init,
  processMove,
  moveMap,
}) {
  if (!ctx) ctx = () => ({});
  if (!eventHandlers) eventHandlers = {};
  if (!enabledEvents) enabledEvents = {};
  if (!init) init = state => state;
  if (!processMove) processMove = state => state;

  const dispatch = (state, action) => {
    const { payload } = action;
    if (eventHandlers.hasOwnProperty(payload.type)) {
      const context = { playerID: payload.playerID, dispatch };
      const args = [state].concat(payload.args);
      return eventHandlers[payload.type].apply(context, args);
    }
    return state;
  };

  return {
    ctx,
    init,
    moveMap,

    eventNames: Object.getOwnPropertyNames(eventHandlers),
    enabledEventNames: Object.getOwnPropertyNames(enabledEvents),

    processMove: (state, action) => {
      return processMove(state, action);
    },

    processGameEvent: (state, action) => {
      return dispatch(state, action);
    },

    canPlayerCallEvent: (G, ctx, playerID) => {
      return (
        ctx.currentPlayer == playerID && ctx.actionPlayers.includes(playerID)
      );
    },

    canPlayerMakeMove: (G, ctx, playerID) => {
      const actionPlayers = ctx.actionPlayers || [];
      return actionPlayers.includes(playerID);
    },
  };
}

/**
 * FlowWithPhases
 *
 * A very customizable game flow that introduces phases to the
 * game. Each phase can be configured with:
 * - A custom turn order.
 * - Automatically executed setup / cleanup code.
 * - Custom phase end conditions.
 * - A move whitelist that disallows other moves during the phase.
 *
 * @param {...object} endIf - The game automatically ends if this function
 *                            returns anything (checked after each move).
 *                            The return value is available at ctx.gameover.
 *                            (G, ctx) => {}
 *
 * @param {...object} turn - Customize the turn structure (see turn-order.js).
 *
 * {
 *   // The turn order.
 *   order: TurnOrder.DEFAULT,
 *
 *   // Code to run at the beginning of the turn.
 *   onBegin: (G, ctx) => G,
 *
 *   // Code to run at the end of the turn.
 *   onEnd: (G, ctx) => G,
 *
 *   // The turn automatically ends if this returns a truthy
 *   // value (checked after each move).
 *   // If the return value is { next: playerID },
 *   // then that player is the next player
 *   // instead of following the turn order.
 *   endIf: (G, ctx) => boolean|object,
 *
 *   // End the turn automatically after a certain number
 *   // of moves.
 *   moveLimit: 1,
 *
 *   // Code to run at the end of a move.
 *   onMove: (G, ctx, { type: 'moveName', args: [] }) => G
 * }
 *
 * @param {...object} events - Section that allows enabling / disabling events.
 *
 * {
 *   endTurn - Set to false to disable the `endTurn` event.
 *
 *   endPhase - Set to false to disable the `endPhase` event.
 *
 *   endGame - Set to true to enable the `endGame` event.
 *
 *   setActionPlayers - Set to true to enable the `setActionPlayers` event.
 * }
 *
 *
 * @param {...object} phases - A map of phases in the game.
 *
 * {
 *   // Any setup code to run before the phase begins.
 *   onBegin: (G, ctx) => G,
 *
 *   // Any cleanup code to run after the phase ends.
 *   onEnd: (G, ctx) => G,
 *
 *   // The phase ends if this function returns a truthy value.
 *   // If the return value is of the form { next: 'phase name' }
 *   // then that will be chosen as the next phase.
 *   endIf: (G, ctx) => boolean|object,
 *
 *   // A phase-specific set of moves that overrides the global.
 *   moves: { ... },
 *
 *   // A phase-specific turn structure that overrides the global.
 *   turn: { ... },
 *
 *   // Set to true to begin the game in this phase. Only one phase
 *   // can have this set to true.
 *   start: false,
 * }
 */
export function FlowWithPhases({ phases, endIf, turn, events, plugins }) {
  // Attach defaults.
  if (events === undefined) {
    events = {};
  }
  if (events.endPhase === undefined && phases) {
    events.endPhase = true;
  }
  if (events.endTurn === undefined) {
    events.endTurn = true;
  }
  if (events.endGame === undefined) {
    events.endGame = false;
  }
  if (events.setActionPlayers === undefined) {
    events.setActionPlayers = false;
  }
  if (plugins === undefined) {
    plugins = [];
  }

  if (!endIf) endIf = () => undefined;
  if (!turn) turn = {};

  const phaseMap = phases || {};

  if ('' in phaseMap) {
    logging.error('cannot specify phase with empty name');
  }

  phaseMap[''] = {};

  let moveMap = {};
  let startingPhase = '';

  for (let phase in phaseMap) {
    const conf = phaseMap[phase];

    if (conf.start === true) {
      startingPhase = phase;
    }

    if (conf.moves !== undefined) {
      for (let move of Object.keys(conf.moves)) {
        moveMap[phase + '.' + move] = conf.moves[move];
      }
    }

    if (conf.endIf === undefined) {
      conf.endIf = () => undefined;
    }
    if (conf.onBegin === undefined) {
      conf.onBegin = G => G;
    }
    conf.onBegin = plugin.FnWrap(conf.onBegin, plugins);
    if (conf.onEnd === undefined) {
      conf.onEnd = G => G;
    }
    conf.onEnd = plugin.FnWrap(conf.onEnd, plugins);

    if (conf.turn === undefined) {
      conf.turn = turn;
    }
    if (conf.turn.onBegin === undefined) {
      conf.turn.onBegin = G => G;
    }
    if (conf.turn.onEnd === undefined) {
      conf.turn.onEnd = G => G;
    }
    if (conf.turn.endIf === undefined) {
      conf.turn.endIf = () => false;
    }
    if (conf.turn.onMove === undefined) {
      conf.turn.onMove = G => G;
    }
    conf.turn.onMove = plugin.FnWrap(conf.turn.onMove, plugins);
    conf.turn.onBegin = plugin.FnWrap(conf.turn.onBegin, plugins);
    conf.turn.onEnd = plugin.FnWrap(conf.turn.onEnd, plugins);
  }

  function GetPhase(ctx) {
    return phaseMap[ctx.phase];
  }

  function OnMove(s) {
    return s;
  }

  function ProcessEvents(state, events) {
    const phasesEnded = new Set();
    const turnsEnded = new Set();

    function LOG(d, msg) {
      if (msg) console.log(msg);
    }

    for (let i = 0; i < events.length; i++) {
      const { fn, arg, ...rest } = events[i];

      LOG(fn);
      LOG(rest);

      // Detect a loop of EndPhase calls.
      // This could potentially even be an infinite loop
      // if the endIf condition of each phase blindly
      // returns true. The moment we detect a single
      // loop, we just bail out of all phases.
      if (fn === EndPhase) {
        turnsEnded.clear();
        const phase = state.ctx.phase;
        if (phasesEnded.has(phase)) {
          const ctx = { ...state.ctx, phase: '' };
          return { ...state, ctx };
        }
        phasesEnded.add(phase);
      }

      // Detect a loop of EndTurn calls.
      // We set the currentPlayer to an empty value
      // (i.e. we are no longer in a turn) in this case.
      if (fn === EndTurn) {
        const currentPlayer = state.ctx.currentPlayer;
        if (turnsEnded.has(currentPlayer)) {
          const ctx = { ...state.ctx, currentPlayer: '' };
          return { ...state, ctx };
        }
        turnsEnded.add(currentPlayer);
      }

      // Process event.
      let next = [];
      state = fn(state, {
        ...rest,
        arg,
        next,
      });

      if (fn === EndGame) {
        break;
      }

      // Check if we should end the game.
      const shouldEndGame = ShouldEndGame(state);
      if (shouldEndGame) {
        LOG('shouldEndGame');
        events.push({
          fn: EndGame,
          arg: shouldEndGame,
          turn: state.ctx.turn,
          phase: state.ctx.phase,
          automatic: true,
        });
        continue;
      }

      // Check if we should end the phase.
      const shouldEndPhase = ShouldEndPhase(state);
      if (shouldEndPhase) {
        LOG('shouldEndPhase');
        events.push({
          fn: EndPhase,
          arg: shouldEndPhase,
          turn: state.ctx.turn,
          phase: state.ctx.phase,
          automatic: true,
        });
        continue;
      }

      // Check if we should end the turn.
      if (fn === OnMove) {
        const shouldEndTurn = ShouldEndTurn(state);
        if (shouldEndTurn) {
          LOG('shouldEndTurn');
          events.push({
            fn: EndTurn,
            arg: shouldEndTurn,
            turn: state.ctx.turn,
            phase: state.ctx.phase,
            automatic: true,
          });
          continue;
        }
      }

      if (i == events.length - 1) {
        events.push(...next);
      }
    }

    return state;
  }

  ///////////
  // Start //
  ///////////

  function StartGame(state) {
    return ProcessEvents(state, [{ fn: StartPhase }]);
  }

  function StartPhase(state, { next }) {
    let { G, ctx } = state;
    const conf = GetPhase(ctx);

    // Allow plugins to modify G and ctx at the beginning of a phase.
    G = plugin.G.onPhaseBegin(G, ctx, plugins);
    ctx = plugin.ctx.onPhaseBegin(ctx, plugins);

    // Run any phase setup code provided by the user.
    G = conf.onBegin(G, ctx);

    next.push({ fn: StartTurn });

    return { ...state, G, ctx };
  }

  function StartTurn(state, { currentPlayer }) {
    let { G, ctx } = state;
    const conf = GetPhase(ctx);

    // Initialize the turn order state.
    if (currentPlayer !== undefined) {
      ctx = { ...ctx, currentPlayer };
    } else {
      ctx = InitTurnOrderState(G, ctx, conf.turn);
    }

    G = conf.turn.onBegin(G, ctx);

    const turn = ctx.turn + 1;
    ctx = { ...ctx, turn, numMoves: 0 };

    const plainCtx = ContextEnhancer.detachAllFromContext(ctx);
    const _undo = [{ G, ctx: plainCtx }];

    return { ...state, G, ctx, _undo, _redo: [] };
  }

  ////////////
  // Update //
  ////////////

  function UpdatePhase(state, { arg, next, phase }) {
    const conf = GetPhase({ phase });
    let { ctx } = state;

    if (arg && arg !== true) {
      if (arg.next in phaseMap) {
        ctx = { ...ctx, phase: arg.next };
      } else {
        logging.error('invalid argument to endPhase: ' + arg);
      }
    } else if (conf.next !== undefined) {
      ctx = { ...ctx, phase: conf.next };
    } else {
      ctx = { ...ctx, phase: '' };
    }

    state = { ...state, ctx };

    // Start the new phase.
    next.push({ fn: StartPhase });

    return state;
  }

  function UpdateTurn(state, { arg, currentPlayer, next }) {
    let { G, ctx } = state;
    const conf = GetPhase(ctx);

    // Update turn order state.
    const { endPhase, ctx: b } = UpdateTurnOrderState(
      G,
      { ...ctx, currentPlayer },
      conf.turn,
      arg
    );
    ctx = b;

    state = { ...state, G, ctx };

    if (endPhase) {
      next.push({ fn: EndPhase, turn: ctx.turn, phase: ctx.phase });
    } else {
      next.push({ fn: StartTurn, currentPlayer: ctx.currentPlayer });
    }

    return state;
  }

  ///////////////
  // ShouldEnd //
  ///////////////

  function ShouldEndGame({ G, ctx }) {
    return endIf(G, ctx);
  }

  function ShouldEndPhase({ G, ctx }) {
    if (ctx.phase === '') {
      return false;
    }

    const conf = GetPhase(ctx);
    return conf.endIf(G, ctx);
  }

  function ShouldEndTurn({ G, ctx }) {
    if (ctx.currentPlayer === '') {
      return false;
    }

    const conf = GetPhase(ctx);

    // End the turn if the required number of moves has been made.
    const currentPlayerMoves = ctx.numMoves || 0;
    if (conf.turn.moveLimit && currentPlayerMoves >= conf.turn.moveLimit) {
      return true;
    }

    return conf.turn.endIf(G, ctx);
  }

  /////////
  // End //
  /////////

  function EndGame(state, { arg, phase }) {
    state = EndPhase(state, { phase });

    if (arg === undefined) {
      arg = true;
    }

    return { ...state, ctx: { ...state.ctx, gameover: arg } };
  }

  function EndPhase(state, { arg, next, phase, turn, automatic }) {
    // End the turn first.
    state = EndTurn(state, { turn });

    let G = state.G;
    let ctx = state.ctx;

    // This is not the phase that EndPhase was originally
    // called for. The phase was probably ended some other way.
    if (phase !== ctx.phase) {
      return state;
    }

    // If we aren't in a phase, there is nothing to do.
    // if (ctx.phase === '') {
    //   return state;
    // }

    // Run any cleanup code for the phase that is about to end.
    const conf = GetPhase(ctx);
    G = conf.onEnd(G, ctx);

    if (next) {
      next.push({ fn: UpdatePhase, arg, phase: ctx.phase });
    }

    // Reset the phase.
    ctx = { ...ctx, phase: '', playOrderPos: 0 };

    // Add log entry.
    const action = gameEvent('endPhase', arg);
    const logEntry = {
      action,
      _stateID: state._stateID,
      turn: state.ctx.turn,
      phase: state.ctx.phase,
    };

    if (automatic) {
      logEntry.automatic = true;
    }

    const deltalog = [...(state.deltalog || []), logEntry];

    return { ...state, G, ctx, deltalog };
  }

  function EndTurn(state, { arg, next, turn, automatic }) {
    let { G, ctx } = state;

    // If we are not in a turn currently, do nothing.
    if (ctx.currentPlayer === '') {
      return state;
    }

    // This is not the turn that EndTurn was originally
    // called for. The turn was probably ended some other way.
    if (turn !== ctx.turn) {
      return state;
    }

    const conf = GetPhase(ctx);

    // Prevent ending the turn if moveLimit haven't been made.
    const currentPlayerMoves = ctx.numMoves || 0;
    if (conf.turn.moveLimit && currentPlayerMoves < conf.turn.moveLimit) {
      return state;
    }

    // Run turn-end triggers.
    G = conf.turn.onEnd(G, ctx);

    if (next) {
      next.push({ fn: UpdateTurn, arg, currentPlayer: ctx.currentPlayer });
    }

    // Reset currentPlayer.
    ctx = { ...ctx, currentPlayer: '' };

    // Add log entry.
    const action = gameEvent('endTurn', arg);
    const logEntry = {
      action,
      _stateID: state._stateID,
      turn: state.ctx.turn,
      phase: state.ctx.phase,
    };

    if (automatic) {
      logEntry.automatic = true;
    }

    const deltalog = [...(state.deltalog || []), logEntry];

    return { ...state, G, ctx, deltalog, _undo: [], _redo: [] };
  }

  function processMove(state, action) {
    let conf = GetPhase(state.ctx);

    // Update actionPlayers if _actionPlayersOnce is set.
    let actionPlayers = state.ctx.actionPlayers;
    if (state.ctx._actionPlayersOnce) {
      const playerID = action.playerID;
      actionPlayers = actionPlayers.filter(id => id !== playerID);
    }

    let actionPlayersOnceDone = false;
    if (
      actionPlayers.length == 0 &&
      conf.turn &&
      conf.turn.order &&
      conf.turn.order.endPhaseOnceDone
    ) {
      actionPlayersOnceDone = true;
    }

    state = {
      ...state,
      ctx: {
        ...state.ctx,
        actionPlayers,
        numMoves: state.ctx.numMoves + 1,
      },
    };

    const G = conf.turn.onMove(state.G, state.ctx, action);
    state = { ...state, G };

    // Update undo / redo state.
    const undo = state._undo || [];
    const moveType = action.type;

    const plainCtx = ContextEnhancer.detachAllFromContext(state.ctx);

    state = {
      ...state,
      _undo: [...undo, { G: state.G, ctx: plainCtx, moveType }],
      _redo: [],
    };

    let events = [{ fn: OnMove }];

    if (actionPlayersOnceDone) {
      events.push({
        fn: EndPhase,
        turn: state.ctx.turn,
        phase: state.ctx.phase,
      });
    }

    return ProcessEvents(state, events);
  }

  function EndPhaseEvent(state, arg) {
    return ProcessEvents(state, [
      { fn: EndPhase, phase: state.ctx.phase, turn: state.ctx.turn, arg },
    ]);
  }

  function EndTurnEvent(state, arg) {
    return ProcessEvents(state, [
      { fn: EndTurn, turn: state.ctx.turn, phase: state.ctx.phase, arg },
    ]);
  }

  function EndGameEvent(state, arg) {
    return ProcessEvents(state, [
      { fn: EndGame, turn: state.ctx.turn, phase: state.ctx.phase, arg },
    ]);
  }

  const eventHandlers = {
    endTurn: EndTurnEvent,
    endPhase: EndPhaseEvent,
    endGame: EndGameEvent,
    setActionPlayers: SetActionPlayersEvent,
  };

  let enabledEvents = {};
  if (events.endTurn) {
    enabledEvents['endTurn'] = true;
  }
  if (events.endPhase) {
    enabledEvents['endPhase'] = true;
  }
  if (events.endGame) {
    enabledEvents['endGame'] = true;
  }
  if (events.setActionPlayers) {
    enabledEvents['setActionPlayers'] = true;
  }

  return Flow({
    ctx: numPlayers => ({
      numPlayers,
      turn: -1,
      currentPlayer: '0',
      actionPlayers: ['0'],
      currentPlayerMoves: 0,
      playOrder: [...new Array(numPlayers)].map((d, i) => i + ''),
      playOrderPos: 0,
      phase: startingPhase,
      stage: {},
    }),
    init: state => {
      return StartGame(state);
    },
    eventHandlers,
    enabledEvents,
    processMove,
    moveMap,
  });
}
