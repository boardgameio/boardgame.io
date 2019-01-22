/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import PropTypes from 'prop-types';
import UIContext from './ui-context';
import { Card as Card2D } from './2d/card';
import { Card as Card3D } from './3d/card';

export const Card = props => (
  <UIContext.Consumer>
    {context =>
      context.three ? (
        <Card3D {...props} context={context} />
      ) : (
        <Card2D {...props} context={context} />
      )
    }
  </UIContext.Consumer>
);

Card.propTypes = {
  children: PropTypes.any,
};
