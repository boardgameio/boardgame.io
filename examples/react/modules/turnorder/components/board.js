/*
 * Copyright 2018 The boardgame.io Authors.
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import PropTypes from 'prop-types';

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

export default Board;
