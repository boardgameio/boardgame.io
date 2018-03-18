/*
 * Copyright 2018 The boardgame.io Authors.
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs } from '@storybook/addon-knobs/react';
import { Dice } from 'boardgame.io/ui';

function Basic() {
  return (
    <div style={{ padding: '50px' }}>
      <Dice value={1} />
      <Dice value={2} />
      <Dice value={3} />
      <Dice value={4} />
      <Dice value={5} />
      <Dice value={6} />
      <Dice value={7} />
      <Dice value={8} />
      <Dice value={9} />
      <Dice value={10} />
    </div>
  );
}

storiesOf('Dice', module)
  .addDecorator(withKnobs)
  .add('basic', Basic);
