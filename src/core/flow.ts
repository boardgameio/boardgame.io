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
import * as logging from './logger';
import {
  ActionPayload,
  ActionShape,
  State,
  Ctx,
  LogEntry,
  Game,
  PhaseConfig,
  PlayerID,
  Move,
} from '../types';

/**
 * Flow
 *
 * Creates a reducer that updates ctx (analogous to how moves update G).
 */
export function Flow({
  moves,
  phases,
  endIf,
  onEnd,
  turn,
  events,
  plugins,
}: Game) {
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
  if (!onEnd) onEnd = G => G;
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

  const HookWrapper = (fn: (G: any, ctx: Ctx) => any) => {
    const withPlugins = plugin.FnWrap(fn, plugins);
    return (state: State) => {
      const ctxWithAPI = plugin.EnhanceCtx(state);
      return withPlugins(state.G, ctxWithAPI);
    };
  };

  const TriggerWrapper = (endIf: (G: any, ctx: Ctx) => any) => {
    return (state: State) => {
      let ctxWithAPI = plugin.EnhanceCtx(state);
      return endIf(state.G, ctxWithAPI);
    };
  };

  const wrapped = {
    onEnd: HookWrapper(onEnd),
    endIf: TriggerWrapper(endIf),
  };

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
    if (conf.onEnd === undefined) {
      conf.onEnd = G => G;
    }
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

    conf.wrapped = {
      onBegin: HookWrapper(conf.onBegin),
      onEnd: HookWrapper(conf.onEnd),
      endIf: TriggerWrapper(conf.endIf),
    };

    conf.turn.wrapped = {
      onMove: HookWrapper(conf.turn.onMove),
      onBegin: HookWrapper(conf.turn.onBegin),
      onEnd: HookWrapper(conf.turn.onEnd),
      endIf: TriggerWrapper(conf.turn.endIf),
    };
  }

  function GetPhase(ctx: { phase: string }): PhaseConfig {
    return ctx.phase ? phaseMap[ctx.phase] : phaseMap[''];
  }

  function OnMove(s) {
    return s;
  }

  function Process(state: State, events): State {
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

  function StartGame(state: State, { next }): State {
    next.push({ fn: StartPhase });
    return state;
  }

  function StartPhase(state: State, { next }): State {
    let { G, ctx } = state;
    const conf = GetPhase(ctx);

    // Run any phase setup code provided by the user.
    G = conf.wrapped.onBegin(state);

    next.push({ fn: StartTurn });

    return { ...state, G, ctx };
  }

  function StartTurn(state: State, { currentPlayer }): State {
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
      ctx = InitTurnOrderState(state, conf.turn);
    }

    const turn = ctx.turn + 1;
    ctx = { ...ctx, turn, numMoves: 0, _prevActivePlayers: [] };

    G = conf.turn.wrapped.onBegin({ ...state, G, ctx });

    const _undo = [{ G, ctx }];

    return { ...state, G, ctx, _undo, _redo: [] };
  }

  ////////////
  // Update //
  ////////////

  function UpdatePhase(state: State, { arg, next, phase }): State {
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

  function UpdateTurn(state: State, { arg, currentPlayer, next }): State {
    let { G, ctx } = state;
    const conf = GetPhase(ctx);

    // Update turn order state.
    const { endPhase, ctx: newCtx } = UpdateTurnOrderState(
      state,
      currentPlayer,
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

  function UpdateStage(state: State, { arg, playerID }): State {
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

  function ShouldEndGame(state: State): boolean {
    return wrapped.endIf(state);
  }

  function ShouldEndPhase(state: State): boolean | void {
    const conf = GetPhase(state.ctx);
    return conf.wrapped.endIf(state);
  }

  function ShouldEndTurn(state: State): boolean | void {
    const conf = GetPhase(state.ctx);

    // End the turn if the required number of moves has been made.
    const currentPlayerMoves = state.ctx.numMoves || 0;
    if (conf.turn.moveLimit && currentPlayerMoves >= conf.turn.moveLimit) {
      return true;
    }

    return conf.turn.wrapped.endIf(state);
  }

  /////////
  // End //
  /////////

  function EndGame(state: State, { arg, phase }): State {
    state = EndPhase(state, { phase });

    if (arg === undefined) {
      arg = true;
    }

    state = { ...state, ctx: { ...state.ctx, gameover: arg } };

    // Run game end hook.
    const G = wrapped.onEnd(state);

    return { ...state, G };
  }

  function EndPhase(state: State, { arg, next, turn, automatic }: any): State {
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
    G = conf.wrapped.onEnd(state);

    // Reset the phase.
    ctx = { ...ctx, phase: null };

    // Add log entry.
    const action = gameEvent('endPhase', arg);
    const logEntry: LogEntry = {
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

  function EndTurn(
    state: State,
    { arg, next, turn, force, automatic, playerID }: any
  ): State {
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
    G = conf.turn.wrapped.onEnd(state);

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
    const logEntry: LogEntry = {
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

  function EndStage(
    state: State,
    { arg, next, automatic, playerID }: any
  ): State {
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
    const logEntry: LogEntry = {
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
  function GetMove(ctx: Ctx, name: string, playerID: PlayerID): null | Move {
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

  function ProcessMove(state: State, action: ActionPayload.MakeMove): State {
    let conf = GetPhase(state.ctx);
    const move = GetMove(state.ctx, action.type, action.playerID);
    const shouldCount =
      !move || typeof move === 'function' || move.noLimit !== true;

    let { ctx } = state;
    let { _activePlayersNumMoves } = ctx;

    const { playerID } = action;

    let numMoves = state.ctx.numMoves;
    if (shouldCount) {
      if (playerID == state.ctx.currentPlayer) {
        numMoves++;
      }
      if (ctx.activePlayers) _activePlayersNumMoves[playerID]++;
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

    const G = conf.turn.wrapped.onMove(state);
    state = { ...state, G };

    // Update undo / redo state.
    const undo = state._undo || [];
    const moveType = action.type;

    state = {
      ...state,
      _undo: [...undo, { G: state.G, ctx: state.ctx, moveType }],
      _redo: [],
    };

    let events = [{ fn: OnMove }];

    return Process(state, events);
  }

  function SetStageEvent(state: State, playerID: PlayerID, arg: any): State {
    return Process(state, [{ fn: EndStage, arg, playerID }]);
  }

  function EndStageEvent(state: State, playerID: PlayerID): State {
    return Process(state, [{ fn: EndStage, playerID }]);
  }

  function SetPhaseEvent(
    state: State,
    _playerID: PlayerID,
    newPhase: string
  ): State {
    return Process(state, [
      {
        fn: EndPhase,
        phase: state.ctx.phase,
        turn: state.ctx.turn,
        arg: { next: newPhase },
      },
    ]);
  }

  function EndPhaseEvent(state: State): State {
    return Process(state, [
      { fn: EndPhase, phase: state.ctx.phase, turn: state.ctx.turn },
    ]);
  }

  function EndTurnEvent(state: State, _playerID: PlayerID, arg: any): State {
    return Process(state, [
      { fn: EndTurn, turn: state.ctx.turn, phase: state.ctx.phase, arg },
    ]);
  }

  function PassEvent(state: State, _playerID: PlayerID, arg: any): State {
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

  function EndGameEvent(state: State, _playerID: PlayerID, arg: any): State {
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

  function ProcessEvent(state: State, action: ActionShape.GameEvent) {
    const { type, playerID, args } = action.payload;
    if (eventHandlers.hasOwnProperty(type)) {
      const eventArgs = [state, playerID].concat(args);
      return eventHandlers[type].apply({}, eventArgs);
    }
    return state;
  }

  function IsPlayerActive(_G: object, ctx: Ctx, playerID: PlayerID): boolean {
    if (ctx.activePlayers) {
      return playerID in ctx.activePlayers;
    }
    return ctx.currentPlayer === playerID;
  }

  return {
    ctx: (numPlayers: number): Ctx => ({
      numPlayers,
      turn: 0,
      currentPlayer: '0',
      playOrder: [...new Array(numPlayers)].map((_d, i) => i + ''),
      playOrderPos: 0,
      phase: startingPhase,
      activePlayers: null,
    }),
    init: (state: State): State => {
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
