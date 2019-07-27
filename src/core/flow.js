/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import {
  SetStageEvent,
  InitTurnOrderState,
  UpdateTurnOrderState,
  TurnOrder,
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
 * is merely an internal function of Flow below.
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
export function FlowInternal({
  ctx,
  eventHandlers,
  enabledEvents,
  init,
  processMove,
  moveMap,
  moveNames,
  getMove,
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
    moveNames,
    getMove,

    eventNames: Object.keys(eventHandlers),
    enabledEventNames: Object.keys(enabledEvents),

    processMove: (state, action) => {
      return processMove(state, action);
    },

    processGameEvent: (state, action) => {
      return dispatch(state, action);
    },

    canPlayerCallEvent: (_G, ctx, playerID) => {
      const isCurrentPlayer = ctx.currentPlayer == playerID;
      if (ctx.stage) {
        return isCurrentPlayer && ctx.currentPlayer in ctx.stage;
      }
      return isCurrentPlayer;
    },

    canPlayerMakeMove: (_G, ctx, action) => {
      const playerID = action.payload.playerID;
      const move = getMove(ctx, action.payload.type, playerID);

      if (move === null) {
        return false;
      }

      if (ctx.stage === null && ctx.currentPlayer !== playerID) {
        return false;
      }

      return true;
    },

    canPlayerMakeAnyMove: (_G, ctx, playerID) => {
      if (ctx.stage) {
        return playerID in ctx.stage;
      }
      return ctx.currentPlayer === playerID;
    },
  };
}

/**
 * Flow
 *
 * Creates a reducer that updates ctx (analogous to how moves update G).
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
export function Flow({ moves, phases, endIf, turn, events, plugins }) {
  // Attach defaults.
  if (moves === undefined) {
    moves = {};
  }
  if (events === undefined) {
    events = {};
  }
  if (events.setStage === undefined) {
    events.setStage = true;
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
  let moveNames = new Set();
  let startingPhase = '';

  Object.keys(moves).forEach(name => moveNames.add(name));

  for (let phase in phaseMap) {
    const conf = phaseMap[phase];

    if (conf.start === true) {
      startingPhase = phase;
    }

    if (conf.moves !== undefined) {
      for (let move of Object.keys(conf.moves)) {
        moveMap[phase + '.' + move] = conf.moves[move];
        moveNames.add(move);
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
    if (conf.turn.order === undefined) {
      conf.turn.order = TurnOrder.DEFAULT;
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
    if (conf.turn.stages === undefined) {
      conf.turn.stages = {};
    }

    for (const stage in conf.turn.stages) {
      const stageConfig = conf.turn.stages[stage];
      const moves = stageConfig.moves || {};
      for (let move of Object.keys(moves)) {
        let key = phase + '.' + stage + '.' + move;
        moveMap[key] = moves[move];
        moveNames.add(move);
      }
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

    for (let i = 0; i < events.length; i++) {
      const { fn, arg, ...rest } = events[i];

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

  function StartGame(state, { next }) {
    next.push({ fn: StartPhase });
    return state;
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
    ctx = { ...ctx, currentPlayer: '', stage: null };

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

  /**
   * Retrieves the relevant move that can be played by playerID.
   *
   * If ctx.stage is set (i.e. one or more players are in some stage),
   * then it attempts to find the move inside the stages config for
   * that turn. If the stage for a player is '', then the player is
   * allowed to make a move (as determined by the phase config), but
   * isn't restricted to a particular set as defined in the stage config.
   *
   * If not, it then looks for the move inside the phase.
   *
   * If it doesn't find the move there, it looks at the global move definition.
   *
   * @param {object} ctx
   * @param {string} name
   * @param {string} playerID
   */
  function GetMove(ctx, name, playerID) {
    const conf = GetPhase(ctx);
    const stages = conf.turn.stages;

    if (ctx.stage && stages[ctx.stage[playerID]]) {
      // Check if moves are defined for the player's stage.
      const stage = stages[ctx.stage[playerID]];
      if (stage) {
        const moves = stage.moves;
        if (name in moves) {
          return moves[name];
        }
      }
    } else if (conf.moves) {
      // Check if moves are defined for the current phase.
      if (name in conf.moves) {
        return conf.moves[name];
      }
    } else if (name in moves) {
      // Check for the move globally.
      return moves[name];
    }

    return null;
  }

  function ProcessMove(state, action) {
    let conf = GetPhase(state.ctx);

    let endPhase = false;

    let stage = state.ctx.stage;
    if (state.ctx._stageOnce) {
      const playerID = action.playerID;
      stage = Object.keys(stage)
        .filter(id => id !== playerID)
        .reduce((obj, key) => {
          obj[key] = stage[key];
          return obj;
        }, {});

      if (Object.keys(stage).length == 0) {
        stage = null;
        endPhase = conf.turn.order.endPhaseOnceDone;
      }
    }

    state = {
      ...state,
      ctx: {
        ...state.ctx,
        stage,
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

    if (endPhase) {
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
    setStage: SetStageEvent,
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
  if (events.setStage) {
    enabledEvents['setStage'] = true;
  }

  return FlowInternal({
    ctx: numPlayers => ({
      numPlayers,
      turn: 0,
      currentPlayer: '0',
      currentPlayerMoves: 0,
      playOrder: [...new Array(numPlayers)].map((d, i) => i + ''),
      playOrderPos: 0,
      phase: startingPhase,
      stage: null,
    }),
    init: state => {
      return ProcessEvents(state, [{ fn: StartGame }]);
    },
    eventHandlers,
    enabledEvents,
    moveMap,
    moveNames: [...moveNames.values()],
    processMove: ProcessMove,
    getMove: GetMove,
  });
}
