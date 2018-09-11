/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Token as Token2D } from './2d/token';
import { Token as Token3D } from './3d/token';

export const Token = props => {
  return props.three ? (
    <Token3D {...props}>{props.children}</Token3D>
  ) : (
    <Token2D {...props}>{props.children}</Token2D>
  );
};

Token.propTypes = {
  three: PropTypes.bool,
  children: PropTypes.any,
};
