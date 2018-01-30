/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import PropTypes from 'prop-types';
import './deck.css';

class Deck extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      cards: props.cards,
    };
  }

  onClick = () => {
    const cards = [...this.state.cards];
    const topCard = cards.shift();

    if (this.props.onClick) this.props.onClick(topCard);

    this.setState({
      cards,
    });
  };

  render() {
    const { className, splayWidth, ...rest } = this.props;
    const { cards } = this.state;
    const classNames = ['bgio-deck'];
    if (className) classNames.push(className);

    return (
      <div className={classNames.join(' ')} {...rest} onClick={this.onClick}>
        {cards.map((card, i) =>
          React.cloneElement(card, {
            key: i,
            canHover: i === 0, // Only the top card should apply a css hover effect
            isFaceUp: i === 0, // Only the top card should ever be face up
            style: {
              position: i ? 'absolute' : 'inherit',
              left: i * splayWidth,
              zIndex: -i,
            },
          })
        )}
      </div>
    );
  }
}

Deck.propTypes = {
  className: PropTypes.string,
  cards: PropTypes.arrayOf(PropTypes.node),
  onClick: PropTypes.func,
  splayWidth: PropTypes.number,
};

Deck.defaultProps = {
  cards: [],
  splayWidth: 3,
};

export { Deck };
