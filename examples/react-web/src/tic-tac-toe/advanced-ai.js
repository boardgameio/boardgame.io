/*
 * Copyright 2017 The boardgame.io Authors.
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React, { useEffect, useState } from 'react';
import { Client as PlainJSClient } from 'boardgame.io/client';
import { Client } from 'boardgame.io/react';
import { Local } from 'boardgame.io/multiplayer';
import { MCTSBot, Step } from 'boardgame.io/ai';
import TicTacToe from './game';
import Board from './board';

const App = Client({
  game: TicTacToe,
  board: Board,
  debug: false,
  // Use Local transport for communication with bots.
  multiplayer: Local(),
});

/**
 * Component that controls and runs a custom bot instance.
 */
const BotControls = ({ playerID, matchID }) => {
  const difficulties = {
    easy: {
      iterations: 1,
      playoutDepth: 1,
    },
    hard: {
      iterations: 1000,
      playoutDepth: 50,
    },
  };
  const [difficulty, setDifficulty] = useState('easy');
  const [client, setClient] = useState();

  // Create a plain Javascript boardgame.io client on mount.
  useEffect(() => {
    const newClient = PlainJSClient({
      game: TicTacToe,
      debug: false,
      multiplayer: Local(),
      matchID,
      playerID,
    });
    newClient.start();
    setClient(newClient);
    // Clean up client on unmount.
    return () => newClient.stop();
  }, []);

  // Update the client subscription when bot difficulty changes.
  useEffect(() => {
    if (!client) return;
    // Subscribe to the client with a function that will run AI on a bot
    // player’s turn.
    return client.subscribe(state => {
      if (!state) return;
      if (state.ctx.currentPlayer === playerID) {
        const { iterations, playoutDepth } = difficulties[difficulty];
        const bot = new MCTSBot({
          game: TicTacToe,
          enumerate: TicTacToe.ai.enumerate,
          iterations,
          playoutDepth,
        });
        // Delay AI stepping by a tick to allow React to render before the
        // main thread gets blocked by AI iterations.
        setTimeout(() => Step(client, bot), 0);
      }
    });
  }, [client, difficulty]);

  // Render AI difficulty toggle buttons.
  return (
    <p>
      AI Difficulty:{' '}
      <button
        onClick={() => setDifficulty('easy')}
        disabled={difficulty === 'easy'}
      >
        Easy
      </button>
      <button
        onClick={() => setDifficulty('hard')}
        disabled={difficulty === 'hard'}
      >
        Hard
      </button>
    </p>
  );
};

const AdvancedAI = () => {
  return (
    <div>
      <h1>Advanced AI</h1>
      <p className="warn">
        This example shows how to use a custom bot instance to play against a
        local player.
        <br />
        In the future, this will be made much simpler!
      </p>
      <App playerID="0" matchID="advanced-ai" />
      <BotControls playerID="1" matchID="advanced-ai" />
    </div>
  );
};

export default AdvancedAI;
