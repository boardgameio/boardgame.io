/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import { UI } from './ui';
import { Card } from './card';
import { Deck, DeckImpl } from './deck';
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

Enzyme.configure({ adapter: new Adapter() });

const context = { genID: () => 0 };

describe('basic', () => {
  test('cards are rendered', () => {
    const deck = Enzyme.shallow(
      <UI>
        <Deck>
          <Card />
          <Card />
        </Deck>
      </UI>
    );
    expect(deck.find(Card)).toHaveLength(2);
  });

  test('custom class', () => {
    const deck = Enzyme.shallow(
      <DeckImpl className="custom" context={context} />
    );
    expect(deck.html()).toContain('custom');
  });
});

describe('onClick', () => {
  test('onClick not passed', () => {
    const root = Enzyme.mount(
      <UI>
        <Deck>
          <Card />
          <Card />
        </Deck>
      </UI>
    );
    root
      .find('DeckImpl')
      .instance()
      .onClick();
  });

  test('calls props.onClick - no top card', () => {
    const onClick = jest.fn();
    const deck = Enzyme.mount(<DeckImpl onClick={onClick} context={context} />);
    deck.instance().onClick();
    expect(onClick).not.toHaveBeenCalled();
  });

  test('calls props.onClick - top card', () => {
    const onClick = jest.fn();
    const deck = Enzyme.mount(
      <UI>
        <Deck onClick={onClick}>
          <Card data={'data'} />
        </Deck>
      </UI>
    );
    deck
      .find('DeckImpl')
      .instance()
      .onClick();
    expect(onClick).toHaveBeenCalledWith('data');
  });
});

describe('onDrop', () => {
  let root;
  let onDrop;

  beforeEach(() => {
    onDrop = jest.fn();
    root = Enzyme.mount(
      <UI>
        <Deck onDrop={onDrop} context={context}>
          <Card context={context} data={1} />
        </Deck>
      </UI>
    );
  });

  test('onDrop not passed', () => {
    const deck = Enzyme.mount(<DeckImpl context={context} />);
    deck.instance().onDrop();
  });

  test('calls props.onDrop', () => {
    const onDrop = jest.fn();
    const deck = Enzyme.mount(<DeckImpl onDrop={onDrop} context={context} />);
    deck.instance().onDrop({ id: '0' });
    expect(onDrop).toHaveBeenCalled();
  });

  test('but not if dropped on same deck', () => {
    const cardData = root.find('CardImpl').instance().props.data;
    const deck = root.find('DeckImpl').instance();
    deck.onDrop(cardData);
    expect(onDrop).not.toHaveBeenCalled();
  });

  test('cardData undefined', () => {
    const deck = root.find('DeckImpl').instance();
    deck.onDrop();
    expect(onDrop).toHaveBeenCalled();
  });
});

test('splayWidth', () => {
  const cards = [
    <Card key={0} />,
    <Card key={1} />,
    <Card key={2} />,
    <Card key={3} />,
  ];
  const splayWidth = 10;
  const deck = Enzyme.shallow(
    <UI>
      <Deck splayWidth={splayWidth}>{cards}</Deck>
    </UI>
  );

  deck.find('.bgio-card').forEach((node, index) => {
    expect(node.props().style.left).toEqual(splayWidth * index);
  });
});
