/*
 * Copyright 2018 The boardgame.io Authors.
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { withKnobs, boolean, number } from '@storybook/addon-knobs/react';
import { HexGrid, Token } from 'boardgame.io/ui';
import { MeepleSVG, WheatSVG, WoodSVG, Disc3DSVG } from 'boardgame.io/ui';

function Basic() {
  const levels = number('levels', 5);
  const outline = boolean('outline', true);
  const animate = boolean('animate', true);

  class Runner extends React.Component {
    state = { x: 0, y: 0, z: 0 };
    onClick = args => {
      this.setState(args);
      action('onClick')(args);
    };
    render = () => {
      return (
        <HexGrid levels={levels} outline={outline} onClick={this.onClick}>
          <Token
            x={this.state.x}
            y={this.state.y}
            z={this.state.z}
            animate={animate}
            // no template provided => HexGrid will inject Hex by default.
            style={{ fill: '#555' }}
          />
        </HexGrid>
      );
    };
  }

  return (
    <div style={{ padding: '50px' }}>
      <Runner />
    </div>
  );
}

function BasicTokens() {
  const levels = number('levels', 5);
  const outline = boolean('outline', true);
  const animate = boolean('animate', true);

  class Runner extends React.Component {
    state = { x: 0, y: 0, z: 0 };
    onClick = args => {
      this.setState(args);
      action('onClick')(args);
    };
    render = () => {
      const meepleParade = ['blue', 'green', 'yellow', 'red'].map(
        (color, i) => <Token x={i} y={0} z={-1} key={i} template={MeepleSVG} />
      );

      const otherTokens = [WoodSVG, WheatSVG, Disc3DSVG].map((template, i) => (
        <Token x={i} y={0} z={1} key={i + 1000} template={template} />
      ));

      return (
        <HexGrid levels={levels} outline={outline} onClick={this.onClick}>
          <Token
            key="-1"
            x={this.state.x}
            y={this.state.y}
            z={this.state.z}
            animate={animate}
            // no template provided => HexGrid will inject Hex by default.
            style={{ fill: '#555' }}
          />

          {meepleParade}
          {otherTokens}
        </HexGrid>
      );
    };
  }

  return (
    <div style={{ padding: '50px' }}>
      <Runner />
    </div>
  );
}

storiesOf('HexGrid', module)
  .addDecorator(withKnobs)
  .add('basic', Basic)
  .add('tokens', BasicTokens);
