/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import PropTypes from 'prop-types';
import UIContext from '../ui-context';

export class DeckImpl extends React.Component {
  static propTypes = {
    context: PropTypes.any,
  };

  constructor(props) {
    super(props);
    this.id = props.context.genID();
  }

  render() {
    return null;
  }
}

const Deck = props => (
  <UIContext.Consumer>
    {context => <DeckImpl {...props} context={context} />}
  </UIContext.Consumer>
);

export { Deck };
