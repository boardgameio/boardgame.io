/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { Card } from './card';
import { Deck } from './deck';
import { UI } from './ui';

Enzyme.configure({ adapter: new Adapter() });

beforeEach(() => {
  jest.resetModules();
});

describe('basic', () => {
  let root;
  beforeEach(() => {
    root = Enzyme.mount(
      <UI>
        <div>
          <Deck>
            <Card />
          </Deck>
        </div>

        <div />

        <Card />
      </UI>
    );
  });

  test('is rendered', () => {
    expect(root.find(Deck)).toHaveLength(1);
    expect(root.find(Card)).toHaveLength(2);
  });
});
