/*
 * Copyright 2017 Google Inc.
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from "react";
import { storiesOf } from "@storybook/react";

import { FlippableStory, PlayingCardStory } from "./CardStories";
import { DeckStory } from "./DeckStory";

storiesOf("Card", module).add("Flippable Card", () => <FlippableStory />);
storiesOf("Card", module).add("Standard Playing Card", () => (
  <PlayingCardStory />
));
storiesOf("Deck", module).add("basic", () => <DeckStory />);
