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
import { Card } from '../src/client/lib/card/card';
import ChessPiece from '../src/client/lib/chess/piece';

storiesOf('Card', module)
  .add('basic', () => (
    <div style={{ padding: '50px' }} >
    <Card onHover={action('onHover')}
          onClick={action('onClick')} />
    </div>
  ));

storiesOf('Chess', module)
  .add('king - light', () => (
      <svg style={{width: '500px'}} viewBox={'0 0 1 1'}>
        <ChessPiece type='k' color='light' x={0} y={0}
           onClick={action('onClick')}/>
      </svg>
  ))
  .add('king - dark', () => (
      <svg style={{width: '500px'}} viewBox={'0 0 1 1'}>
        <ChessPiece type='k' color='dark' x={0} y={0}
           onClick={action('onClick')}/>
      </svg>
  ))
  .add('knight - light', () => (
      <svg style={{width: '500px'}} viewBox={'0 0 1 1'}>
        <ChessPiece type='n'  color='light' x={0} y={0}
           onClick={action('onClick')}/>
      </svg>
  ))
  .add('knight - dark', () => (
      <svg style={{width: '500px'}} viewBox={'0 0 1 1'}>
        <ChessPiece type='n' color='dark' x={0} y={0}
           onClick={action('onClick')}/>
      </svg>
  ))
  .add('pawn - light', () => (
      <svg style={{width: '500px'}} viewBox={'0 0 1 1'}>
        <ChessPiece type='p' color='light' x={0} y={0}
           onClick={action('onClick')}/>
      </svg>
  ))
  .add('pawn - dark', () => (
      <svg style={{width: '500px'}} viewBox={'0 0 1 1'}>
        <ChessPiece type='p' color='dark' x={0} y={0}
           onClick={action('onClick')}/>
      </svg>
  ))
  .add('queen - light', () => (
      <svg style={{width: '500px'}} viewBox={'0 0 1 1'}>
        <ChessPiece type='q' color='light' x={0} y={0}
           onClick={action('onClick')}/>
      </svg>
  ))
  .add('queen - dark', () => (
      <svg style={{width: '500px'}} viewBox={'0 0 1 1'}>
        <ChessPiece type='q' color='dark' x={0} y={0}
           onClick={action('onClick')}/>
      </svg>
  ))
  .add('rook - light', () => (
      <svg style={{width: '500px'}} viewBox={'0 0 1 1'}>
        <ChessPiece type='r' color='light' x={0} y={0}
           onClick={action('onClick')}/>
      </svg>
  ))
  .add('rook - dark', () => (
      <svg style={{width: '500px'}} viewBox={'0 0 1 1'}>
        <ChessPiece type='r' color='dark' x={0} y={0}
           onClick={action('onClick')}/>
      </svg>
  ))
  .add('bishop - light', () => (
      <svg style={{width: '500px'}} viewBox={'0 0 1 1'}>
        <ChessPiece type='b' color='light' x={0} y={0}
           onClick={action('onClick')}/>
      </svg>
  ))
  .add('bishop - dark', () => (
      <svg style={{width: '500px'}} viewBox={'0 0 1 1'}>
        <ChessPiece type='b' color='dark' x={0} y={0}
           onClick={action('onClick')}/>
      </svg>
  ));
