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

export class StandardDeckStory extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedCard: null
    };
  }

  onClick = card => {
    // this.setState({
    //   selectedCard: card
    // });
    const selectedCard = card.props;
    console.log(selectedCard);
    action("onClick")("ugh");
  };

  renderCard = card => (
    <Card front={<PlayingCard suit={card.suit} value={card.value} />} />
  );

  render() {
    return (
      <div style={{ padding: "50px" }}>
        <Deck
          onClick={this.onClick}
          cards={standardDeck.map(this.renderCard)}
        />
      </div>
    );
  }
}
