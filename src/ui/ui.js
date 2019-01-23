/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { UI as UI2D } from './2d/ui';
import { UI as UI3D } from './3d/ui';

/**
 * Root component of the UI framework.
 */
export const UI = props => {
  return props.three ? (
    <UI3D {...props}>{props.children}</UI3D>
  ) : (
    <UI2D {...props}>{props.children}</UI2D>
  );
};

UI.propTypes = {
  three: PropTypes.bool,
  children: PropTypes.any,
};
