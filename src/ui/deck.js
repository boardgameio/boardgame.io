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

const Deck = ({ cards, ...rest }) => (
  <div className="bgio-deck" {...rest}>
    {cards.map((card, i) =>
      React.cloneElement(card, {
        key: i,
        className: i > 0 ? "no-hover" : "",
        isFaceUp: i === 0, // Only the top card should ever be face up
        style: {
          position: i ? "absolute" : "inherit",
          left: i * 3,
          zIndex: -i
        }
      })
    )}
  </div>
);

Deck.propTypes = {
  isFaceUp: PropTypes.bool,
  cards: PropTypes.arrayOf(PropTypes.node)
};

Deck.defaultProps = {
  cards: []
};

export { Deck };
