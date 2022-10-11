/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import {
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
import type {
  ActionPayload,
  ActionShape,
  ActivePlayersArg,
  State,
  Ctx,
  FnContext,
  LogEntry,
  Game,
  PhaseConfig,
  PlayerID,
  Move,
} from '../types';
import { GameMethod } from './game-methods';
import { supportDeprecatedMoveLimit } from './backwards-compatibility';

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
  if (!onEnd) onEnd = ({ G }) => G;
  if (!turn) turn = {};

  const phaseMap = { ...phases };

  if ('' in phaseMap) {
    logging.error('cannot specify phase with empty name');
  }

  phaseMap[''] = {};

  const moveMap = {};
  const moveNames = new Set();
  let startingPhase = null;

  Object.keys(moves).forEach((name) => moveNames.add(name));

  const HookWrapper = (
    hook: (context: FnContext) => any,
    hookType: GameMethod
  ) => {
    const withPlugins = plugin.FnWrap(hook, hookType, plugins);
    return (state: State & { playerID?: PlayerID }) => {
      const pluginAPIs = plugin.GetAPIs(state);
      return withPlugins({
        ...pluginAPIs,
        G: state.G,
        ctx: state.ctx,
        playerID: state.playerID,
      });
    };
  };

  const TriggerWrapper = (trigger: (context: FnContext) => any) => {
    return (state: State) => {
      const pluginAPIs = plugin.GetAPIs(state);
      return trigger({
        ...pluginAPIs,
        G: state.G,
        ctx: state.ctx,
      });
    };
  };

  const wrapped = {
    onEnd: HookWrapper(onEnd, GameMethod.GAME_ON_END),
    endIf: TriggerWrapper(endIf),
  };

  for (const phase in phaseMap) {
    const phaseConfig = phaseMap[phase];

    if (phaseConfig.start === true) {
      startingPhase = phase;
    }

    if (phaseConfig.moves !== undefined) {
      for (const move of Object.keys(phaseConfig.moves)) {
        moveMap[phase + '.' + move] = phaseConfig.moves[move];
        moveNames.add(move);
      }
    }

    if (phaseConfig.endIf === undefined) {
      phaseConfig.endIf = () => undefined;
    }
    if (phaseConfig.onBegin === undefined) {
      phaseConfig.onBegin = ({ G }) => G;
    }
    if (phaseConfig.onEnd === undefined) {
      phaseConfig.onEnd = ({ G }) => G;
    }
    if (phaseConfig.turn === undefined) {
      phaseConfig.turn = turn;
    }
    if (phaseConfig.turn.order === undefined) {
      phaseConfig.turn.order = TurnOrder.DEFAULT;
    }
    if (phaseConfig.turn.onBegin === undefined) {
      phaseConfig.turn.onBegin = ({ G }) => G;
    }
    if (phaseConfig.turn.onEnd === undefined) {
      phaseConfig.turn.onEnd = ({ G }) => G;
    }
    if (phaseConfig.turn.endIf === undefined) {
      phaseConfig.turn.endIf = () => false;
    }
    if (phaseConfig.turn.onMove === undefined) {
      phaseConfig.turn.onMove = ({ G }) => G;
    }
    if (phaseConfig.turn.stages === undefined) {
      phaseConfig.turn.stages = {};
    }

    // turns previously treated moveLimit as both minMoves and maxMoves, this behaviour is kept intentionally
    supportDeprecatedMoveLimit(phaseConfig.turn, true);

    for (const stage in phaseConfig.turn.stages) {
      const stageConfig = phaseConfig.turn.stages[stage];
      const moves = stageConfig.moves || {};
      for (const move of Object.keys(moves)) {
        const key = phase + '.' + stage + '.' + move;
        moveMap[key] = moves[move];
        moveNames.add(move);
      }
    }

    phaseConfig.wrapped = {
      onBegin: HookWrapper(phaseConfig.onBegin, GameMethod.PHASE_ON_BEGIN),
      onEnd: HookWrapper(phaseConfig.onEnd, GameMethod.PHASE_ON_END),
      endIf: TriggerWrapper(phaseConfig.endIf),
    };

    phaseConfig.turn.wrapped = {
      onMove: HookWrapper(phaseConfig.turn.onMove, GameMethod.TURN_ON_MOVE),
      onBegin: HookWrapper(phaseConfig.turn.onBegin, GameMethod.TURN_ON_BEGIN),
      onEnd: HookWrapper(phaseConfig.turn.onEnd, GameMethod.TURN_ON_END),
      endIf: TriggerWrapper(phaseConfig.turn.endIf),
    };

    if (typeof phaseConfig.next !== 'function') {
      const { next } = phaseConfig;
      phaseConfig.next = () => next || null;
    }
    phaseConfig.wrapped.next = TriggerWrapper(phaseConfig.next);
  }

  function GetPhase(ctx: { phase: string }): PhaseConfig {
    return ctx.phase ? phaseMap[ctx.phase] : phaseMap[''];
  }

  function OnMove(state: State) {
    return state;
  }

  function Process(
    state: State,
    events: {
      fn: (state: State, opts: any) => State;
      arg?: any;
      turn?: Ctx['turn'];
      phase?: Ctx['phase'];
      automatic?: boolean;
      playerID?: PlayerID;
      force?: boolean;
    }[]
  ): State {
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
      const next = [];
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
      if ([OnMove, UpdateStage, UpdateActivePlayers].includes(fn)) {
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
    const phaseConfig = GetPhase(ctx);

    // Run any phase setup code provided by the user.
    G = phaseConfig.wrapped.onBegin(state);

    next.push({ fn: StartTurn });

    return { ...state, G, ctx };
  }

  function StartTurn(state: State, { currentPlayer }): State {
    let { ctx } = state;
    const phaseConfig = GetPhase(ctx);

    // Initialize the turn order state.
    if (currentPlayer) {
      ctx = { ...ctx, currentPlayer };
      if (phaseConfig.turn.activePlayers) {
        ctx = SetActivePlayers(ctx, phaseConfig.turn.activePlayers);
      }
    } else {
      // This is only called at the beginning of the phase
      // when there is no currentPlayer yet.
      ctx = InitTurnOrderState(state, phaseConfig.turn);
    }

    const turn = ctx.turn + 1;
    ctx = { ...ctx, turn, numMoves: 0, _prevActivePlayers: [] };

    const G = phaseConfig.turn.wrapped.onBegin({ ...state, ctx });

    return { ...state, G, ctx, _undo: [], _redo: [] } as State;
  }

  ////////////
  // Update //
  ////////////

  function UpdatePhase(state: State, { arg, next, phase }): State {
    const phaseConfig = GetPhase({ phase });
    let { ctx } = state;

    if (arg && arg.next) {
      if (arg.next in phaseMap) {
        ctx = { ...ctx, phase: arg.next };
      } else {
        logging.error('invalid phase: ' + arg.next);
        return state;
      }
    } else {
      ctx = { ...ctx, phase: phaseConfig.wrapped.next(state) || null };
    }

    state = { ...state, ctx };

    // Start the new phase.
    next.push({ fn: StartPhase });

    return state;
  }

  function UpdateTurn(state: State, { arg, currentPlayer, next }): State {
    let { G, ctx } = state;
    const phaseConfig = GetPhase(ctx);

    // Update turn order state.
    const { endPhase, ctx: newCtx } = UpdateTurnOrderState(
      state,
      currentPlayer,
      phaseConfig.turn,
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
    if (typeof arg === 'string' || arg === Stage.NULL) {
      arg = { stage: arg };
    }
    if (typeof arg !== 'object') return state;

    // `arg` should be of type `StageArg`, loose typing as `any` here for historic reasons
    // stages previously did not enforce minMoves, this behaviour is kept intentionally
    supportDeprecatedMoveLimit(arg);

    let { ctx } = state;
    let {
      activePlayers,
      _activePlayersMinMoves,
      _activePlayersMaxMoves,
      _activePlayersNumMoves,
    } = ctx;

    // Checking if stage is valid, even Stage.NULL
    if (arg.stage !== undefined) {
      if (activePlayers === null) {
        activePlayers = {};
      }
      activePlayers[playerID] = arg.stage;
      _activePlayersNumMoves[playerID] = 0;

      if (arg.minMoves) {
        if (_activePlayersMinMoves === null) {
          _activePlayersMinMoves = {};
        }
        _activePlayersMinMoves[playerID] = arg.minMoves;
      }

      if (arg.maxMoves) {
        if (_activePlayersMaxMoves === null) {
          _activePlayersMaxMoves = {};
        }
        _activePlayersMaxMoves[playerID] = arg.maxMoves;
      }
    }

    ctx = {
      ...ctx,
      activePlayers,
      _activePlayersMinMoves,
      _activePlayersMaxMoves,
      _activePlayersNumMoves,
    };

    return { ...state, ctx };
  }

  function UpdateActivePlayers(state: State, { arg }): State {
    return { ...state, ctx: SetActivePlayers(state.ctx, arg) };
  }

  ///////////////
  // ShouldEnd //
  ///////////////

  function ShouldEndGame(state: State): boolean {
    return wrapped.endIf(state);
  }

  function ShouldEndPhase(state: State): boolean | void | { next: string } {
    const phaseConfig = GetPhase(state.ctx);
    return phaseConfig.wrapped.endIf(state);
  }

  function ShouldEndTurn(state: State): boolean | void | { next: PlayerID } {
    const phaseConfig = GetPhase(state.ctx);

    // End the turn if the required number of moves has been made.
    const currentPlayerMoves = state.ctx.numMoves || 0;
    if (
      phaseConfig.turn.maxMoves &&
      currentPlayerMoves >= phaseConfig.turn.maxMoves
    ) {
      return true;
    }

    return phaseConfig.turn.wrapped.endIf(state);
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

  function EndPhase(
    state: State,
    { arg, next, turn: initialTurn, automatic }: any
  ): State {
    // End the turn first.
    state = EndTurn(state, { turn: initialTurn, force: true, automatic: true });

    const { phase, turn } = state.ctx;

    if (next) {
      next.push({ fn: UpdatePhase, arg, phase });
    }

    // If we aren't in a phase, there is nothing else to do.
    if (phase === null) {
      return state;
    }

    // Run any cleanup code for the phase that is about to end.
    const phaseConfig = GetPhase(state.ctx);
    const G = phaseConfig.wrapped.onEnd(state);

    // Reset the phase.
    const ctx = { ...state.ctx, phase: null };

    // Add log entry.
    const action = gameEvent('endPhase', arg);
    const { _stateID } = state;
    const logEntry: LogEntry = { action, _stateID, turn, phase };
    if (automatic) logEntry.automatic = true;

    const deltalog = [...(state.deltalog || []), logEntry];

    return { ...state, G, ctx, deltalog };
  }

  function EndTurn(
    state: State,
    { arg, next, turn: initialTurn, force, automatic, playerID }: any
  ): State {
    // This is not the turn that EndTurn was originally
    // called for. The turn was probably ended some other way.
    if (initialTurn !== state.ctx.turn) {
      return state;
    }

    const { currentPlayer, numMoves, phase, turn } = state.ctx;
    const phaseConfig = GetPhase(state.ctx);

    // Prevent ending the turn if minMoves haven't been reached.
    const currentPlayerMoves = numMoves || 0;
    if (
      !force &&
      phaseConfig.turn.minMoves &&
      currentPlayerMoves < phaseConfig.turn.minMoves
    ) {
      logging.info(
        `cannot end turn before making ${phaseConfig.turn.minMoves} moves`
      );
      return state;
    }

    // Run turn-end triggers.
    const G = phaseConfig.turn.wrapped.onEnd(state);

    if (next) {
      next.push({ fn: UpdateTurn, arg, currentPlayer });
    }

    // Reset activePlayers.
    let ctx = { ...state.ctx, activePlayers: null };

    // Remove player from playerOrder
    if (arg && arg.remove) {
      playerID = playerID || currentPlayer;

      const playOrder = ctx.playOrder.filter((i) => i != playerID);

      const playOrderPos =
        ctx.playOrderPos > playOrder.length - 1 ? 0 : ctx.playOrderPos;

      ctx = { ...ctx, playOrder, playOrderPos };

      if (playOrder.length === 0) {
        next.push({ fn: EndPhase, turn, phase });
        return state;
      }
    }

    // Create log entry.
    const action = gameEvent('endTurn', arg);
    const { _stateID } = state;
    const logEntry: LogEntry = { action, _stateID, turn, phase };
    if (automatic) logEntry.automatic = true;

    const deltalog = [...(state.deltalog || []), logEntry];

    return { ...state, G, ctx, deltalog, _undo: [], _redo: [] };
  }

  function EndStage(
    state: State,
    { arg, next, automatic, playerID }: any
  ): State {
    playerID = playerID || state.ctx.currentPlayer;

    let { ctx, _stateID } = state;
    let {
      activePlayers,
      _activePlayersNumMoves,
      _activePlayersMinMoves,
      _activePlayersMaxMoves,
      phase,
      turn,
    } = ctx;

    const playerInStage = activePlayers !== null && playerID in activePlayers;

    const phaseConfig = GetPhase(ctx);

    if (!arg && playerInStage) {
      const stage = phaseConfig.turn.stages[activePlayers[playerID]];
      if (stage && stage.next) {
        arg = stage.next;
      }
    }

    // Checking if arg is a valid stage, even Stage.NULL
    if (next) {
      next.push({ fn: UpdateStage, arg, playerID });
    }

    // If player isn’t in a stage, there is nothing else to do.
    if (!playerInStage) return state;

    // Prevent ending the stage if minMoves haven't been reached.
    const currentPlayerMoves = _activePlayersNumMoves[playerID] || 0;
    if (
      _activePlayersMinMoves &&
      _activePlayersMinMoves[playerID] &&
      currentPlayerMoves < _activePlayersMinMoves[playerID]
    ) {
      logging.info(
        `cannot end stage before making ${_activePlayersMinMoves[playerID]} moves`
      );
      return state;
    }

    // Remove player from activePlayers.
    activePlayers = { ...activePlayers };
    delete activePlayers[playerID];

    if (_activePlayersMinMoves) {
      // Remove player from _activePlayersMinMoves.
      _activePlayersMinMoves = { ..._activePlayersMinMoves };
      delete _activePlayersMinMoves[playerID];
    }

    if (_activePlayersMaxMoves) {
      // Remove player from _activePlayersMaxMoves.
      _activePlayersMaxMoves = { ..._activePlayersMaxMoves };
      delete _activePlayersMaxMoves[playerID];
    }

    ctx = UpdateActivePlayersOnceEmpty({
      ...ctx,
      activePlayers,
      _activePlayersMinMoves,
      _activePlayersMaxMoves,
    });

    // Create log entry.
    const action = gameEvent('endStage', arg);
    const logEntry: LogEntry = { action, _stateID, turn, phase };
    if (automatic) logEntry.automatic = true;

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
    const phaseConfig = GetPhase(ctx);
    const stages = phaseConfig.turn.stages;
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
    } else if (phaseConfig.moves) {
      // Check if moves are defined for the current phase.
      if (name in phaseConfig.moves) {
        return phaseConfig.moves[name];
      }
    } else if (name in moves) {
      // Check for the move globally.
      return moves[name];
    }

    return null;
  }

  function ProcessMove(state: State, action: ActionPayload.MakeMove): State {
    const { playerID, type } = action;
    const { currentPlayer, activePlayers, _activePlayersMaxMoves } = state.ctx;
    const move = GetMove(state.ctx, type, playerID);
    const shouldCount =
      !move || typeof move === 'function' || move.noLimit !== true;

    let { numMoves, _activePlayersNumMoves } = state.ctx;
    if (shouldCount) {
      if (playerID === currentPlayer) numMoves++;
      if (activePlayers) _activePlayersNumMoves[playerID]++;
    }

    state = {
      ...state,
      ctx: {
        ...state.ctx,
        numMoves,
        _activePlayersNumMoves,
      },
    };

    if (
      _activePlayersMaxMoves &&
      _activePlayersNumMoves[playerID] >= _activePlayersMaxMoves[playerID]
    ) {
      state = EndStage(state, { playerID, automatic: true });
    }

    const phaseConfig = GetPhase(state.ctx);
    const G = phaseConfig.turn.wrapped.onMove({ ...state, playerID });
    state = { ...state, G };

    const events = [{ fn: OnMove }];

    return Process(state, events);
  }

  function SetStageEvent(state: State, playerID: PlayerID, arg: any): State {
    return Process(state, [{ fn: EndStage, arg, playerID }]);
  }

  function EndStageEvent(state: State, playerID: PlayerID): State {
    return Process(state, [{ fn: EndStage, playerID }]);
  }

  function SetActivePlayersEvent(
    state: State,
    _playerID: PlayerID,
    arg: ActivePlayersArg
  ): State {
    return Process(state, [{ fn: UpdateActivePlayers, arg }]);
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

  const enabledEventNames = [];

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

  function ProcessEvent(state: State, action: ActionShape.GameEvent): State {
    const { type, playerID, args } = action.payload;
    if (typeof eventHandlers[type] !== 'function') return state;
    return eventHandlers[type](
      state,
      playerID,
      ...(Array.isArray(args) ? args : [args])
    );
  }

  function IsPlayerActive(_G: any, ctx: Ctx, playerID: PlayerID): boolean {
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
      playOrder: [...Array.from({ length: numPlayers })].map((_, i) => i + ''),
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
