/*
 * Copyright 2020 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { Plugin } from '../types';
import { Events, EventsAPI, PrivateEventsAPI } from './events/events';

export { EventsAPI };

const EventsPlugin: Plugin<EventsAPI & PrivateEventsAPI> = {
  name: 'events',

  noClient: ({ api }) => {
    return api._obj.isUsed();
  },

  dangerouslyFlushRawState: ({ state, api }) => {
    return api._obj.update(state);
  },

  api: ({ game, playerID, ctx }) => {
    return new Events(game.flow, playerID).api(ctx);
  },
};

export default EventsPlugin;
