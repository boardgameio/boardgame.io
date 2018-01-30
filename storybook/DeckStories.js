/*
 * Copyright 2018 Google Inc.
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import { action } from '@storybook/addon-actions';
import { Card, Deck } from 'boardgame.io/ui';

import { PlayingCard, standardDeck } from './PlayingCard';

export class StandardDeckStory extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedCard: null,
      deck: standardDeck,
    };
  }

  onDiscard = () => {
    action('discarded')(this.state.selectedCard);
    this.setState({ selectedCard: null });
  };

  onClick = card => {
    const selectedCard = card.props;
    action('onClick')(selectedCard);
    this.setState({ selectedCard });
  };

  renderCard = card => (
    <Card
      front={<PlayingCard suit={card.suit} value={card.value} />}
      card={card}
    />
  );

  render() {
    const { selectedCard, deck } = this.state;

    return (
      <div style={{ display: 'block', padding: '50px' }}>
        <Deck onClick={this.onClick} cards={deck.map(this.renderCard)} />

        {this.state.selectedCard && (
          <div style={{ display: 'block', padding: '50px' }}>
            <div>Selected Card:</div>
            <Card
              front={
                <PlayingCard
                  suit={selectedCard.card.suit}
                  value={selectedCard.card.value}
                />
              }
              card={selectedCard}
              isFaceUp
            />
            <button onClick={this.onDiscard} style={{ marginTop: '24px' }}>
              Discard
            </button>
          </div>
        )}
      </div>
    );
  }
}
