/*
 * Copyright 2020 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { Events } from './events/events';

export default {
  name: 'events',

  noClient: ({ api }) => {
    return api._obj.isUsed();
  },

  flushRaw: ({ state, api }) => {
    return api._obj.update(state);
  },

  api: ({ game, playerID, ctx }) => {
    return new Events(game.flow, playerID).api(ctx);
  },
};
