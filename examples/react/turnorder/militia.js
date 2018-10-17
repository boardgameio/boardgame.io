/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Client } from 'boardgame.io/react';
import { Game } from 'boardgame.io/core';
import './militia.css';

const Spectator = ({ ctx }) => (
  <table>
    <tbody>
      <tr>
        <td>currentPlayer</td>
        <td>
          <pre>{JSON.stringify(ctx.currentPlayer)}</pre>
        </td>
      </tr>
      <tr>
        <td>PlayOrder</td>
        <td>
          <pre>{JSON.stringify(ctx.playOrder)}</pre>
        </td>
      </tr>
      <tr>
        <td>actionPlayers</td>
        <td>
          <pre>{JSON.stringify(ctx.actionPlayers)}</pre>
        </td>
      </tr>
    </tbody>
  </table>
);

Spectator.propTypes = {
  ctx: PropTypes.any,
};

const Board = ({ ctx, G, playerID, events, moves }) => {
  const playerData = G.players[playerID];

  if (playerID === null) {
    return <Spectator {...{ ctx }} />;
  }

  const currentPlayer = playerID === ctx.currentPlayer && (
    <div className="badge">CurrentPlayer</div>
  );

  const actionPlayer = ctx.actionPlayers.includes(playerID) && (
    <div className="badge">ActionPlayer</div>
  );

  const deepEquals = (a, b) => JSON.stringify(a) === JSON.stringify(b);

  const canEndTurn =
    deepEquals(ctx.actionPlayers, [playerID]) && playerID === ctx.currentPlayer;
  const canDrop =
    ctx.actionPlayers.includes(playerID) && ctx.currentPlayer != playerID;
  const canPlay = canEndTurn && playerData.actions > 0;

  const buttons = (
    <div>
      <button disabled={!canEndTurn} onClick={() => events.endTurn()}>
        endTurn
      </button>

      <button
        disabled={!canDrop}
        onClick={() => {
          moves.dropCards();
        }}
      >
        Drop Cards
      </button>

      <button
        disabled={!canPlay}
        onClick={() => {
          moves.playMilitia();
        }}
      >
        Play Militia
      </button>
    </div>
  );

  return (
    <div>
      <span>
        <div>{playerData.name}</div>
        <div>Actions: {playerData.actions}</div>
        <div>Cards: {playerData.cards}</div>
      </span>
      {buttons}
      {currentPlayer}
      {actionPlayer}
    </div>
  );
};

Board.propTypes = {
  ctx: PropTypes.any,
  events: PropTypes.any,
  moves: PropTypes.any,
  G: PropTypes.any,
  playerID: PropTypes.any,
};

const TurnExample = Game({
  name: 'turnorder',

  setup: () => ({
    players: [
      {
        name: 'Player 1',
        cards: 5,
        actions: 0,
      },
      {
        name: 'Player 2',
        cards: 5,
        actions: 0,
      },
      {
        name: 'Player 3',
        cards: 5,
        actions: 0,
      },
    ],
  }),

  moves: {
    playMilitia: (G, ctx) => {
      ctx.events.setActionPlayers({ once: true, allOthers: true });

      const currentPlayer = ctx.currentPlayer;
      const playersNext = [...G.players];
      playersNext[currentPlayer] = { ...G.players[currentPlayer], actions: 0 };

      const nextG = { players: playersNext };
      return nextG;
    },

    dropCards: (G, ctx) => {
      const newPlayer = { ...G.players[+ctx.playerID], cards: 3 };
      // TODO functional approach to replace element from array?
      const newPlayers = [...G.players];
      newPlayers[+ctx.playerID] = newPlayer;

      return { ...G, players: newPlayers };
    },
  },

  flow: {
    setActionPlayers: true,

    onTurnBegin: (G, ctx) => {
      const currentPlayer = ctx.currentPlayer;
      const playersNext = [...G.players];
      playersNext[currentPlayer] = { ...G.players[currentPlayer], actions: 1 };
      return { players: playersNext };
    },
  },
});

const App = Client({
  game: TurnExample,
  numPlayers: 3,
  board: Board,
  multiplayer: { local: true },
});

const Multiplayer = () => (
  <div id="turn-order">
    <div style={{ padding: 50 }}>
      <p>
        The following example demonstrates how to use
        <strong> setActionPlayers </strong>
        to allow multiple players to play in a single turn.
      </p>

      <p>
        Click on <strong> Play Militia</strong>, and the other players will have
        to each click on <strong> Drop Cards </strong> before the current player
        can end their turn.
      </p>

      <App gameID="TurnExample" />

      <div className="runner-vert">
        <div className="run">
          <App gameID="TurnExample" playerID="0" />
        </div>
        <div className="run">
          <App gameID="TurnExample" playerID="1" />
        </div>
        <div className="run">
          <App gameID="TurnExample" playerID="2" />
        </div>
      </div>
    </div>
  </div>
);

export default Multiplayer;
