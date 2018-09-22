/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import KoaWebpack from 'koa-webpack';

import WebpackConfig from './webpack.dev.js';
import { Server } from 'boardgame.io/server';
import TicTacToe from './modules/tic-tac-toe/game';
import Chess from './modules/chess/game';

const PORT = process.env.PORT || 8000;

const server = Server({ games: [TicTacToe, Chess] });

server.app.use(
  KoaWebpack({
    config: WebpackConfig,
  })
);

server.run(PORT, () => {
  console.log(`Serving at: http://localhost:${PORT}/`);
});
