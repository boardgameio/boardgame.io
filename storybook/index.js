/*
 * Copyright 2017 Google Inc.
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from "react";
import { storiesOf } from "@storybook/react";
import { action } from "@storybook/addon-actions";
import { Card } from "../src/ui/card";
import { Deck } from "../src/ui/deck";

class CardStory extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      flipped: false
    };
  }

  onClick = () => {
    this.setState({
      flipped: !this.state.flipped
    });
    // TODO: storybook action isn't working here?
    action("onClick");
  };

  render() {
    return (
      <div style={{ padding: "50px" }}>
        <Card
          flipped={this.state.flipped}
          onHover={action("onHover")}
          onClick={this.onClick}
        />
      </div>
    );
  }
}

storiesOf("Card", module).add("basic", () => <CardStory />);

class DeckStory extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      flipped: false
    };
  }

  onClick = () => {
    this.setState({
      flipped: !this.state.flipped
    });
    // TODO: storybook action isn't working here?
    action("onClick");
  };

  render() {
    const suits = ["spade", "diamond", "club", "heart"];
    const values = [
      "A",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "10",
      "J",
      "Q",
      "K"
    ];
    return (
      <div style={{ padding: "50px" }}>
        <Deck
          flipped={this.state.flipped}
          onHover={action("onHover")}
          onClick={this.onClick}
          cards={values}
        />
      </div>
    );
  }
}

storiesOf("Deck", module).add("basic", () => <DeckStory />);
