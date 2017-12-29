/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import PropTypes from 'prop-types';
import './card.css';

export class Card extends React.Component {
  static propTypes = {
    onHover: PropTypes.func,
    onClick: PropTypes.func
  }

  constructor(props) {
    super(props);
  }

  onClick = () => {
    this.props.onClick();
  }

  onHover = () => {
    this.props.onHover();
  }

  render() {
    return (
      <div className="bgio-card"
           onMouseOver={this.onHover}
           onClick={this.onClick}>
      Card
      </div>
    );
  }
}
