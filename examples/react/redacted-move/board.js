/*
 * Copyright 2017 The boardgame.io Authors.
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import PropTypes from 'prop-types';
import './board.css';

const Board = ({ G, ctx, moves, playerID, log }) => (
  <div className="secret-state">
    <section>
      Game
      <pre>{JSON.stringify(G, null, 2)}</pre>
      Action.Payload.Args
      <pre>{JSON.stringify(log.map(l => l.action.payload.args), null, 2)}</pre>
      {playerID && (
        <button
          onClick={() =>
            moves.clickCell({ secret: G.players[ctx.currentPlayer] })
          }
        >
          Click Cell
        </button>
      )}
    </section>
  </div>
);

Board.propTypes = {
  G: PropTypes.any.isRequired,
  ctx: PropTypes.any.isRequired,
  moves: PropTypes.any.isRequired,
  playerID: PropTypes.any,
  log: PropTypes.any,
};

export default Board;
