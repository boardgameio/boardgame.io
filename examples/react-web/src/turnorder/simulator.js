/*
 * Copyright 2018 The boardgame.io Authors.
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Client } from 'boardgame.io/react';
import Default from './example-default';
import Once from './example-once';
import Custom from './example-custom';
import CustomFrom from './example-custom-from';
import Any from './example-any';
import AnyOnce from './example-any-once';
import Others from './example-others';
import OthersOnce from './example-others-once';
import './simulator.css';

class Board extends React.Component {
  static propTypes = {
    G: PropTypes.any.isRequired,
    ctx: PropTypes.any.isRequired,
    moves: PropTypes.any,
    events: PropTypes.any,
    playerID: PropTypes.any,
  };

  render() {
    if (this.props.playerID === null) {
      return (
        <div className="table-interior">
          <label>phase</label>
          <div className="phase">{this.props.ctx.phase}</div>
        </div>
      );
    }

    let className = 'player';
    let active = false;
    let current = false;
    let onClick = () => {};

    if (this.props.ctx.actionPlayers.includes(this.props.playerID)) {
      className += ' active';
      active = true;
    }

    if (this.props.playerID == this.props.ctx.currentPlayer) {
      className += ' current';
      current = true;
    }

    const moves = Object.entries(this.props.moves).map(e => (
      <button key={e[0]} onClick={() => e[1]()}>
        {e[0]}
      </button>
    ));

    const events = Object.entries(this.props.events)
      .filter(() => current && active)
      .filter(e => e[0] != 'setActionPlayers')
      .map(e => (
        <button key={e[0]} onClick={() => e[1]()}>
          {e[0]}
        </button>
      ));

    return (
      <div className="player-wrap">
        <span className={className} onClick={onClick}>
          {this.props.playerID}
        </span>

        <div className="controls">
          {active && moves}
          {events}
        </div>
      </div>
    );
  }
}

const examples = {
  default: Default,
  'others-once': OthersOnce,
  once: Once,
  custom: Custom,
  'custom-from': CustomFrom,
  any: Any,
  'any-once': AnyOnce,
  others: Others,
};

class App extends React.Component {
  constructor(props) {
    super(props);
    this.init('default');
  }

  init(type) {
    let shouldUpdate = false;
    if (this.client !== undefined) {
      shouldUpdate = true;
    }

    this.type = type;
    this.description = examples[type].description;
    this.client = Client({
      game: examples[type].game,
      numPlayers: 6,
      debug: false,
      board: Board,
      multiplayer: { local: true },
    });

    if (shouldUpdate) {
      this.forceUpdate();
    }
  }

  render() {
    const Description = this.description;
    const App = this.client;

    let players = [];
    for (let i = 0; i < 6; i++) {
      players.push(<App key={i} gameID={this.type} playerID={i + ''} />);
    }

    return (
      <div id="turnorder">
        <div className="turnorder-options">
          <div
            className={this.type === 'default' ? 'active' : ''}
            onClick={() => this.init('default')}
          >
            DEFAULT
          </div>
          <div
            className={this.type === 'once' ? 'active' : ''}
            onClick={() => this.init('once')}
          >
            ONCE
          </div>
          <div
            className={this.type === 'any' ? 'active' : ''}
            onClick={() => this.init('any')}
          >
            ANY
          </div>
          <div
            className={this.type === 'any-once' ? 'active' : ''}
            onClick={() => this.init('any-once')}
          >
            ANY_ONCE
          </div>
          <div
            className={this.type === 'others' ? 'active' : ''}
            onClick={() => this.init('others')}
          >
            OTHERS
          </div>
          <div
            className={this.type === 'others-once' ? 'active' : ''}
            onClick={() => this.init('others-once')}
          >
            OTHERS_ONCE
          </div>
          <div
            className={this.type === 'custom' ? 'active' : ''}
            onClick={() => this.init('custom')}
          >
            CUSTOM
          </div>
          <div
            className={this.type === 'custom-from' ? 'active' : ''}
            onClick={() => this.init('custom-from')}
          >
            CUSTOM_FROM
          </div>
        </div>

        <div className="turnorder-content">
          <div className="player-container">
            <App gameID={this.type} />
            <span>{players}</span>
          </div>
          <div className="description">
            <Description />
          </div>
        </div>
      </div>
    );
  }
}

export default App;
