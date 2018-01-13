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

    const deck = [];
    const suits = ["♠", "♦", "♣", "♥"];
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

    suits.forEach(suit => {
      values.forEach(value => {
        deck.push({
          suit,
          value
        });
      });
    });

    this.state = {
      deck: deck,
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

  renderCard = card => (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        color: card.suit === "♥" || card.suit === "♦" ? "red" : "black"
      }}
    >
      <div
        style={{
          position: "absolute",
          display: "flex",
          top: "8px",
          left: "8px"
        }}
      >
        <div style={{ position: "relative" }}>{card.value}</div>
        <div style={{ position: "relative" }}>{card.suit}</div>
      </div>
      <div
        style={{
          display: "flex",
          fontSize: "64px"
        }}
      >
        {card.value}
      </div>
      <div
        style={{
          position: "absolute",
          display: "flex",
          bottom: "8px",
          right: "8px",
          transform: "rotate(180deg)"
        }}
      >
        <div style={{ position: "relative" }}>{card.value}</div>
        <div style={{ position: "relative" }}>{card.suit}</div>
      </div>
      <div
        style={{
          position: "absolute",
          display: "flex"
        }}
      >
        <div
          style={{
            position: "relative",
            fontSize: "128px",
            color: "#eee",
            zIndex: "-1"
          }}
        >
          {card.suit}
        </div>
      </div>
    </div>
  );

  render() {
    return (
      <div style={{ padding: "50px" }}>
        <Deck
          flipped={this.state.flipped}
          onHover={action("onHover")}
          onClick={this.onClick}
          cards={this.state.deck.map(this.renderCard)}
        />
      </div>
    );
  }
}

storiesOf("Deck", module).add("basic", () => <DeckStory />);
