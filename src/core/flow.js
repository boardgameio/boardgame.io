/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import {
  SetActivePlayersEvent,
  SetActivePlayers,
  UpdateActivePlayersOnceEmpty,
  InitTurnOrderState,
  UpdateTurnOrderState,
  Stage,
  TurnOrder,
} from './turn-order';
import { gameEvent } from './action-creators';
import * as plugin from '../plugins/main';
import { ContextEnhancer } from './context-enhancer';
import * as logging from './logger';

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
  if (plugins === undefined) {
    plugins = [];
  }
  if (phases === undefined) {
    phases = {};
  }

  if (!endIf) endIf = () => undefined;
  if (!turn) turn = {};

  const phaseMap = { ...phases };

  if ('' in phaseMap) {
    logging.error('cannot specify phase with empty name');
  }

  phaseMap[''] = {};

  let moveMap = {};
  let moveNames = new Set();
  let startingPhase = null;

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
    return ctx.phase ? phaseMap[ctx.phase] : phaseMap[''];
  }

  function OnMove(s) {
    return s;
  }

  function Process(state, events) {
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
          const ctx = { ...state.ctx, phase: null };
          return { ...state, ctx };
        }
        phasesEnded.add(phase);
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

      events.push(...next);
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
    if (currentPlayer) {
      ctx = { ...ctx, currentPlayer };
      if (conf.turn.activePlayers) {
        ctx = SetActivePlayers(ctx, conf.turn.activePlayers);
      }
    } else {
      // This is only called at the beginning of the phase
      // when there is no currentPlayer yet.
      ctx = InitTurnOrderState(G, ctx, conf.turn);
    }

    const turn = ctx.turn + 1;
    ctx = { ...ctx, turn, numMoves: 0, _prevActivePlayers: [] };

    G = conf.turn.onBegin(G, ctx);

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

    if (arg && arg.next) {
      if (arg.next in phaseMap) {
        ctx = { ...ctx, phase: arg.next };
      } else {
        logging.error('invalid phase: ' + arg.next);
        return state;
      }
    } else if (conf.next !== undefined) {
      ctx = { ...ctx, phase: conf.next };
    } else {
      ctx = { ...ctx, phase: null };
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
    const { endPhase, ctx: newCtx } = UpdateTurnOrderState(
      G,
      { ...ctx, currentPlayer },
      conf.turn,
      arg
    );
    ctx = newCtx;

    state = { ...state, G, ctx };

    if (endPhase) {
      next.push({ fn: EndPhase, turn: ctx.turn, phase: ctx.phase });
    } else {
      next.push({ fn: StartTurn, currentPlayer: ctx.currentPlayer });
    }

    return state;
  }

  function UpdateStage(state, { arg, playerID }) {
    if (typeof arg === 'string') {
      arg = { stage: arg };
    }

    let { ctx } = state;
    let {
      activePlayers,
      _activePlayersMoveLimit,
      _activePlayersNumMoves,
    } = ctx;

    if (arg.stage) {
      if (activePlayers === null) {
        activePlayers = {};
      }
      activePlayers[playerID] = arg.stage;
      _activePlayersNumMoves[playerID] = 0;

      if (arg.moveLimit) {
        if (_activePlayersMoveLimit === null) {
          _activePlayersMoveLimit = {};
        }
        _activePlayersMoveLimit[playerID] = arg.moveLimit;
      }
    }

    ctx = {
      ...ctx,
      activePlayers,
      _activePlayersMoveLimit,
      _activePlayersNumMoves,
    };

    return { ...state, ctx };
  }

  ///////////////
  // ShouldEnd //
  ///////////////

  function ShouldEndGame({ G, ctx }) {
    return endIf(G, ctx);
  }

  function ShouldEndPhase({ G, ctx }) {
    const conf = GetPhase(ctx);
    return conf.endIf(G, ctx);
  }

  function ShouldEndTurn({ G, ctx }) {
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

  function EndPhase(state, { arg, next, turn, automatic }) {
    // End the turn first.
    state = EndTurn(state, { turn, force: true });

    let G = state.G;
    let ctx = state.ctx;

    if (next) {
      next.push({ fn: UpdatePhase, arg, phase: ctx.phase });
    }

    // If we aren't in a phase, there is nothing else to do.
    if (ctx.phase === null) {
      return state;
    }

    // Run any cleanup code for the phase that is about to end.
    const conf = GetPhase(ctx);
    G = conf.onEnd(G, ctx);

    // Reset the phase.
    ctx = { ...ctx, phase: null };

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

    const deltalog = [...state.deltalog, logEntry];

    return { ...state, G, ctx, deltalog };
  }

  function EndTurn(state, { arg, next, turn, force, automatic, playerID }) {
    // This is not the turn that EndTurn was originally
    // called for. The turn was probably ended some other way.
    if (turn !== state.ctx.turn) {
      return state;
    }

    let { G, ctx } = state;
    const conf = GetPhase(ctx);

    // Prevent ending the turn if moveLimit hasn't been reached.
    const currentPlayerMoves = ctx.numMoves || 0;
    if (
      !force &&
      conf.turn.moveLimit &&
      currentPlayerMoves < conf.turn.moveLimit
    ) {
      logging.info(
        `cannot end turn before making ${conf.turn.moveLimit} moves`
      );
      return state;
    }

    // Run turn-end triggers.
    G = conf.turn.onEnd(G, ctx);

    if (next) {
      next.push({ fn: UpdateTurn, arg, currentPlayer: ctx.currentPlayer });
    }

    // Reset activePlayers.
    ctx = { ...ctx, activePlayers: null };

    // Remove player from playerOrder
    if (arg && arg.remove) {
      playerID = playerID || ctx.currentPlayer;

      const playOrder = ctx.playOrder.filter(i => i != playerID);

      const playOrderPos =
        ctx.playOrderPos > playOrder.length - 1 ? 0 : ctx.playOrderPos;

      ctx = { ...ctx, playOrder, playOrderPos };

      if (playOrder.length === 0) {
        next.push({ fn: EndPhase, turn: ctx.turn, phase: ctx.phase });
        return state;
      }
    }

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

  function EndStage(state, { arg, next, automatic, playerID }) {
    playerID = playerID || state.ctx.currentPlayer;

    let { ctx } = state;
    let { activePlayers, _activePlayersMoveLimit } = ctx;

    const playerInStage = activePlayers !== null && playerID in activePlayers;

    if (!arg && playerInStage) {
      const conf = GetPhase(ctx);
      const stage = conf.turn.stages[activePlayers[playerID]];
      if (stage && stage.next) arg = stage.next;
    }

    if (next && arg) {
      next.push({ fn: UpdateStage, arg, playerID });
    }

    // If player isn’t in a stage, there is nothing else to do.
    if (!playerInStage) return state;

    // Remove player from activePlayers.
    activePlayers = Object.keys(activePlayers)
      .filter(id => id !== playerID)
      .reduce((obj, key) => {
        obj[key] = activePlayers[key];
        return obj;
      }, {});

    if (_activePlayersMoveLimit) {
      // Remove player from _activePlayersMoveLimit.
      _activePlayersMoveLimit = Object.keys(_activePlayersMoveLimit)
        .filter(id => id !== playerID)
        .reduce((obj, key) => {
          obj[key] = _activePlayersMoveLimit[key];
          return obj;
        }, {});
    }

    ctx = UpdateActivePlayersOnceEmpty({
      ...ctx,
      activePlayers,
      _activePlayersMoveLimit,
    });

    // Add log entry.
    const action = gameEvent('endStage', arg);
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

    return { ...state, ctx, deltalog };
  }

  /**
   * Retrieves the relevant move that can be played by playerID.
   *
   * If ctx.activePlayers is set (i.e. one or more players are in some stage),
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
    const { activePlayers } = ctx;

    if (
      activePlayers &&
      activePlayers[playerID] !== undefined &&
      activePlayers[playerID] !== Stage.NULL &&
      stages[activePlayers[playerID]] !== undefined &&
      stages[activePlayers[playerID]].moves !== undefined
    ) {
      // Check if moves are defined for the player's stage.
      const stage = stages[activePlayers[playerID]];
      const moves = stage.moves;
      if (name in moves) {
        return moves[name];
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

    let { ctx } = state;
    let { _activePlayersNumMoves } = ctx;

    const { playerID } = action;

    if (ctx.activePlayers) _activePlayersNumMoves[playerID]++;

    let numMoves = state.ctx.numMoves;
    if (playerID == state.ctx.currentPlayer) {
      numMoves++;
    }

    state = {
      ...state,
      ctx: {
        ...ctx,
        numMoves,
        _activePlayersNumMoves,
      },
    };

    if (
      ctx._activePlayersMoveLimit &&
      _activePlayersNumMoves[playerID] >= ctx._activePlayersMoveLimit[playerID]
    ) {
      state = EndStage(state, { playerID, automatic: true });
    }

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

    return Process(state, events);
  }

  function SetStageEvent(state, playerID, arg) {
    return Process(state, [{ fn: EndStage, arg, playerID }]);
  }

  function EndStageEvent(state, playerID) {
    return Process(state, [{ fn: EndStage, playerID }]);
  }

  function SetPhaseEvent(state, _playerID, newPhase) {
    return Process(state, [
      {
        fn: EndPhase,
        phase: state.ctx.phase,
        turn: state.ctx.turn,
        arg: { next: newPhase },
      },
    ]);
  }

  function EndPhaseEvent(state) {
    return Process(state, [
      { fn: EndPhase, phase: state.ctx.phase, turn: state.ctx.turn },
    ]);
  }

  function EndTurnEvent(state, _playerID, arg) {
    return Process(state, [
      { fn: EndTurn, turn: state.ctx.turn, phase: state.ctx.phase, arg },
    ]);
  }

  function PassEvent(state, _playerID, arg) {
    return Process(state, [
      {
        fn: EndTurn,
        turn: state.ctx.turn,
        phase: state.ctx.phase,
        force: true,
        arg,
      },
    ]);
  }

  function EndGameEvent(state, _playerID, arg) {
    return Process(state, [
      { fn: EndGame, turn: state.ctx.turn, phase: state.ctx.phase, arg },
    ]);
  }

  const eventHandlers = {
    endStage: EndStageEvent,
    setStage: SetStageEvent,
    endTurn: EndTurnEvent,
    pass: PassEvent,
    endPhase: EndPhaseEvent,
    setPhase: SetPhaseEvent,
    endGame: EndGameEvent,
    setActivePlayers: SetActivePlayersEvent,
  };

  let enabledEventNames = [];

  if (events.endTurn !== false) {
    enabledEventNames.push('endTurn');
  }
  if (events.pass !== false) {
    enabledEventNames.push('pass');
  }
  if (events.endPhase !== false) {
    enabledEventNames.push('endPhase');
  }
  if (events.setPhase !== false) {
    enabledEventNames.push('setPhase');
  }
  if (events.endGame !== false) {
    enabledEventNames.push('endGame');
  }
  if (events.setActivePlayers !== false) {
    enabledEventNames.push('setActivePlayers');
  }
  if (events.endStage !== false) {
    enabledEventNames.push('endStage');
  }
  if (events.setStage !== false) {
    enabledEventNames.push('setStage');
  }

  function ProcessEvent(state, action) {
    const { type, playerID, args } = action.payload;
    if (eventHandlers.hasOwnProperty(type)) {
      const eventArgs = [state, playerID].concat(args);
      return eventHandlers[type].apply({}, eventArgs);
    }
    return state;
  }

  function IsPlayerActive(_G, ctx, playerID) {
    if (ctx.activePlayers) {
      return playerID in ctx.activePlayers;
    }
    return ctx.currentPlayer === playerID;
  }

  return {
    ctx: numPlayers => ({
      numPlayers,
      turn: 0,
      currentPlayer: '0',
      playOrder: [...new Array(numPlayers)].map((_d, i) => i + ''),
      playOrderPos: 0,
      phase: startingPhase,
      activePlayers: null,
    }),
    init: state => {
      return Process(state, [{ fn: StartGame }]);
    },
    isPlayerActive: IsPlayerActive,
    eventHandlers,
    eventNames: Object.keys(eventHandlers),
    enabledEventNames,
    moveMap,
    moveNames: [...moveNames.values()],
    processMove: ProcessMove,
    processEvent: ProcessEvent,
    getMove: GetMove,
  };
}
