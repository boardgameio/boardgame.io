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

/**
 * Root element of the React based 2D UI framework.
 */
export class UI extends React.Component {
  static propTypes = {
    children: PropTypes.any,
  };

  constructor(props) {
    super(props);
    this._nextID = 1;
  }

  getContext = () => {
    return {
      genID: () => this._nextID++,
    };
  };

  render() {
    return (
      <UIContext.Provider value={this.getContext()}>
        <div className="bgio-ui">{this.props.children}</div>
      </UIContext.Provider>
    );
  }
}
