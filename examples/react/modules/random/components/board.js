/*
 * Copyright 2018 The boardgame.io Authors.
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import PropTypes from 'prop-types';

const Board = ({ G, moves }) => (
  <div>
    <pre>{JSON.stringify(G, null, 2)}</pre>
    <button onClick={() => moves.shuffle()}>shuffle</button>
    <button onClick={() => moves.rollD6()}>roll</button>
  </div>
);

Board.propTypes = {
  G: PropTypes.any.isRequired,
  moves: PropTypes.any.isRequired,
};

export default Board;
