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
import request from 'superagent';

import WebpackConfig from './webpack.dev.js';
import { Server } from 'boardgame.io/server';
import TicTacToe from './modules/tic-tac-toe/game';
import Chess from './modules/chess/game';
import TurnExample from './modules/turnorder/game';

const PORT = process.env.PORT || 8000;
const DEV = process.env.NODE_ENV === 'development';
const PROD = !DEV;

const server = Server({ games: [TicTacToe, Chess, TurnExample] });

if (DEV) {
  server.app.use(
    KoaWebpack({
      config: WebpackConfig,
    })
  );
}

if (PROD) {
  server.app.use(KoaStatic(path.join(__dirname, 'dist')));
  server.app.use(KoaHelmet());
}

server.run(PORT, async () => {
  console.log(`Serving at: http://localhost:${PORT}/`);

  const newGame = await request
    .post(`http://localhost:${PORT + 1}/games/tic-tac-toe/create`)
    .send({ numPlayers: 2 });

  console.log(`Created authenticated gameID: ${newGame.body.gameID}`);

  const playerZero = await request
    .patch(
      `http://localhost:${PORT + 1}/game_instances/${newGame.body.gameID}/join`
    )
    .send({
      gameName: 'tic-tac-toe',
      playerID: 0,
      playerName: 'zero',
    });

  console.log(`Player 0 credentials: ${playerZero.body.playerCredentials}`);

  const playerOne = await request
    .patch(
      `http://localhost:${PORT + 1}/game_instances/${newGame.body.gameID}/join`
    )
    .send({
      gameName: 'tic-tac-toe',
      playerID: 1,
      playerName: 'one',
    });

  console.log(`Player 1 credentials: ${playerOne.body.playerCredentials}`);
});
