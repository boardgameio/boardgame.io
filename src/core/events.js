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

    for (const key of this.flow.eventNames) {
      events[key] = (...args) => {
        this.dispatch.push({ key, args });
      };
    }

    return { ...ctx, events };
  }

  /**
   * Updates ctx with the triggered events.
   * @param {object} state - The state object { G, ctx }.
   */
  update(state) {
    for (const item of this.dispatch) {
      const action = automaticGameEvent(item.key, item.args, this.playerID);
      state = {
        ...state,
        ...this.flow.processGameEvent(state, action),
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
