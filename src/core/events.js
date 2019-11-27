/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { automaticGameEvent } from './action-creators';

/**
 * Events
 */
export class Events {
  constructor(flow, playerID) {
    this.flow = flow;
    this.playerID = playerID;
    this.dispatch = [];
  }

  /**
   * Attaches the Events API to ctx.
   * @param {object} ctx - The ctx object to attach to.
   */
  attach(ctx) {
    const events = {};
    const { phase, turn } = ctx;

    for (const key of this.flow.eventNames) {
      events[key] = (...args) => {
        this.dispatch.push({ key, args, phase, turn });
      };
    }

    return { ...ctx, events };
  }

  /**
   * Updates ctx with the triggered events.
   * @param {object} state - The state object { G, ctx }.
   */
  update(state) {
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

/**
 * Detaches the Events API from ctx.
 * @param {object} ctx - The ctx object to strip.
 */
Events.detach = ctx => {
  const { events, ...rest } = ctx; // eslint-disable-line no-unused-vars
  return rest;
};
