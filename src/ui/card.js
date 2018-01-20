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

const Card = ({ back, canHover, className, front, isFaceUp, ...rest }) => {
  const classNames = ["bgio-card"];
  if (!canHover) classNames.push("no-hover");
  if (className) classNames.push(className);

  return (
    <div className={classNames.join(" ")} {...rest}>
      {isFaceUp ? front : back}
    </div>
  );
};

Card.propTypes = {
  back: PropTypes.node,
  canHover: PropTypes.bool,
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
  canHover: true,
  front: <div className="bgio-card__front">Card</div>,
  isFaceUp: false
};

export { Card };
