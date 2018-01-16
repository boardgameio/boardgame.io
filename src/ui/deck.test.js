/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from "react";
import { Card } from "./card";
import { Deck } from "./deck";
import Enzyme from "enzyme";
import Adapter from "enzyme-adapter-react-16";

Enzyme.configure({ adapter: new Adapter() });

test("basic", () => {
  const cards = [
    <Card key={0} />,
    <Card key={1} />,
  ];
  const deck = Enzyme.mount(<Deck cards={cards}/>);
  expect(deck.html()).toContain('svg');
});
