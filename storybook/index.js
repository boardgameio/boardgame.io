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
import Checkerboard from '../src/ui/checkerboard';

storiesOf('Card', module)
  .add('basic', () => (
    <div style={{ padding: '50px' }} >
    <Card onHover={action('onHover')}
          onClick={action('onClick')} />
    </div>
  ));

storiesOf('Chess', module)
  .add('chess board', () => (
    <Checkerboard style={{width: '500px'}} onClick={action('onClick')}/>
  ))
  // https://en.wikipedia.org/wiki/Double_Chess
  .add('"double chess" board', () => (
    <Checkerboard rows={12} cols={16} style={{width: '500px'}}
                  onClick={action('onClick')}/>
  ))
  // https://en.wikipedia.org/wiki/Chess_on_a_Really_Big_Board
  .add('"chess on really big board" board', () => (
    <Checkerboard rows={16} cols={16} style={{width: '500px'}}
                  onClick={action('onClick')}/>
  ));
