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
import type { GameMethodNames } from '../../core/game-methods';

const enum Errors {
  CalledOutsideHook = 'Events must be called from moves or the `onBegin`, `onEnd`, and `onMove` hooks.\n' +
    'This error probably means you called an event from other game code, like an `endIf` trigger or one of the `turn.order` methods.',
  MaxTurnEndings = 'Maximum number of turn endings exceeded for this update.\n' +
    'This likely means game code is triggering an infinite loop.',
  StageEventInPhaseBegin = '`setStage`, `endStage` & `setActivePlayers` are disallowed in a phase’s `onBegin` hook.\n' +
    'Use the `turn.onBegin` hook or declare stages with `turn.activePlayers` instead.',
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
    updateTurnContext(ctx: Ctx, methodType: GameMethodNames | undefined): void;
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
    calledFrom: GameMethodNames | undefined;
  }>;
  maxEndedTurnsPerAction: number;
  initialTurn: number;
  currentPhase: string;
  currentTurn: number;
  currentMethod?: GameMethodNames;

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

  updateTurnContext(ctx: Ctx, methodType: GameMethodNames | undefined) {
    this.currentPhase = ctx.phase;
    this.currentTurn = ctx.turn;
    this.currentMethod = methodType;
  }

  unsetCurrentMethod() {
    this.currentMethod = undefined;
  }

  stateWithError(state: State, error: Errors): State {
    return {
      ...state,
      plugins: {
        ...state.plugins,
        events: {
          ...state.plugins.events,
          data: { error },
        },
      },
    };
  }

  /**
   * Updates ctx with the triggered events.
   * @param {object} state - The state object { G, ctx }.
   */
  update(state: State): State {
    const initialState = state;
    for (let i = 0; i < this.dispatch.length; i++) {
      const endedTurns = this.currentTurn - this.initialTurn;
      // This protects against potential infinite loops if specific events are called on hooks.
      // The moment we exceed the defined threshold, we just bail out of all phases.
      if (endedTurns >= this.maxEndedTurnsPerAction) {
        return this.stateWithError(initialState, Errors.MaxTurnEndings);
      }

      const event = this.dispatch[i];

      if (!event.calledFrom) {
        return this.stateWithError(initialState, Errors.CalledOutsideHook);
      }

      if (['endStage', 'setStage', 'setActivePlayers'].includes(event.type)) {
        // Disallow stage events in phase.onBegin hooks.
        if (event.calledFrom === GameMethod.Phase.ON_BEGIN) {
          return this.stateWithError(
            initialState,
            Errors.StageEventInPhaseBegin
          );
        }
        // If the turn already ended, don't try to process stage events.
        if (event.turn !== state.ctx.turn) {
          continue;
        }
      }

      // If the turn already ended some other way,
      // don't try to end the turn again.
      if (event.type === 'endTurn' && event.turn !== state.ctx.turn) {
        continue;
      }

      // If the phase already ended some other way,
      // don't try to end the phase again.
      if (
        (event.type === 'endPhase' || event.type === 'setPhase') &&
        event.phase !== state.ctx.phase
      ) {
        continue;
      }

      const action = automaticGameEvent(event.type, event.args, this.playerID);

      state = {
        ...state,
        ...this.flow.processEvent(state, action),
      };
    }
    return state;
  }
}
