/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

const rollup = require('rollup');
const config = require('../../rollup.npm.js');

import { Server } from 'boardgame.io/server';
import TicTacToe from './src/tic-tac-toe/game';
import Chess from './src/chess/game';

const watcher = rollup.watch(config.default);

let server = null;
let handle = null;

async function RunServer() {
  const PORT = process.env.PORT || 8000;
  server = Server({ games: [TicTacToe, Chess] });
  handle = await server.run(PORT, () => {
    console.log(`Serving at: http://localhost:${PORT}/`);
  });
}

function KillServer() {
  if (server !== null) {
    server.kill(handle);
  }
}

watcher.on('event', async e => {
  if (e.code == 'END') {
    KillServer();
    await RunServer();
  }

  if (e.code == 'ERROR') {
    console.error(e);
  }
});
