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

const Board = ({ G }) => (
  <div className="secret-state">
    <section>
      <pre>{JSON.stringify(G, null, 2)}</pre>
    </section>
  </div>
);

Board.propTypes = {
  G: PropTypes.any.isRequired,
};

export default Board;
