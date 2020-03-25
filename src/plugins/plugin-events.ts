/*
 * Copyright 2020 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { Events } from './events/events';

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
