/*
 * Copyright 2018 Google Inc.
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from "react";
import { action } from "@storybook/addon-actions";
import { Card } from "../src/ui/card";
import { Deck } from "../src/ui/deck";

import { PlayingCard, standardDeck } from "./PlayingCard";

export class DeckStory extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      deck: standardDeck
    };
  }

  onClick = () => {
    const deck = [...this.state.deck];
    const card = deck.shift();

    this.setState({
      deck
    });

    action("onClick")(card.value + card.suit + " removed");
  };

  renderCard = card => (
    <Card front={<PlayingCard suit={card.suit} value={card.value} />} />
  );

  render() {
    return (
      <div style={{ padding: "50px" }}>
        <Deck
          onClick={this.onClick}
          cards={this.state.deck.map(this.renderCard)}
        />
      </div>
    );
  }
}
