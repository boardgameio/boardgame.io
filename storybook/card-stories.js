/*
 * Copyright 2018 Google Inc.
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import { action } from '@storybook/addon-actions';
import { Card } from 'boardgame.io/ui';

import { PlayingCard, standardDeck } from './playing-card';

export class FlippableStory extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isFaceUp: false,
    };
  }

  onClick = () => {
    this.setState({
      isFaceUp: !this.state.isFaceUp,
    });

    action('onClick')();
  };

  render() {
    return (
      <div style={{ padding: '50px' }}>
        <Card isFaceUp={this.state.isFaceUp} onClick={this.onClick} />
      </div>
    );
  }
}

export class PlayingCardStory extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isFaceUp: false,
    };
  }

  onClick = () => {
    this.setState({
      isFaceUp: !this.state.isFaceUp,
    });

    action('onClick')();
  };

  render() {
    const card = standardDeck[0];

    return (
      <div style={{ padding: '50px' }}>
        <Card
          front={<PlayingCard suit={card.suit} value={card.value} />}
          isFaceUp={this.state.isFaceUp}
          onClick={this.onClick}
        />
      </div>
    );
  }
}
