/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import PropTypes from 'prop-types';
import Draggable from 'react-draggable';
import Logo from './logo';
import './card.css';

const Card = ({ back, isDraggable, className, front, isFaceUp, ...rest }) => {
  const classNames = ['bgio-card'];
  if (className) classNames.push(className);

  const body = (
    <div className={classNames.join(' ')} {...rest}>
      {isFaceUp ? front : back}
    </div>
  );

  if (!isDraggable) {
    return body;
  }

  return <Draggable>{body}</Draggable>;
};

Card.propTypes = {
  back: PropTypes.node,
  className: PropTypes.string,
  front: PropTypes.node,
  isFaceUp: PropTypes.bool,
  isDraggable: PropTypes.bool,
};

Card.defaultProps = {
  back: (
    <div className="bgio-card__back">
      <Logo width="48" />
    </div>
  ),
  front: <div className="bgio-card__front">Card</div>,
  isFaceUp: false,
  isDraggable: false,
};

export { Card };
