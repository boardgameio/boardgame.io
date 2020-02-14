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
      <strong>G</strong>
      <pre>{JSON.stringify(G, null, 2)}</pre>

      <strong>log</strong>
      <pre>{JSON.stringify(log, null, 2)}</pre>
      {playerID && (
        <button
          onClick={() => moves.clickCell({ secret: G.players[playerID] })}
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
