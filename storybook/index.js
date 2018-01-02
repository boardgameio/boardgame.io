/*
 * Copyright 2017 Google Inc.
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { Card } from '../src/ui/card';

storiesOf('Card', module)
  .add('basic', () => (
    <div style={{ padding: '50px' }} >
    <Card onHover={action('onHover')}
          onClick={action('onClick')} />
    </div>
  ));
