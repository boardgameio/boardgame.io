/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Grid as Grid2D, Square as Square2D } from './2d/grid';
import { Grid as Grid3D, Square as Square3D } from './3d/grid';

export const Grid = props => {
  return props.three ? (
    <Grid3D {...props}>{props.children}</Grid3D>
  ) : (
    <Grid2D {...props}>{props.children}</Grid2D>
  );
};

Grid.propTypes = {
  three: PropTypes.bool,
  children: PropTypes.any,
};

export const Square = props => {
  return props.three ? (
    <Square3D {...props}>{props.children}</Square3D>
  ) : (
    <Square2D {...props}>{props.children}</Square2D>
  );
};

Square.propTypes = {
  three: PropTypes.bool,
  children: PropTypes.any,
};
