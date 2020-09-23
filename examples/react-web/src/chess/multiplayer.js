/*
 * Copyright 2018 The boardgame.io Authors.
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import { Client } from 'boardgame.io/react';
import { SocketIO } from 'boardgame.io/multiplayer';
import ChessGame from './game';
import ChessBoard from './board';

const hostname = window.location.hostname;
const App = Client({
  game: ChessGame,
  board: ChessBoard,
  multiplayer: SocketIO({ server: `${hostname}:8000` }),
  debug: true,
});

const Multiplayer = playerID => () => (
  <div style={{ padding: 50 }}>
    <App matchID="multi" playerID={playerID} />
    PlayerID: {playerID}
  </div>
);

export default Multiplayer;
