/*
 * Copyright 2018 The boardgame.io Authors.
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import { storiesOf } from '@storybook/react';
import { Disc3D, WoodComponent } from './Disc3D';

storiesOf('Token', module)
  .add('3D Disc', () => <Disc3D />)
  .add('Wood', () => <WoodComponent />);
