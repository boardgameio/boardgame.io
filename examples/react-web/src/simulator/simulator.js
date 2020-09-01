/*
 * Copyright 2018 The boardgame.io Authors.
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import { Client } from 'boardgame.io/react';
import { Local } from 'boardgame.io/multiplayer';
import All from './example-all';
import AllOnce from './example-all-once';
import Others from './example-others';
import OthersOnce from './example-others-once';
import './simulator.css';

function Board({ ctx, moves, events, playerID }) {
  if (playerID === null) {
    return <div className="table-interior"></div>;
  }

  let className = 'player';
  let active = false;
  let current = false;
  let stage;
  let onClick = () => {};

  if (ctx.activePlayers) {
    if (playerID in ctx.activePlayers) {
      className += ' active';
      active = true;
      stage = ctx.activePlayers[playerID];
    }
  } else {
    if (playerID === ctx.currentPlayer) {
      className += ' active';
      active = true;
    }
  }

  if (playerID == ctx.currentPlayer) {
    className += ' current';
    current = true;
  }

  moves = Object.entries(moves)
    .filter(e => !(e[0] === 'play' && stage === 'discard'))
    .filter(e => !(e[0] === 'discard' && stage !== 'discard'))
    .map(e => (
      <button key={e[0]} onClick={() => e[1]()}>
        {e[0]}
      </button>
    ));

  events = Object.entries(events)
    .filter(() => current && active)
    .filter(e => e[0] != 'setActivePlayers')
    .filter(e => e[0] != 'setStage')
    .filter(e => e[0] != 'endStage')
    .map(e => (
      <button key={e[0]} onClick={() => e[1]()}>
        {e[0]}
      </button>
    ));

  return (
    <div className="player-wrap">
      <span className={className} onClick={onClick}>
        {playerID}
      </span>

      <div className="controls">
        {active && moves}
        {events}
      </div>
    </div>
  );
}

const examples = {
  'others-once': OthersOnce,
  all: All,
  'all-once': AllOnce,
  others: Others,
};

class App extends React.Component {
  constructor(props) {
    super(props);
    this.init('all');
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
      multiplayer: Local(),
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
      players.push(<App key={i} matchID={this.type} playerID={i + ''} />);
    }

    return (
      <div id="turnorder">
        <div className="turnorder-options">
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
        </div>

        <div className="turnorder-content">
          <div className="player-container">
            <App matchID={this.type} />
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
