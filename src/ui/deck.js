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
import { Droppable } from 'react-dragtastic';
import './deck.css';

export class DeckImpl extends React.Component {
  static propTypes = {
    context: PropTypes.any,
    children: PropTypes.any,
    onClick: PropTypes.func,
    onDrop: PropTypes.func,
    splayWidth: PropTypes.number,
    dragZone: PropTypes.string,
    padding: PropTypes.number,
    className: PropTypes.string,
  };

  static defaultProps = {
    padding: 10,
    splayWidth: 3,
    dragZone: 'bgio-card',
    onDrop: () => {},
    onClick: () => {},
  };

  constructor(props) {
    super(props);
    this.id = props.context.genID();
  }

  onClick = () => {
    const cards = React.Children.toArray(this.props.children);
    let topCardProps = null;

    if (cards.length > 0) {
      topCardProps = cards[cards.length - 1].props;
      this.props.onClick(topCardProps.data);
    }
  };

  onDrop = cardData => {
    // Don't fire onDrop if the top card of this deck was
    // dragged away and then dropped back.
    let isChild = false;
    React.Children.forEach(this.props.children, card => {
      if (cardData !== undefined && card.props.data === cardData) {
        isChild = true;
      }
    });

    if (!isChild) {
      this.props.onDrop(cardData);
    }
  };

  render() {
    let cardIndex = 0;
    const cards = React.Children.map(this.props.children, card =>
      React.cloneElement(card, {
        dragZone: this.props.dragZone,
        inDeck: true,
        deckPosition: cardIndex++,
      })
    );

    return (
      <div onClick={this.onClick}>
        <Droppable accepts={this.props.dragZone} onDrop={this.onDrop}>
          {({ events }) => {
            return (
              <div
                {...events}
                className={this.props.className}
                style={{
                  background: '#eee',
                  marginRight: 20,
                  padding: this.props.padding,
                  position: 'relative',
                  width: '100px',
                  height: '140px',
                  display: 'block',
                  float: 'left',
                }}
              >
                {cards}
              </div>
            );
          }}
        </Droppable>
      </div>
    );
  }
}

const Deck = props => (
  <UIContext.Consumer>
    {context => <DeckImpl {...props} context={context} />}
  </UIContext.Consumer>
);

export { Deck };
