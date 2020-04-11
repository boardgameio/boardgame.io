/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { State, Ctx, PlayerID, Game } from '../../types';
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

  constructor(flow: Game['flow'], playerID?: PlayerID) {
    this.flow = flow;
    this.playerID = playerID;
    this.dispatch = [];
  }

  /**
   * Attaches the Events API to ctx.
   * @param {object} ctx - The ctx object to attach to.
   */
  api(ctx: Ctx) {
    const events: EventsAPI & PrivateEventsAPI = {
      _obj: this,
    };
    const { phase, turn } = ctx;

    for (const key of this.flow.eventNames) {
      events[key] = (...args: any[]) => {
        this.dispatch.push({ key, args, phase, turn });
      };
    }

    return events;
  }

  isUsed() {
    return this.dispatch.length > 0;
  }

  /**
   * Updates ctx with the triggered events.
   * @param {object} state - The state object { G, ctx }.
   */
  update(state: State) {
    for (let i = 0; i < this.dispatch.length; i++) {
      const item = this.dispatch[i];

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
