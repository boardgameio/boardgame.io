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
import All from './example-all';
import AllOnce from './example-all-once';
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
      const { phase } = this.props.ctx;
      return (
        <div className="table-interior">
          <label>phase</label>
          <div className="phase">{phase || 'null'}</div>
        </div>
      );
    }

    let className = 'player';
    let active = false;
    let current = false;
    let stage;
    let onClick = () => {};

    if (this.props.ctx.activePlayers) {
      if (this.props.playerID in this.props.ctx.activePlayers) {
        className += ' active';
        active = true;
        stage = this.props.ctx.activePlayers[this.props.playerID];
      }
    } else {
      if (this.props.playerID === this.props.ctx.currentPlayer) {
        className += ' active';
        active = true;
      }
    }

    if (this.props.playerID == this.props.ctx.currentPlayer) {
      className += ' current';
      current = true;
    }

    const moves = Object.entries(this.props.moves)
      .filter(e => !(e[0] === 'play' && stage === 'discard'))
      .filter(e => !(e[0] === 'discard' && stage !== 'discard'))
      .map(e => (
        <button key={e[0]} onClick={() => e[1]()}>
          {e[0]}
        </button>
      ));

    const events = Object.entries(this.props.events)
      .filter(() => current && active)
      .filter(e => e[0] != 'setActivePlayers')
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

        {stage !== undefined && (
          <div className="stage-label">
            stage <span className="stage">{stage || "''"}</span>
          </div>
        )}

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
  all: All,
  'all-once': AllOnce,
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
            className={this.type === 'all' ? 'active' : ''}
            onClick={() => this.init('all')}
          >
            ALL
          </div>
          <div
            className={this.type === 'all-once' ? 'active' : ''}
            onClick={() => this.init('all-once')}
          >
            ALL_ONCE
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
