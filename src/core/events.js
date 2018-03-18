/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { gameEvent } from './action-creators';

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
   * Updates
   */
  update(state) {
    for (const item of this.dispatch) {
      const action = gameEvent(item.key, item.args, this.playerID);
      state = this.flow.processGameEvent(state, action.payload);
    }
    return state;
  }
}

/**
 * Class method version of the above.
 */
Events.detach = ctx => {
  const { events, ...rest } = ctx; // eslint-disable-line no-unused-vars
  return rest;
};
