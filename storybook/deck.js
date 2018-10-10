/*
 * Copyright 2018 The boardgame.io Authors.
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import { storiesOf } from '@storybook/react';
import { StandardDeckStory } from './deck-stories';

storiesOf('Deck', module).add('Standard Deck of Playing Cards', () => (
  <StandardDeckStory />
));
