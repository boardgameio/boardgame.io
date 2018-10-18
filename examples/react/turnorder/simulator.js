/*
 * Copyright 2018 The boardgame.io Authors.
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Game } from 'boardgame.io/core';
import { Client } from 'boardgame.io/react';
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
      <button key={e[0]} onClick={e[1]}>
        {e[0]}
      </button>
    ));

    const events = Object.entries(this.props.events)
      .filter(e => e[0] != 'setActionPlayers')
      .filter(e => current || e[0] != 'endTurn')
      .map(e => (
        <button key={e[0]} onClick={e[1]}>
          {e[0]}
        </button>
      ));

    return (
      <div>
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

const Default = () => <div />;

const Militia = () => <div />;

const examples = {
  default: {
    desc: Default,
    game: Game({}),
  },

  militia: {
    desc: Militia,
    game: Game({
      flow: { setActionPlayers: true },

      moves: {
        play(G, ctx) {
          ctx.events.setActionPlayers({ allOthers: true, once: true });
          return G;
        },

        discard(G) {
          return G;
        },
      },
    }),
  },
};

class App extends React.Component {
  constructor(props) {
    super(props);
    this.init('militia');
  }

  init(type) {
    this.desc = examples[type].desc;

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
    const Description = this.desc;
    const App = this.client;

    let players = [];
    for (let i = 0; i < 6; i++) {
      players.push(<App key={i} playerID={i + ''} />);
    }

    return (
      <div className="turnorder-simulator">
        <div className="options">
          <button onClick={() => this.init('default')}>default</button>
          <button onClick={() => this.init('militia')}>militia</button>
        </div>

        <Description />

        <div className="player-container">{players}</div>
      </div>
    );
  }
}

export default App;
