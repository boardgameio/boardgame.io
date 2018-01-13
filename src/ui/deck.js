/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from "react";
import PropTypes from "prop-types";
import "./deck.css";

import { Card } from "./card";

export class Deck extends React.Component {
  static propTypes = {
    flipped: PropTypes.bool,
    cards: PropTypes.array,
    onHover: PropTypes.func,
    onClick: PropTypes.func
  };

  static defaultProps = {
    cards: []
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

  render() {
    return (
      <div
        className="bgio-deck"
        onMouseOver={this.onHover}
        onClick={this.onClick}
      >
        {this.props.cards.map((card, i) => {
          console.log(card, i);
          return (
            <Card
              key={i}
              onClick={() => ({})}
              onHover={() => ({})}
              //   card={card}
              className={i > 0 && "no-hover"}
              flipped={i === 0 && this.props.flipped} // Only the top card should ever be flipped
              style={{
                position: i ? "absolute" : "inherit",
                left: i * 2,
                zIndex: -i
              }}
            />
          );
        })}
      </div>
    );
  }
}
