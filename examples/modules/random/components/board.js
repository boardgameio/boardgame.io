/*
 * Copyright 2018 The boardgame.io Authors.
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import PropTypes from 'prop-types';

const Board = ({ G }) => <pre>{JSON.stringify(G, null, 2)}</pre>;

Board.propTypes = {
  G: PropTypes.any.isRequired,
};

export default Board;
