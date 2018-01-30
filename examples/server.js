/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import path from 'path';
import KoaStatic from 'koa-static';
import KoaHelmet from 'koa-helmet';
import KoaWebpack from 'koa-webpack';
import WebpackConfig from './webpack.dev.js';
import Server from 'boardgame.io/server';
import TicTacToe from './modules/tic-tac-toe/game';
import Chess from './modules/chess/game';

const PORT = process.env.PORT || 8000;
const DEV = process.env.NODE_ENV === 'development';
const PROD = !DEV;

const app = Server({ games: [TicTacToe, Chess] });

if (DEV) {
  app.use(
    KoaWebpack({
      config: WebpackConfig,
    })
  );
}

if (PROD) {
  app.use(KoaStatic(path.join(__dirname, 'dist')));
  app.use(KoaHelmet());
}

app.listen(PORT, () => {
  console.log(`Serving at: http://localhost:${PORT}/`);
});
