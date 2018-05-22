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

  const gameName = 'tic-tac-toe';

  const newGame = await request
    .post(`http://localhost:${PORT + 1}/games/${gameName}/create`)
    .send({ numPlayers: 2 });

  const gameID = newGame.body.gameID;
  console.log(`Created authenticated gameID: ${gameID}`);

  for (let playerID of [0, 1]) {
    const player = await request
      .patch(`http://localhost:${PORT + 1}/game_instances/${gameID}/join`)
      .send({
        gameName,
        playerID,
        playerName: playerID.toString(),
      });

    console.log(
      `Player ${playerID} credentials: ${player.body.playerCredentials}`
    );
  }
});
