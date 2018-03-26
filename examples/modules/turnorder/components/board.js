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

  let currentPlayer =
    playerID === ctx.currentPlayer ? (
      <div style={{ color: 'red' }}>CurrentPlayer</div>
    ) : (
      <div style={{ color: 'lightgray' }}>CurrentPlayer</div>
    );
  let actionPlayer = ctx.actionPlayers.includes(playerID) ? (
    <div style={{ color: 'red' }}>ActionPlayer</div>
  ) : (
    <div style={{ color: 'lightgray' }}>ActionPlayer</div>
  );
  if (playerID === null) {
    currentPlayer = actionPlayer = undefined;
  }

  const deepEquals = (a, b) => JSON.stringify(a) === JSON.stringify(b);

  const buttons = (
    <div>
      <button
        {...{
          disabled:
            playerID !== ctx.currentPlayer ||
            !deepEquals(ctx.actionPlayers, [ctx.currentPlayer]),
        }}
        onClick={() => events.endTurn()}
      >
        endTurn
      </button>
      <button
        {...{
          disabled:
            !ctx.actionPlayers.includes(playerID) ||
            playerID === ctx.currentPlayer,
        }}
        onClick={() => {
          let ap = ctx.actionPlayers.filter(nr => nr !== playerID);
          events.changeActionPlayers(ap);
        }}
      >
        Drop Cards
      </button>
      <button
        {...{
          disabled:
            ctx.currentPlayer !== playerID ||
            !deepEquals(ctx.actionPlayers, [ctx.currentPlayer]) ||
            playerData.actions === 0,
        }}
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
        {playerData.name}, Actions: {playerData.actions}
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
