/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { error } from '../core/logger';
import { SocketIO } from './transport/socketio';
import { Local, LocalMaster } from './transport/local';
import { _ClientImpl } from './_client-impl';

export * from './_client-impl';

// The Game Master object (if using a local one).
let localMaster_ = null;

/**
 * Client
 *
 * boardgame.io JS client.
 *
 * @param {...object} game - The return value of `Game`.
 * @param {...object} numPlayers - The number of players.
 * @param {...object} multiplayer - Set to true or { server: '<host>:<port>' }
 *                                  to make a multiplayer client. The second
 *                                  syntax specifies a non-default socket server.
 * @param {...object} socketOpts - Options to pass to socket.io.
 * @param {...object} gameID - The gameID that you want to connect to.
 * @param {...object} playerID - The playerID associated with this client.
 * @param {...string} credentials - The authentication credentials associated with this client.
 *
 * Returns:
 *   A JS object that provides an API to interact with the
 *   game by dispatching moves and events.
 */
export function Client(opts) {
  let multiplayer = opts.multiplayer;

  let transportFactory = false;
  if (multiplayer !== undefined) {
    if (typeof multiplayer !== 'function') {
      if (multiplayer === true) {
        multiplayer = { server: '' };
      }

      if (multiplayer.local === true) {
        transportFactory = transportOpts => {
          if (
            localMaster_ === null ||
            localMaster_.config !== transportOpts.gameMeta
          ) {
            localMaster_ = new LocalMaster(transportOpts.game);
            localMaster_.config = transportOpts.gameMeta;
          }

          return new Local({ master: localMaster_, ...transportOpts });
        };
      } else if (multiplayer.server !== undefined) {
        transportFactory = transportOpts =>
          new SocketIO({
            server: multiplayer.server,
            socketOpts: opts.socketOpts,
            ...transportOpts,
          });
      } else if (multiplayer.transport !== undefined) {
        transportFactory = transportOpts =>
          new multiplayer.transport(transportOpts);
      } else {
        error('invalid multiplayer spec');
      }

      opts.multiplayer = transportFactory;
    }
  }

  return new _ClientImpl(opts);
}
