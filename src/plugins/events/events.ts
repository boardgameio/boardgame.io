/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import type { State, Ctx, PlayerID, Game } from '../../types';
import { automaticGameEvent } from '../../core/action-creators';

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
    storeMetadata(ctx: Ctx): void;
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
    key: string;
    args: any[];
    phase: string;
    turn: number;
  }>;
  currentPhase: string;
  currentTurn: number;

  constructor(flow: Game['flow'], ctx: Ctx, playerID?: PlayerID) {
    this.flow = flow;
    this.playerID = playerID;
    this.dispatch = [];
    this.storeMetadata(ctx);
  }

  api() {
    const events: EventsAPI & PrivateEventsAPI = {
      _obj: this,
    };
    for (const key of this.flow.eventNames) {
      events[key] = (...args: any[]) => {
        this.dispatch.push({
          key,
          args,
          phase: this.currentPhase,
          turn: this.currentTurn,
        });
      };
    }

    return events;
  }

  isUsed() {
    return this.dispatch.length > 0;
  }

  storeMetadata(ctx: Ctx) {
    this.currentPhase = ctx.phase;
    this.currentTurn = ctx.turn;
  }

  /**
   * Updates ctx with the triggered events.
   * @param {object} state - The state object { G, ctx }.
   */
  update(state: State) {
    for (let i = 0; i < this.dispatch.length; i++) {
      const item = this.dispatch[i];

      // If the turn already ended,
      // don't try to process stage events.
      if (
        (item.key === 'endStage' ||
          item.key === 'setStage' ||
          item.key === 'setActivePlayers') &&
        item.turn !== state.ctx.turn
      ) {
        continue;
      }

      // If the turn already ended some other way,
      // don't try to end the turn again.
      if (item.key === 'endTurn' && item.turn !== state.ctx.turn) {
        continue;
      }

      // If the phase already ended some other way,
      // don't try to end the phase again.
      if (
        (item.key === 'endPhase' || item.key === 'setPhase') &&
        item.phase !== state.ctx.phase
      ) {
        continue;
      }

      const action = automaticGameEvent(item.key, item.args, this.playerID);

      state = {
        ...state,
        ...this.flow.processEvent(state, action),
      };
    }
    return state;
  }
}
