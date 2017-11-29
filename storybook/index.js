/*
 * Copyright 2017 Google Inc.
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import { storiesOf } from '@storybook/react';
import { Card } from '../src/client/lib/card/card';

storiesOf('Card', module)
  .add('basic', () => (
    <Card />
  ));
