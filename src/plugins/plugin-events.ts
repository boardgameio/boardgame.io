/*
 * Copyright 2020 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import type { Plugin } from '../types';
import type { PrivateEventsAPI, EventsAPI } from './events/events';
import { Events } from './events/events';

export type { EventsAPI };

const EventsPlugin: Plugin<EventsAPI & PrivateEventsAPI> = {
  name: 'events',

  noClient: ({ api }) => api._obj.isUsed(),

  isInvalid: ({ data }) => data.error || false,

  // Update the events plugin’s internal turn context each time a move
  // or hook is called. This allows events called after turn or phase
  // endings to dispatch the current turn and phase correctly.
  fnWrap:
    (fn) =>
    (G, ctx, ...args) => {
      const api = ctx.events as PrivateEventsAPI;
      if (api) api._obj.updateTurnContext(ctx);
      G = fn(G, ctx, ...args);
      return G;
    },

  dangerouslyFlushRawState: ({ state, api }) => api._obj.update(state),

  api: ({ game, ctx, playerID }) => new Events(game.flow, ctx, playerID).api(),
};

export default EventsPlugin;
