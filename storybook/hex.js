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
import { HexGrid, Token, HexUtils } from 'boardgame.io/ui';

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
    render = () => (
      <HexGrid levels={levels} outline={outline} onClick={this.onClick}>
        <Token
          x={this.state.x}
          y={this.state.y}
          z={this.state.z}
          animate={animate}
          style={{ fill: '#555' }}
        />
      </HexGrid>
    );
  }

  return (
    <div style={{ padding: '50px' }}>
      <Runner />
    </div>
  );
}

function GetRange() {
  const levels = number('levels', 5);
  const distance = number('distance', 2);
  const outline = boolean('outline', true);

  class Runner extends React.Component {
    state = { tokens: HexUtils.getRange({ x: 0, y: 0, z: 0 }, distance) };
    render = () => (
      <HexGrid levels={levels} outline={outline}>
        {this.state.tokens.map((t, index) => {
          return (
            <Token
              key={index}
              x={t.x}
              y={t.y}
              z={t.z}
              style={{ fill: '#555' }}
            />
          );
        })}
      </HexGrid>
    );
  }

  return (
    <div style={{ padding: '50px' }}>
      <Runner />
    </div>
  );
}

function TokenTrail() {
  const levels = number('levels', 5);
  const outline = boolean('outline', true);
  const animate = boolean('animate', true);

  class Runner extends React.Component {
    state = { tokens: [] };
    onMouseOver = args => {
      if (!this.state.tokens.includes(JSON.stringify(args))) {
        const tokenCollection = this.state.tokens.concat(JSON.stringify(args));
        this.setState({ tokens: tokenCollection });
      }
      action('onMouseOver')(args);
    };
    render = () => (
      <HexGrid levels={levels} outline={outline} onMouseOver={this.onMouseOver}>
        {this.state.tokens.map((token, index) => {
          const t = JSON.parse(token);
          return (
            <Token
              key={index}
              x={t.x}
              y={t.y}
              z={t.z}
              animate={animate}
              style={{ fill: '#555' }}
            />
          );
        })}
      </HexGrid>
    );
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
  .add('Get range', GetRange)
  .add('Tokens placed on hover', TokenTrail);
