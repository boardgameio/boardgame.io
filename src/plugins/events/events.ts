/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import type { State, Ctx, PlayerID, Game } from '../../types';
import { automaticGameEvent } from '../../core/action-creators';
import { GameMethod } from '../../core/game-methods';

const enum Errors {
  CalledOutsideHook = 'Events must be called from moves or the `onBegin`, `onEnd`, and `onMove` hooks.\n' +
    'This error probably means you called an event from other game code, like an `endIf` trigger or one of the `turn.order` methods.',

  EndTurnInOnEnd = '`endTurn` is disallowed in `onEnd` hooks — the turn is already ending.',

  MaxTurnEndings = 'Maximum number of turn endings exceeded for this update.\n' +
    'This likely means game code is triggering an infinite loop.',

  PhaseEventInOnEnd = '`setPhase` & `endPhase` are disallowed in a phase’s `onEnd` hook — the phase is already ending.\n' +
    'If you’re trying to dynamically choose the next phase when a phase ends, use the phase’s `next` trigger.',

  StageEventInOnEnd = '`setStage`, `endStage` & `setActivePlayers` are disallowed in `onEnd` hooks.',

  StageEventInPhaseBegin = '`setStage`, `endStage` & `setActivePlayers` are disallowed in a phase’s `onBegin` hook.\n' +
    'Use `setActivePlayers` in a `turn.onBegin` hook or declare stages with `turn.activePlayers` instead.',

  StageEventInTurnBegin = '`setStage` & `endStage` are disallowed in `turn.onBegin`.\n' +
    'Use `setActivePlayers` or declare stages with `turn.activePlayers` instead.',
}

export interface EventsAPI {
  endGame?(...args: any[]): void;
  endPhase?(...args: any[]): void;
  endStage?(...args: any[]): void;
  endTurn?(...args: any[]): void;
  pass?(...args: any[]): void;
  setActivePlayers?(...args: any[]): void;
  setPhase?(...args: any[]): void;
  setStage?(...args: any[]): void;
}

export interface PrivateEventsAPI {
  _obj: {
    isUsed(): boolean;
    updateTurnContext(ctx: Ctx, methodType: GameMethod | undefined): void;
    unsetCurrentMethod(): void;
    update(state: State): State;
  };
}

/**
 * Events
 */
export class Events {
  flow: Game['flow'];
  playerID: PlayerID | undefined;
  dispatch: Array<{
    type: string;
    args: any[];
    phase: string;
    turn: number;
    calledFrom: GameMethod | undefined;
  }>;
  maxEndedTurnsPerAction: number;
  initialTurn: number;
  currentPhase: string;
  currentTurn: number;
  currentMethod?: GameMethod;

  constructor(flow: Game['flow'], ctx: Ctx, playerID?: PlayerID) {
    this.flow = flow;
    this.playerID = playerID;
    this.dispatch = [];
    this.initialTurn = ctx.turn;
    this.updateTurnContext(ctx, undefined);
    // This is an arbitrarily large upper threshold, which could be made
    // configurable via a game option if the need arises.
    this.maxEndedTurnsPerAction = ctx.numPlayers * 100;
  }

  api() {
    const events: EventsAPI & PrivateEventsAPI = {
      _obj: this,
    };
    for (const type of this.flow.eventNames) {
      events[type] = (...args: any[]) => {
        this.dispatch.push({
          type,
          args,
          phase: this.currentPhase,
          turn: this.currentTurn,
          calledFrom: this.currentMethod,
        });
      };
    }

    return events;
  }

  isUsed() {
    return this.dispatch.length > 0;
  }

  updateTurnContext(ctx: Ctx, methodType: GameMethod | undefined) {
    this.currentPhase = ctx.phase;
    this.currentTurn = ctx.turn;
    this.currentMethod = methodType;
  }

  unsetCurrentMethod() {
    this.currentMethod = undefined;
  }

  /**
   * Updates ctx with the triggered events.
   * @param {object} state - The state object { G, ctx }.
   */
  update(state: State): State {
    const initialState = state;
    const stateWithError = (error: Errors) => ({
      ...initialState,
      plugins: {
        ...initialState.plugins,
        events: {
          ...initialState.plugins.events,
          data: { error },
        },
      },
    });

    EventQueue: for (let i = 0; i < this.dispatch.length; i++) {
      const event = this.dispatch[i];
      const turnHasEnded = event.turn !== state.ctx.turn;

      // This protects against potential infinite loops if specific events are called on hooks.
      // The moment we exceed the defined threshold, we just bail out of all phases.
      const endedTurns = this.currentTurn - this.initialTurn;
      if (endedTurns >= this.maxEndedTurnsPerAction) {
        return stateWithError(Errors.MaxTurnEndings);
      }

      if (event.calledFrom === undefined) {
        return stateWithError(Errors.CalledOutsideHook);
      }

      switch (event.type) {
        case 'endStage':
        case 'setStage':
        case 'setActivePlayers': {
          switch (event.calledFrom) {
            // Disallow all stage events in onEnd and phase.onBegin hooks.
            case GameMethod.TURN_ON_END:
            case GameMethod.PHASE_ON_END:
              return stateWithError(Errors.StageEventInOnEnd);
            case GameMethod.PHASE_ON_BEGIN:
              return stateWithError(Errors.StageEventInPhaseBegin);
            // Disallow setStage & endStage in turn.onBegin hooks.
            case GameMethod.TURN_ON_BEGIN:
              if (event.type === 'setActivePlayers') break;
              return stateWithError(Errors.StageEventInTurnBegin);
          }

          // If the turn already ended, don't try to process stage events.
          if (turnHasEnded) continue EventQueue;
          break;
        }

        case 'endTurn': {
          if (
            event.calledFrom === GameMethod.TURN_ON_END ||
            event.calledFrom === GameMethod.PHASE_ON_END
          ) {
            return stateWithError(Errors.EndTurnInOnEnd);
          }

          // If the turn already ended some other way,
          // don't try to end the turn again.
          if (turnHasEnded) continue EventQueue;
          break;
        }

        case 'endPhase':
        case 'setPhase': {
          if (event.calledFrom === GameMethod.PHASE_ON_END) {
            return stateWithError(Errors.PhaseEventInOnEnd);
          }

          // If the phase already ended some other way,
          // don't try to end the phase again.
          if (event.phase !== state.ctx.phase) continue EventQueue;
          break;
        }
      }

      const action = automaticGameEvent(event.type, event.args, this.playerID);
      state = this.flow.processEvent(state, action);
    }
    return state;
  }
}
