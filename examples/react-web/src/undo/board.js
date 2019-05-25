/*
 * Copyright 2018 The boardgame.io Authors.
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import PropTypes from 'prop-types';

const Board = ({ playerID, G, ctx, moves, events, undo, redo }) => (
  <div style={{ opacity: playerID == ctx.currentPlayer ? 1 : 0.5 }}>
    <h3>Player {playerID}</h3>
    <pre>{JSON.stringify(G, null, 2)}</pre>
    <button onClick={() => moves.A()}>A</button>
    <button onClick={() => moves.B()}>B</button>
    <button onClick={() => undo()}>undo</button>
    <button onClick={() => redo()}>redo</button>
    <button onClick={() => events.endTurn()}>end turn</button>
  </div>
);

Board.propTypes = {
  playerID: PropTypes.any.isRequired,
  G: PropTypes.any.isRequired,
  ctx: PropTypes.any.isRequired,
  moves: PropTypes.any.isRequired,
  undo: PropTypes.any.isRequired,
  redo: PropTypes.any.isRequired,
  events: PropTypes.any.isRequired,
};

export default Board;
