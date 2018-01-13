/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from "react";
import PropTypes from "prop-types";
import logo from "../../docs/logo.svg";
import "./card.css";

export class Card extends React.Component {
  static propTypes = {
    card: PropTypes.node,
    flipped: PropTypes.bool,
    onHover: PropTypes.func,
    onClick: PropTypes.func,
    style: PropTypes.object
  };

  static defaultProps = {
    flipped: false
  };

  constructor(props) {
    super(props);
  }

  onClick = () => {
    this.props.onClick();
  };

  onHover = () => {
    this.props.onHover();
  };

  renderCardFront() {
    return <div>{this.props.card || "Card"}</div>;
  }

  renderCardBack() {
    return (
      <div className="bgio-card__back">
        <img className="bgio-card__back__logo" src={logo} />
      </div>
    );
  }

  render() {
    return (
      <div
        className={"bgio-card" + " " + this.props.className}
        onMouseOver={this.onHover}
        onClick={this.onClick}
        style={this.props.style}
      >
        {this.props.flipped ? this.renderCardFront() : this.renderCardBack()}
      </div>
    );
  }
}
