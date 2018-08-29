/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { Game, PlayerView } from 'boardgame.io/core';

const SecretState = Game({
  name: 'secret-state',

  setup: () => ({
    other: {},
    players: {
      0: 'player 0 state',
      1: 'player 1 state',
      2: 'player 2 state',
    },
  }),

  moves: {
    clickCell(G, ctx, secretstuff) {
      // eslint-disable-line no-unused-vars
      return { ...G };
    },
  },

  playerView: PlayerView.STRIP_SECRETS,

  logView: (log, ctx, playerID) => {
    if (log === undefined) {
      return;
    }

    const filteredLog = log.map(logEvent => {
      // filter for all other players and a spectator
      if (
        playerID !== null &&
        +playerID === +logEvent.action.payload.playerID
      ) {
        return log;
      }
      if (
        logEvent.action.payload.args &&
        logEvent.action.payload.args.length === 0
      ) {
        return logEvent;
      }

      const { secret, ...argsWithoutSecret } = logEvent.action.payload.args[0]; // eslint-disable-line no-unused-vars
      const newPayload = {
        ...logEvent.action.payload,
        args: [argsWithoutSecret],
      };
      const newAction = { ...logEvent.action, payload: newPayload };
      return { ...logEvent, action: newAction };
    });

    return filteredLog;
  },
});

export default SecretState;
