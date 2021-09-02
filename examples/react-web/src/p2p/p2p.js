/*
 * Copyright 2021 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React, { useState, useEffect } from 'react';
import { Client } from 'boardgame.io/react';
import { P2P } from 'boardgame.io/multiplayer';
import { nanoid } from 'nanoid';
import TicTacToe from '../tic-tac-toe/game';
import Board from '../tic-tac-toe/board';
import { Configurator } from './configurator';

const View = () => {
  const [matchID, setMatchID] = useState(() => nanoid());
  const [playerID, setPlayerID] = useState('0');
  const [isHost, setIsHost] = useState(false);
  const [showClient, setShowClient] = useState(false);
  const [GameView, setGameView] = useState(null);
  const onSubmit = () => setShowClient(true);

  useEffect(() => {
    if (showClient) {
      setGameView(() =>
        Client({
          game: TicTacToe,
          board: Board,
          multiplayer: P2P({ isHost }),
        })
      );
    } else {
      setGameView(null);
    }
  }, [showClient, isHost]);

  if (!GameView) {
    return (
      <Configurator
        {...{
          matchID,
          setMatchID,
          playerID,
          setPlayerID,
          isHost,
          setIsHost,
          onSubmit,
        }}
      />
    );
  }

  return (
    <div>
      <GameView {...{ playerID, matchID }} />
      <p>
        <code>
          &lt;Client matchID="{matchID}" playerID="{playerID}" /&gt;
        </code>
      </p>
      {isHost && <p>This is the match host.</p>}
      <p>
        <button onClick={() => setShowClient(false)}>Back</button>
      </p>
    </div>
  );
};

const App = () => {
  return (
    <div>
      <h1>Peer-to-Peer</h1>
      <View />
    </div>
  );
};

export default App;
