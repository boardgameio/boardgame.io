/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from "react";
import PropTypes from "prop-types";
import Logo from "./logo";
import "./card.css";

const Card = ({ back, className, front, isFaceUp, ...rest }) => (
  <div className={"bgio-card " + className} {...rest}>
    {isFaceUp ? front : back}
  </div>
);

Card.propTypes = {
  back: PropTypes.node,
  className: PropTypes.string,
  front: PropTypes.node,
  isFaceUp: PropTypes.bool
};

Card.defaultProps = {
  back: (
    <div className="bgio-card__back">
      <Logo width="48" />
    </div>
  ),
  className: "",
  front: <div className="bgio-card__front">Card</div>,
  isFaceUp: false
};

export { Card };
