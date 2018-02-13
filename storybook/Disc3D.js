/*
 * Copyright 2018 Google Inc.
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import { Disc } from 'boardgame.io/ui';

export class Disc3D extends React.Component {
  render() {
    return (
      <div style={{ padding: '50px' }}>
        <svg width={500} height={500} viewBox="0 0 1 1">
          <Disc r={1} x={2} y={2} />
        </svg>
      </div>
    );
  }
}
