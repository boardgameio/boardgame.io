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
import Militia from './example-militia';
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

    const moves = Object.entries(this.props.moves)
      .filter(
        e =>
          this.props.ctx.allowedMoves === null ||
          this.props.ctx.allowedMoves.includes(e[0])
      )
      .map(e => (
        <button key={e[0]} onClick={e[1]}>
          {e[0]}
        </button>
      ));

    const events = Object.entries(this.props.events)
      .filter(() => current && active)
      .filter(e => e[0] != 'setActionPlayers')
      .map(e => (
        <button key={e[0]} onClick={e[1]}>
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
  militia: Militia,
};

class App extends React.Component {
  constructor(props) {
    super(props);
    this.init('default');
  }

  init(type) {
    this.type = type;
    this.description = examples[type].description;
    this.client = Client({
      game: examples[type].game,
      numPlayers: 6,
      debug: false,
      board: Board,
      multiplayer: { local: true },
    });

    this.forceUpdate();
  }

  render() {
    const Description = this.description;
    const App = this.client;

    let players = [];
    for (let i = 0; i < 6; i++) {
      players.push(<App key={i} playerID={i + ''} />);
    }

    return (
      <div id="turnorder">
        <div className="turnorder-options">
          <div
            className={this.type === 'default' ? 'active' : ''}
            onClick={() => this.init('default')}
          >
            default
          </div>
          <div
            className={this.type === 'militia' ? 'active' : ''}
            onClick={() => this.init('militia')}
          >
            militia
          </div>
        </div>

        <div className="turnorder-content">
          <div className="player-container">
            <App />
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
