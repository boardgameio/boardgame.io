/*
 * Copyright 2018 The boardgame.io Authors.
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import { Client } from 'boardgame.io/react';
import Board from './board.js';
import Default from './example-default';
import Militia from './example-militia';
import './simulator.css';

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
