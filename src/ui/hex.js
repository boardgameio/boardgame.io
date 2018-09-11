/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Hex as Hex2D, HexGrid as HexGrid2D } from './2d/hex';
import { Hex as Hex3D, HexGrid as HexGrid3D } from './3d/hex';

export const Hex = props => {
  return props.three ? (
    <Hex3D {...props}>{props.children}</Hex3D>
  ) : (
    <Hex2D {...props}>{props.children}</Hex2D>
  );
};

Hex.propTypes = {
  three: PropTypes.bool,
  children: PropTypes.any,
};

export const HexGrid = props => {
  return props.three ? (
    <HexGrid3D {...props}>{props.children}</HexGrid3D>
  ) : (
    <HexGrid2D {...props}>{props.children}</HexGrid2D>
  );
};

HexGrid.propTypes = {
  three: PropTypes.bool,
  children: PropTypes.any,
};
