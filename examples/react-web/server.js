/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { Server, Origins, SocketIO, RedisPubSub } from 'boardgame.io/server';
import TicTacToe from './src/tic-tac-toe/game';
import Chess from './src/chess/game';
import redis from 'redis';

const PORT = process.env.PORT || 8000;
const redisConfig = { host: '192.168.8.50' };
const pubClient = redis.createClient(redisConfig);
const subClient = redis.createClient(redisConfig);
const server = Server({
  games: [TicTacToe, Chess],
  origins: [Origins.LOCALHOST],
  // DELETE BBLOW BEFORE SENDING PR
  transport: new SocketIO({
    pubSub: new RedisPubSub(pubClient, subClient),
  }),
});
server.run(PORT, () => {
  console.log(`Serving at: http://localhost:${PORT}`);
});
