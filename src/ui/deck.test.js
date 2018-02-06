/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import { Card } from './card';
import { Deck } from './deck';
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

Enzyme.configure({ adapter: new Adapter() });

test('basic', () => {
  const cards = [<Card key={0} />, <Card key={1} />];

  {
    const deck = Enzyme.shallow(<Deck cards={cards} />);
    expect(deck.html()).toContain('svg');
  }

  {
    const deck = Enzyme.shallow(<Deck className="custom" cards={cards} />);
    expect(deck.html()).toContain('custom');
  }
});

test('onClick', () => {
  const cards = [<Card key={0} />, <Card key={1} />];

  {
    const deck = Enzyme.mount(<Deck cards={cards} />);
    expect(deck.state().cards.length).toBe(2);
    deck.simulate('click');
    expect(deck.state().cards.length).toBe(1);
  }

  {
    const onClick = jest.fn();
    const deck = Enzyme.mount(<Deck onClick={onClick} cards={cards} />);
    deck.simulate('click');
    expect(onClick).toHaveBeenCalled();
  }
});

test('update cards prop', () => {
  const oldCards = [<Card key={0} />, <Card key={1} />];
  const newCards = [<Card key={0} />];

  const deck = Enzyme.mount(<Deck cards={oldCards} />);
  expect(deck.state().cards.length).toBe(2);
  deck.setProps({ cards: newCards });
  expect(deck.state().cards.length).toBe(1);
  deck.setProps({ cards: newCards });
  expect(deck.state().cards.length).toBe(1);
});

test('splayWidth', () => {
  const cards = [
    <Card key={0} />,
    <Card key={1} />,
    <Card key={2} />,
    <Card key={3} />,
  ];
  const splayWidth = 10;
  const deck = Enzyme.mount(<Deck cards={cards} splayWidth={splayWidth} />);

  deck.find('.bgio-card').forEach((node, index) => {
    expect(node.props().style.left).toEqual(splayWidth * index);
  });
});
