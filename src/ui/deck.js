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
import { Deck as Deck2D } from './2d/deck';
import { Deck as Deck3D } from './3d/deck';

export const Deck = props => (
  <UIContext.Consumer>
    {context =>
      context.three ? (
        <Deck3D {...props} context={context} />
      ) : (
        <Deck2D {...props} context={context} />
      )
    }
  </UIContext.Consumer>
);

Deck.propTypes = {
  children: PropTypes.any,
};
