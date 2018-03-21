/*
 * Copyright 2018 The boardgame.io Authors.
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import PropTypes from 'prop-types';

const Board = ({ ctx, events, playerID }) => {
  const spectatorPlayer =
    playerID === null ? (
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
    ) : (
      <span />
    );

  const buttons =
    playerID !== null ? (
      <div>
        <button
          {...{ disabled: !ctx.actionPlayers.includes(playerID) }}
          onClick={() => events.endTurn()}
        >
          endTurn
        </button>
        <button
          {...{ disabled: !ctx.actionPlayers.includes(playerID) }}
          onClick={() => {
            document.events.changeActionPlayers(['2', '1', '0']);
          }}
        >
          set action players
        </button>
      </div>
    ) : (
      ''
    );

  return (
    <div>
      {spectatorPlayer}
      {buttons}
    </div>
  );
};

Board.propTypes = {
  ctx: PropTypes.any,
  events: PropTypes.any,
  playerID: PropTypes.any,
};

export default Board;
